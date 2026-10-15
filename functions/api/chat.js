/**
 * ============================================================================
 * functions/api/chat.js — CodeTutor 代理的【同源版】(Cloudflare Pages Functions)
 * ============================================================================
 *
 * 【为什么要用它】
 * `*.workers.dev` 在国内网络经常被 DNS 污染 + SNI 阻断（实测会解析到 Facebook /
 * Twitter / Dropbox 的 IP，或 TLS 握手被 RST），表现就是前端报 "Failed to fetch"。
 * 而 Pages Functions 跑在**你自己的站点域名**下（例如 https://你的站点.pages.dev/api/chat）：
 *   · 同源请求 → 压根不涉及 CORS
 *   · 不依赖 workers.dev 域名 → 不受污染与阻断影响
 *   · 前端代理地址只需填 `/api/chat`
 *
 * 【目录结构】（放在 Pages 项目根目录，**不能**放进 dist/ 之类的静态输出目录）
 *   你的项目/
 *   ├── index.html
 *   └── functions/
 *       └── api/
 *           └── chat.js     ← 本文件，自动映射到路由 /api/chat
 *
 * 【怎么部署】（二选一，注意：控制台"拖拽上传"不支持 Functions！）
 *   方式 1：wrangler CLI（最快）
 *       npm i -g wrangler && wrangler login
 *       cd 你的项目            # 这个目录里同时有 index.html 和 functions/
 *       wrangler pages deploy . --project-name=code-tutor-site
 *       # ↑ project-name 必须与你现有的 Pages 项目名完全一致，否则会新建一个站点
 *
 *   方式 2：Git 集成
 *       把 index.html + functions/api/chat.js 推到 GitHub，在 Pages 里连仓库：
 *       构建命令留空，输出目录填 `.`，Pages 会自动把 functions/ 编译成 Functions。
 *
 *   官方文档：https://developers.cloudflare.com/pages/functions/get-started/
 *   （原文明确：functions 目录必须在 Pages 项目根目录；Dashboard 的 Direct Upload 不支持 Functions）
 *
 * 【部署后自测】
 *   浏览器打开 https://你的站点.pages.dev/api/chat
 *   应返回 {"ok":true,"service":"codelearn-proxy","deploy":"pages-function",...}
 *   然后在前端【API 设置】把代理地址填成：/api/chat
 *
 * 【安全说明】
 *   与前缀版本一致：不落盘、不写日志、不存密钥。apiKey 只在本次请求的内存中，
 *   用于拼一个 Authorization 头转发给上游，请求结束即释放。
 * ============================================================================
 */

/* 服务商注册表（OpenAI 兼容接口） */
const PROVIDERS = {
  deepseek: {
    label: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    defaultModel: 'deepseek-chat'
  },
  qwen: {
    label: '通义千问（DashScope 兼容模式）',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    defaultModel: 'qwen-plus'
  }
};

const PROXY_ID = 'codelearn-proxy';
const VERSION = '1.1.0';

/* 允许透传给上游的参数白名单 */
const PASSTHROUGH_FIELDS = [
  'temperature', 'top_p', 'max_tokens', 'presence_penalty',
  'frequency_penalty', 'stop', 'seed', 'response_format', 'stream'
];

/* ---------------------------------------------------------------------------
 * 通用响应工具
 * ------------------------------------------------------------------------- */
function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Expose-Headers': 'X-Proxy, X-Proxy-Version',
    'Vary': 'Origin',
    'X-Proxy': PROXY_ID,
    'X-Proxy-Version': VERSION
  };
}

function json(obj, status, request) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, corsHeaders(request))
  });
}

/* ---------------------------------------------------------------------------
 * 健康检查（前端「测试连接」第 1 步会 GET 这里做身份自检）
 * ------------------------------------------------------------------------- */
export async function onRequestGet(context) {
  return json({
    ok: true,
    service: PROXY_ID,
    version: VERSION,
    deploy: 'pages-function',              // 与 Worker 版区分，便于排查
    message: '同源 Pages Function 代理在线。前端代理地址填 /api/chat 即可。',
    providers: Object.keys(PROVIDERS),
    acceptedUploads: ['JSON body 的 apiKey 字段', 'Authorization: Bearer <key> 请求头'],
    time: new Date().toISOString()
  }, 200, context.request);
}

/* ---------------------------------------------------------------------------
 * 预检
 * ------------------------------------------------------------------------- */
export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
}

/* 其它方法一律 405 */
export async function onRequest(context) {
  return json({ error: { message: '仅支持 GET（健康检查）与 POST（对话请求）' } }, 405, context.request);
}

/* ---------------------------------------------------------------------------
 * 主逻辑：POST /api/chat
 * ------------------------------------------------------------------------- */
export async function onRequestPost(context) {
  const { request, env } = context;

  // 1) 请求体
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: { message: '请求体不是合法 JSON' } }, 400, request);
  }

  // 2) 参数校验
  const providerKey = String(body.provider || '').trim();
  const provider = PROVIDERS[providerKey];
  if (!provider) {
    return json({ error: { message: '不支持的服务商：' + providerKey + '（可选：' + Object.keys(PROVIDERS).join(' / ') + '）' } }, 400, request);
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json({ error: { message: 'messages 不能为空' } }, 400, request);
  }
  if (body.messages.length > 60) {
    return json({ error: { message: 'messages 条数过多（上限 60）' } }, 400, request);
  }

  // 3) 取密钥：body.apiKey → Authorization 头 → 环境变量（需 ALLOW_SERVER_KEY=true）
  const allowServerKey = String(env.ALLOW_SERVER_KEY || '').toLowerCase() === 'true';
  let apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
  let keySource = 'body';
  if (!apiKey) {
    const auth = request.headers.get('Authorization') || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (m && m[1].trim()) { apiKey = m[1].trim(); keySource = 'header'; }
  }
  const serverKeyEnv = providerKey === 'deepseek' ? 'SERVER_DEEPSEEK_KEY' : 'SERVER_QWEN_KEY';
  if (!apiKey && allowServerKey) {
    apiKey = String(env[serverKeyEnv] || '').trim();
    keySource = 'server';
  }
  if (!apiKey) {
    return json({
      error: {
        message: '缺少 API Key。请在网站【API 设置】页填写你自己的 Key。',
        stage: 'proxy',
        expects: 'JSON body 的 apiKey 字段，或 Authorization: Bearer <key> 请求头'
      }
    }, 401, request);
  }

  // 4) 组装上游请求（白名单字段）
  const maxCap = parseInt(env.MAX_TOKENS_CAP || '', 10) || 8192;
  const upstream = {
    model: String(body.model || provider.defaultModel).trim() || provider.defaultModel,
    messages: body.messages.map(function (m) {
      return { role: String((m && m.role) || 'user'), content: String((m && m.content) || '') };
    })
  };
  PASSTHROUGH_FIELDS.forEach(function (k) {
    if (body[k] !== undefined && body[k] !== null) upstream[k] = body[k];
  });
  if (upstream.max_tokens !== undefined) {
    const n = parseInt(upstream.max_tokens, 10);
    upstream.max_tokens = Math.max(1, Math.min(isNaN(n) ? maxCap : n, maxCap));
  }
  if (typeof upstream.stream !== 'boolean') upstream.stream = false;

  // 5) 转发上游
  let res;
  try {
    res = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
        'Accept': upstream.stream ? 'text/event-stream' : 'application/json'
      },
      body: JSON.stringify(upstream)
    });
  } catch (e) {
    return json({ error: { message: '无法连接上游接口 ' + provider.endpoint + '：' + ((e && e.message) || e) } }, 502, request);
  }

  const headers = new Headers(corsHeaders(request));

  // 6) 上游报错：转成 JSON 交给前端，并标注 stage 便于区分"代理坏"还是"Key 被拒"
  if (!res.ok) {
    const text = await res.text().catch(function () { return ''; });
    let message = text.slice(0, 800);
    try {
      const j = JSON.parse(text);
      message = (j.error && (j.error.message || j.error.code)) || j.message || message;
    } catch (e2) { /* 保留原文 */ }
    return json({
      error: {
        message: message,
        stage: 'upstream',
        provider: provider.label,
        upstream_status: res.status,
        key_source: keySource,
        hint: res.status === 401
          ? '上游' + provider.label + '拒绝了这个 Key。请确认：① 服务商与 Key 是否匹配；② Key 是否过期或复制时带空格换行；③ 该模型是否有权限。'
          : ''
      }
    }, res.status, request);
  }

  // 7) 流式：直接透传 ReadableStream（不缓冲、不落盘）
  if (upstream.stream) {
    headers.set('Content-Type', 'text/event-stream; charset=utf-8');
    headers.set('Cache-Control', 'no-cache, no-transform');
    headers.set('X-Accel-Buffering', 'no');
    return new Response(res.body, { status: 200, headers: headers });
  }

  // 8) 非流式
  const data = await res.json().catch(function () { return null; });
  if (data === null) return json({ error: { message: '上游返回了非 JSON 内容' } }, 502, request);
  return new Response(JSON.stringify(data), { status: 200, headers: headers });
}
