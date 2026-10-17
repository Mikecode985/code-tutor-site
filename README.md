# CodeTutor · 多语言编程学习网站

纯静态前端（HTML + CSS + JavaScript），无后端、无数据库。支持 **Python / C / C++** 三种语言的
AI 代码诊断、习题生成与在线代码批改，API Key 只存浏览器内存、绝不落盘。

---

## 当前线上状态（已部署并验证）

| 项 | 值 |
| --- | --- |
| 站点 | **https://code-tutor-site.pages.dev** |
| Pages 项目 | `code-tutor-site`（Cloudflare，生产分支 `main`） |
| 同源代理 | **https://code-tutor-site.pages.dev/api/chat** → `{"ok":true,"service":"codelearn-proxy","deploy":"pages-function"}` |
| Git 仓库 | `Mikecode985/code-tutor-site` |
| 访客成本 | **零配置**：打开网站 → 代理地址自动填 `/api/chat` → 只需粘贴自己的 API Key |

## 一、设计语言：Apple HIG × 贵阳

界面按 Apple 人机界面指南（HIG）重做了一遍，贵阳特色只出现在「讲故事」的地方，不干扰可用性。

**① 字体与层级（Apple 的系统感）**

- 字体栈：`-apple-system, BlinkMacSystemFont, "SF Pro Text", …, "PingFang SC", "Segoe UI", "Microsoft YaHei"`
  —— Mac 上是 SF Pro + 苹方，Windows 上自动落到 Segoe UI Variable + 微软雅黑，中英混排都不别扭。
- 全局 `letter-spacing:-0.011em`（标题 `-0.022em`），数字一律 `tabular-nums`，字号层级收敛为
  主文字 15 / 次文字 13.5 / 三级 12.5 / 说明 12，不再有十几种字号。

**② 材质与层次（而不是粗边框 + 大渐变）**

- 顶栏、弹窗遮罩、Toast、回到底部按钮都是**毛玻璃**：`backdrop-filter: saturate(180%) blur(20px)` + 半透明底色。
- 分隔一律用**发丝线**（`rgba(0,0,0,.055)` / 深色 `rgba(255,255,255,.065)`），卡片只留极淡投影。
- 页面底色 `#f5f5f7`、卡片纯白（深色 `#000` / `#1c1c1e`），靠**明度层次**而不是描边区分区域。

**③ 色彩：中性层固定，强调层由贵阳皮肤驱动**

| 层 | 来源 | 用途 |
| --- | --- | --- |
| 中性层 | Apple 系统灰（`#f5f5f7` / `#1d1d1f` / `#6e6e73` / `#86868b`…） | 背景、卡片、正文、次要文字、发丝线 |
| **强调层** | **贵阳 · 多彩主题的 9 套皮肤主色** | 主按钮、选中态、链接、用户消息气泡、图表、焦点光环 |
| 语义层 | Apple 系统色（绿 `#34c759` / 橙 `#ff9500` / 红 `#ff3b30`） | 通过 / 警告 / 错误，保证判读正确 |
| 装饰层 | 皮肤的暖色与金属色（`--gy-red` / `--gy-metal`） | 纹样与彩蛋栏的点缀 |

**④ 图标：不用 emoji，用 SF Symbols 那种线条图标**

全站 **21 枚内联 SVG symbol**（`<use href="#i-xxx">`），统一 `stroke-width:1.7`、圆头圆角、`currentColor`，
并跟着字号缩放（`width:1.15em`）——聊天/代码/靶心/书/图表/齿轮/铅笔/对勾/锁/火花/keyboard/礼物/太阳/月亮…
顶栏、标签栏、面板标题、帮助弹窗、彩蛋栏、按钮里的 emoji 全部换成了它们。
（原来那套 💬🔧🎯📚📈⚙️ 现在看起来就像"网页工具"，换成线条图标后才像系统 App。）

**⑤ 分组容器：靠底色分层，不靠描边**

卡片去掉边框与投影，只留 22px 圆角，靠 `#f5f5f7`（页面）/ `#fff`（卡片）的明度差分层——就是 iOS「分组列表」的做法；
分隔一律用发丝线。只有代码块保留一根 1px 发丝线，避免与输出区糊在一起。

**⑥ 标签栏：桌面端分段控件，手机端 iOS 底部标签栏**

- 桌面：一排 Apple 分段控件（灰轨道 + 白色滑块 + 细投影）；
- 手机（≤760px）：变成**固定底部标签栏**（毛玻璃 + 图标在上文字在下 + 选中项用强调色），
  `body` 预留 74px、`main` 预留 96px 避免遮挡；顶部工具栏收敛成一排横向滚动（iOS 工具栏做法）。
  > 实现要点：标签栏必须放在 `<header>` **之外**——`backdrop-filter` 会给 `position:fixed` 的子元素创建包含块，放在 header 里就跑不到屏幕底部了。

**⑦ 组件观感**

- 分段控件：原生 `select` 被 `enhanceSelect` 换成**灰轨道 + 白色滑块**的 Apple 分段控件；
- 标签栏：选中项是**白色药丸 + 细投影**；
- 弹窗：类 iOS Sheet（遮罩模糊 + `translateY(16px) scale(.97) → 1` 的弹性入场）；
- 通知：右上角**毛玻璃胶囊**（手机端自动落到底部）；
- 批改历史：从「一张张卡片」改成 **inset 分组列表**（发丝线分隔 + 悬停整行高亮）；
- 按钮/输入框：胶囊按钮（最小 40px 触控高度，手机 44px），输入框为**填充式**（无边框，聚焦才出现强调色光环），按下 `scale(.97)`；
- 对话气泡：用户侧＝强调色实底 + 右下角收角，AI 侧＝浅灰气泡 + 左下角收角（iMessage 观感）。

**⑤ 贵阳特色落点（都是细线条 SVG，不抢内容）**

| 位置 | 内容 |
| --- | --- |
| App 图标 | 甲秀楼三层飞檐 + 塔尖 + 浮玉桥双拱 + 水面，两层不透明度做出立体感（底色取当前皮肤渐变） |
| 对话空态 | **手绘细线场景**：月亮与月晕 · 黔灵山 · 金融城天际线（带窗格）· 甲秀楼三层飞檐与浮玉桥 · 南明河三重水波 · 飞鸟，配 **「知行合一 · 协力争先」** 城市精神印章 |
| 皮肤选择器 | 9 张皮肤卡各带一枚**96×40 细线徽记**，用**该皮肤的主色**绘制：山峦雾线 / 甲秀楼与月 / 数据柱与上行曲线 / 鼓楼与风雨桥 / 城墙垛口与门楼 / 竹影与一线天 / 城门与灯笼 / 海百合与波 / 梯田与花瓣 |
| 页脚 | 一条随时间换肤的天际线水印 |
| 彩蛋栏 | 品牌色→呼应色→暖色的极淡渐变 + 缓慢扫过的高光 |

**绘制的讲究**（全部是手工内联 SVG，不用位图，任意缩放都清晰）：

- **分层做纵深**：远山 `.10` → 城市 `.13` → 甲秀楼与桥 `.24~.34`，用不透明度区分前后景，而不是靠颜色；
- **细节到位**：金融城塔楼带窗格线、飞檐用二次贝塞尔做出上翘、桥有三个拱、水面三重波纹、天空两只飞鸟、月亮带月晕；
- **融进卡片**：空态用 `radial-gradient` 遮罩做柔和暗角，页脚用 `linear-gradient` 遮罩做左右淡出，不会出现生硬的方框边缘；
- **跟着皮肤变**：整套插画都用 `currentColor`，换皮肤即换色；9 枚徽记分别用各自皮肤的主色绘制。

> 早期版本用的是插件 `preview/art-*.svg` 里 520×132 的全景剪影，压到卡片里只有 4:1 的细长比例、细节全糊成一团；
> 现在换成按用途重画的「大场景 + 九枚徽记」两套图。

---

## 二、外观与皮肤（贵阳 · 多彩主题）

配色**整体移植自插件 `dsh-client-ui-guiyang-theme v0.5.0`**：9 套贵阳皮肤、每套的
主色 `p` / 呼应色 `a` / 暖色 `w` / 金属色 `m` / 底色 `surface`（各带浅深两版），
以及插件的 `mix()/alpha()` 令牌推衍公式都保持一致 —— 所以网站和你在 DSH 里看到的皮肤是同一套配色。

| 皮肤 | 主色（浅/深） | 呼应色 | 灵感 |
| --- | --- | --- | --- |
| **林城晨雾** lin | `#0f9d6f` / `#2fbf8f` | `#0e7490` / `#5eead4` | 贵阳的早晨：森林绿 + 南明河的水汽 |
| **甲秀夜月** jiaxiu | `#0d7a6a` / `#37c39c` | `#3e8e93` / `#7fd1c1` | 甲秀楼的月色：碧瓦青 + 水青 + 朱梁 |
| **数谷蓝调** shugu | `#0a66c2` / `#5b93ff` | `#0093ad` / `#4dd0e1` | 中国数谷：科技蓝 + 数据青 |
| **侗乡蓝** dong | `#2b4a6f` / `#8fb6e0` | `#4a6fa5` / `#a9c4e8` | 侗布靛蓝 + 苗绣红 + 银饰白 |
| **青岩古韵** qingyan | `#4f6a72` / `#9fb9c0` | `#7a8a8f` / `#b9c8cc` | 青岩古镇的青石 + 苗绣红 + 石牌坊 |
| **阳明心源** yangming | `#6a4c93` / `#a98fd6` | `#7c8c6a` / `#b5c79a` | 修文龙场悟道：一线天光 + 竹影 |
| **九门夜灯** jiubamen | `#8c6d46` / `#d8b06a` | `#9a7b1f` / `#e8b100` | 老贵阳九门四阁：城门灯影 |
| **三叠纪之海** sanyu | `#2f6d63` / `#5fb3a1` | `#3f7f96` / `#8fd0dd` | 2.4 亿年前兴义海底：胡氏贵州龙 |
| **樱花梯田** yinghua | `#c95f88` / `#f2a0bd` | `#5f8c42` / `#a8cf7a` | 贵安樱花园与黔中梯田 |

**怎么用**：顶栏「皮肤」按钮 → 面板里 9 张卡片（含色板圆点与说明），点一下即换；
选择存 `localStorage`（`codetutor.skin.v1`）。**首次访问按节令自动选皮**（春樱花 / 夏林城 / 秋九门 / 冬甲秀），
与插件行为一致；用户一旦手动选过就以用户选择为准。

**深浅色**：顶栏「外观」按钮三态循环（跟随系统 / 浅色 / 深色）。每套皮肤都自带浅深两套令牌，
一次注入、随 `data-theme` 自动切换；CodeMirror 的高亮配色也分浅深两套。

**技术上怎么落的**：`<head>` 里一段独立小脚本定义皮肤表与推衍函数，把结果写成
`html:root{…}` 与 `html[data-theme="dark"]{…}` 注入 `<style id="gySkinStyle">`；
静态 CSS 里的令牌是"无 JS 时的兜底"，`html:root` 的特异性保证皮肤永远覆盖它，不存在闪屏。

---

## 三、彩蛋栏 🎈

页面底部常驻一条彩蛋栏：**「代码写累了，看看贵州发展吧休息一下吧～」**，
右侧「去逛逛 ↗」按钮新窗口打开 [贵州发展吧（百度贴吧）](https://tieba.baidu.com/f?kw=%E8%B4%B5%E5%B7%9E%E5%8F%91%E5%B1%95&fr=personalize_page)。

- 右侧 `✕` 可收起，状态记在 `localStorage`（`codetutor.eggbar.v1`）
- 页脚留了「🎈 显示彩蛋栏」入口，随时能找回来
- 栏身是「品牌色 → 呼应色 → 暖色」的柔和渐变，一道高光缓慢扫过（`prefers-reduced-motion` 下自动关闭）

---

## 四、功能一览（7 个标签页）

| 标签页 | 作用 | 数据是否本地保存 |
| --- | --- | --- |
| **对话**（默认页） | 自由向 AI 提问；多会话管理（新建/切换/重命名/删除）、流式回复、Markdown 渲染、代码块一键复制、可「带入当前代码/题目」提问、导出 Markdown | ✅ 历史会话存 localStorage |
| 代码助手 | 上传 .py/.c/.cpp → Bug 诊断 / 代码讲解 / 修复后的完整代码 / 扣分陷阱 | 使用次数计入进度 |
| **实用工具**（第一个工具：文档阅读器） | 把 **Markdown / TXT / PDF / EPUB / DOCX**（及代码、CSV、JSON）拖进来直接读：多文件列表、章节/页面目录、字号调节、原文与 AI 提炼双视图；「AI 提炼」生成摘要/大纲/概念表，可**导出为 Markdown**。**文件只在浏览器里解析，不上传服务器** | ❌ 文件内容只在内存（刻意不落盘） |
| **学习知识** | 四档难度各自的知识点总结：**要点 → 易错点 → 典型考法 → 当前语言提示 → 代码示例**；模块可折叠、可「标记为已掌握」（进度条 + 本地存储）、可「练这个知识点」一键带去【练习】预设好难度与知识点 | ✅ 掌握进度存 localStorage |
| **练习**（出题 · 作答 · 批改三合一） | ①**出题**：4 档难度 × 题型 × 数量 × 知识点，按考试/竞赛规范生成（**只给题面，不给答案**），也可直接取内置题库；②**作答**：题面与答题区分栏，题目给出的代码**直接注入答题编辑器**（选择题点选，填空 / 改错 / 编程在编辑器里做，多题用题号切换）；③**批改**：提交后满分 100 打分、逐题得分、样例推演、参考代码、学习总结 | ✅ 每次批改记录分数与明细 |
| **学习进度** | 8 张统计卡、SVG 分数趋势图、按语言统计、批改历史（可展开 / 一键带回练习重做）、JSON 导出导入、清空 | ✅ 全部本地 |
| API 设置 | 服务商 / 模型 / Key / 代理地址、两步「测试连接」自检、免责声明 | Key 只在内存 |

### 实用工具 · 文档阅读器（纯前端，多格式）

把文档拖进网页就能读，**不上传服务器**：

| 格式 | 解析方式 |
| --- | --- |
| `.md` `.markdown` | 直读文本 → 用站内 Markdown 渲染器渲染（标题/表格/代码块/引用都支持） |
| `.txt` `.log` `.csv` `.json` `.html` `.xml` 与常见代码后缀 | 直读文本，等宽显示 |
| **`.pdf`** | 懒加载 **pdf.js**（CDN），逐页提取文字并保留分页 |
| **`.epub`** | **自研最小 ZIP 解析器** + 浏览器原生 `DecompressionStream('deflate-raw')`：读 `container.xml` → OPF 清单 → spine 顺序 → 逐章转纯文本，并生成**章节目录** |
| **`.docx`** | 同样走 ZIP，取 `word/document.xml` 转文本 |

**界面**：左侧多文件列表 + 章节目录/页码目录；右侧「原文 / AI 提炼」双视图、字号 A−/A+、字数与文件大小统计。

**AI 提炼**：把（截断后的）节选发给你自己配置的模型，产出五节结构化笔记 —— 一句话概要 / 详细摘要 / 结构大纲 / 关键概念 / 可延伸的问题；
**导出 Markdown** 会把「AI 提炼 + 原文」连同元信息（文件名、格式、大小、字数、生成时间）写成一个 `.md` 下载。

#### 按页选择（OCR 与导出都跟着选择走）

PDF 打开后出现一条 **「选择页」** 工具条（EPUB 则是「选择章」）：

- **范围表达式**：输入 `1-3,5,8-10`（也支持 `1–3`、`1 3 5`、`5,1-2` 等写法），点「应用」；
- **一键操作**：全选 / 全不选 / 反选；
- **展开页格**：点数字格子逐个勾选（最多显示 400 个，更多的用表达式选）；
- 右侧实时显示 `已选 3 / 12 页（1-3）`；正文里**未选中的页会淡出**，一眼看出范围；
- **扫描件会自动把「没有文字层」的页选中**，打开即可直接点「识别选中页」。

两个动作都遵守这个选择：
- **OCR**：只识别选中的页（未筛选时识别没有文字层的页）；
- **导出 Markdown**：只导出选中页的原文，抬头会写明 `范围：仅 1-3,5 页（共 12）`；另外可以勾选是否包含 **AI 提炼** / **原文**，两者都不勾会直接拦下。
- 「复制所选」同样只复制选中范围。

#### 扫描版 PDF：用视觉模型做 OCR

扫描件没有文字层（解析出来几乎是空的），这时面板会自动提示，并出现一条 **「扫描版识别」** 工具条：

1. 用上面的「选择页」圈定范围（一次最多 30 页）→ 点「识别选中页」；
2. 前端把每页**用 canvas 渲染成 JPEG**（最大宽 1400px、质量 0.82），以 OpenAI 兼容的
   `messages[].content = [{type:'text'}, {type:'image_url', image_url:{url:'data:image/jpeg;base64,...'}}]` 发给**视觉模型**；
3. 模型返回该页文字（提示词要求"逐字转写、保留段落与换行、表格转 Markdown、不要总结"），
   前端把结果**并入该页正文**并标上「AI 识别」小标签，之后可以接着「AI 提炼」或导出 Markdown；
4. 支持逐步显示进度与「停止」，单页失败会跳过并保留已完成结果。

**双引擎：AI 视觉 / 本地 OCR**（借鉴 [universal-reader](https://universal-reader.pages.dev/) 的思路——没有视觉 API 时用浏览器内的 WASM OCR）

| 引擎 | 用什么 | 需要 Key | 适合 |
| --- | --- | --- | --- |
| **AI 视觉** | 多模态模型：**通义千问 `qwen-vl-max` / `qwen-vl-plus`** | 需要 | 质量最高，复杂版式 / 手写 |
| **本地 OCR** | **Tesseract.js 5（WASM）** + 语言包 `chi_sim+eng`（也支持繁中/日/韩/英） | **不需要** | DeepSeek、没配 Key、离线、量大 |

- OCR 条上有 **「自动 / AI 视觉 / 本地 OCR」** 三段切换与**语言包下拉**：
  - **自动**（默认）：有视觉模型就用 AI，否则自动退回本地；
  - 所以 **选 DeepSeek 或完全没配 Key 时，点「识别选中页」也能用** —— 全程在浏览器里跑，**不发起任何 AI 请求**（自动化测试断言了请求数不变）。
- 本地引擎跑在 Web Worker 里，逐页进度、可停止；识别结果并入正文并标注**「本地识别」**（AI 的是「AI 识别」）。
- 本地 OCR **首次使用要下载语言包**（简中约 10~15MB，之后会被浏览器缓存），引擎脚本走 **jsdelivr → unpkg → cdnjs** 三路回退；三路都失败会给出明确提示。
- 隐私：图片/页面**全程不出本机**；AI 视觉模式下才会把该页图片发给你配置的模型，本地模式一个请求都不发。

> 图片同样只在本地渲染；本站任何服务器都不参与。

**PDF 依赖的 pdf.js 走多路 CDN 回退**（jsdelivr → unpkg → cdnjs），因为国内 jsdelivr 偶发被 reset；
三路都失败时会给出明确提示（换网络 / 重试 / 改用 TXT·Markdown·EPUB）。

**隐私**：文件内容只存在内存里，**刻意不写 localStorage**（自动化测试专门断言：拖入含特征串的文件后，三个本地存储键里都搜不到该串）。
只有点「AI 提炼」时才会把节选文本发给你配置的模型 —— 这一点在面板上也写明了。

### 学习知识：四档知识点总结（学 → 练 闭环）

新增的「📚 学习知识」板块把每个难度档位需要掌握的东西整理成**可勾选的清单**：

| 档位 | 知识模块数 | 覆盖内容（节选） |
| --- | --- | --- |
| **基础** | 6 | 变量与数据类型 / 运算符与表达式 / 分支与循环 / 数组与字符串 / 函数与递归入门 / 输入输出与调试 |
| **中等·二级** | 7 | 数据类型与运算（含位运算）/ 流程控制 / 数组与字符串处理 / 函数与作用域 / 指针与内存·容器与推导式 / 结构体与文件 / **上机规范与评分点** |
| **进阶·竞赛** | 6 | 复杂度与常数优化 / 前缀和与差分 / 二分与双指针 / 排序与贪心 / 搜索 DFS·BFS / 动态规划入门 |
| **王者·国赛** | 6 | 高级 DP（区间·状压·树形）/ 图论与最短路 / 数论与组合 / 数据结构（树状数组·线段树·单调栈）/ 字符串算法（哈希·KMP）/ **竞赛工程与拿分策略** |

每个模块统一给出五种信息，并且**语言提示会跟着顶部的语言选择器切换**（Python / C / C++ 各一份）：

1. **要点**：这个模块必须会的东西（3~5 条）
2. **易错点**：高频翻车点（用暖色块单独标出，例如「01 背包正序枚举会变成完全背包」）
3. **典型考法**：见到什么题面该想到它
4. **当前语言提示**：这门语言特有的坑与写法
5. **代码示例**：可直接复制运行的短片段

**两个闭环动作**：
- 「✓ 标记为已掌握」→ 记录到 `localStorage`（`codetutor.kb.v1`），顶部进度条按比例走动；全部掌握会提示去练一套；
- 「🎯 练这个知识点」/「按本档去练一套」→ 跳到【练习】并把**难度档位 + 知识点关键字**填好，点「按规范生成」即可出这一档、这个知识点的题。
  （例如在「进阶 · 前缀和与差分」点一下，练习页会自动变成「进阶（单人竞赛）+ 知识点：前缀和与差分」。）

> 掌握进度**只存在你自己的浏览器**里，不上传服务器；导出/清空学习进度不影响它，可在浏览器里单独清理。

### 练习板块的四档难度（严格按对应考试 / 竞赛规范出题）

| 档位 | 对标 | 出题规范要点 |
| --- | --- | --- |
| **基础** | 课后练习 | 单一知识点、不设陷阱；n ≤ 1000 允许 O(n²)；样例 ≥ 2 组含边界 |
| **中等** | 全国计算机等级考试二级 · 程序设计 | 严格按二级上机结构：**选择题 40 分（每题 1 分）+ 程序填空题 18 分（3 空）+ 程序改错题 18 分（2~3 处错）+ 程序设计题 24 分**；考点限定在大纲范围（数据类型与运算、流程控制、数组、函数、指针/引用、字符串、结构体、文件操作）；填空题统一用 `____(1)____` 标记空位；改错题给出完整可编译但含语法 + 逻辑错误的代码 |
| **进阶** | 小型单人竞赛 · CSP-J / 普及组风格 | 单文件、标准输入输出；数据范围明确（常见 1 ≤ n ≤ 10^5）；时间 1s / 内存 256MB；算法复杂度要与数据范围匹配（前缀和 / 二分 / 贪心 / DFS·BFS / 简单 DP）；样例 2~3 组并说明设计意图；给出易错边界提示 |
| **王者** | 大型计算机决赛 · 蓝桥杯国赛级 | **结果填空题（只交答案）+ 编程题（交源码、按测试点部分给分）**；数据范围到 10^5~10^6；多知识点组合（二分 + 前缀和 / 图论最短路 / 并查集 / 树形 DP / 状压 DP）；必须说明「部分分怎么拿」 |

**「不给答案」是怎么保证的**：出题请求明确禁止输出答案 / 解析 / 参考代码 / 填空内容，并要求最后附一个 `json` 结构块，
字段只有题面信息（`statement / inputFormat / outputFormat / samples / constraints / limits / scorePoints / stemCode / templateCode / blanks / choices`）——
**契约里根本没有 answer / solution 字段**；前端只用这个结构渲染题面与答题区，答案与解析在提交后由批改环节给出。
（自动化测试里有专门断言：题面文本不得出现「答案 / 解析」字样与 JSON 契约残留。）

**内置题库**：点「📚 从题库出题」可**离线取题**（不消耗 API），覆盖 4 档难度 × Python/C/C++，
每题都带完整题面、样例、数据范围、评分点与答题模板代码，字段与 AI 出题的契约完全一致。

**本地存储说明**：历史与进度保存在浏览器 `localStorage`（键名 `codetutor.chat.v1` / `codetutor.progress.v1`），
上限为 20 个会话 × 每会话 120 条消息、100 条批改记录；**写入超限时自动裁剪最旧数据**再重试。
`apiKey` 依然只存在于内存，**从不落盘**（有自动化断言保证）。清理浏览器数据、换设备或换浏览器会丢失历史，
可在【学习进度】页导出 JSON 备份。

线上实测（真实 Chrome 打开生产域名）：
```
✔ 第 1 步 · 代理自检通过：codelearn-proxy v1.1.0 · pages-function · 同源，无 CORS 风险
✘ 第 2 步 · 模型调用失败  认证失败（401）… Authentication Fails, Your api key: ****fake is invalid
```
第二步用假 Key 得到 DeepSeek 的真实回执，证明「浏览器 → 同源 Function → DeepSeek」全链路通畅。

> ⚠️ **重要：本项目是 Git 连接的 Pages 项目。**
> 直接上传（wrangler/拖拽）的部署会被**下一次 `git push` 覆盖**。
> 所以 `functions/api/chat.js` 与最新的 `index.html` **必须提交到仓库**，否则下次推送会把
> 同源代理冲掉，网站又变回"只能用 workers.dev"的状态。
> 本地克隆已准备好提交（`codelearn/repo`，commit `6ba81f0`），只差：
> ```powershell
> cd D:\贵阳美图\codelearn\repo
> git push          # 会弹出 GitHub 登录
> ```

---

## 一、文件清单与架构
codelearn/
├── index.html               # 主站（单文件：页面 + 样式 + CodeMirror 集成 + 全部交互逻辑）
├── functions/api/chat.js    # 【已上线·方案①】Cloudflare Pages Functions 同源代理
├── deploy-site/             # 可直接部署/提交的干净目录（index.html + functions/）
├── repo/                    # 站点 Git 仓库的本地克隆（已含待推送的提交 6ba81f0）
├── cloudflare-proxy.js      # 【备用·方案③】Cloudflare Worker 跨域代理
├── local-proxy.mjs          # 【备用·方案④】本机 Node 代理（127.0.0.1:8787）
├── README.md                # 本文档
├── preview-1-assistant.png  # 预览图：代码助手
├── preview-2-grading.png    # 预览图：练习批改（评分卡）
├── preview-3-mobile.png     # 预览图：手机端
├── preview-4-scorecard.png  # 预览图：评分卡特写
├── preview-5-proxy-check.png# 预览图：代理自检诊断界面
├── preview-6-chat.png       # 预览图：对话页
├── preview-7-progress.png   # 预览图：学习进度页
├── preview-8-chat-mobile.png# 预览图：手机端对话页
├── preview-9-dark-chat.png  # 预览图：深色对话页
├── preview-10-dark-progress.png # 预览图：深色学习进度页
├── preview-11-skin-lin.png  # 预览图：林城晨雾皮肤
├── preview-12-skin-shugu-dark.png # 预览图：数谷蓝调皮肤（深色）
├── preview-13-skin-yinghua.png    # 预览图：樱花梯田皮肤
├── preview-14-skin-jiubamen-dark.png # 预览图：九门夜灯皮肤（深色）
└── tests/
    ├── worker.test.mjs      # Worker 单元测试（22 项断言）
    ├── alt-deploy.test.mjs  # Pages Function + 本机代理测试（20 项断言）
    ├── e2e.mjs              # jsdom 端到端测试（116 项断言：全功能 + 知识板块 + 练习三步 + 对话 + 进度 + 持久化 + 皮肤 + 彩蛋栏）
    ├── browser.mjs          # 真实 Chrome 验证 + 预览图生成（17 项断言）
    ├── failure-repro.mjs    # 复现"Worker 装错"故障并截图（6 项判定）
    ├── live-verify.mjs      # 对线上生产域名做端到端验证（29 项判定）
    ├── feature-preview.mjs  # 生成对话页/进度页/多皮肤预览图
    ├── lna-diagnose.mjs     # 诊断 Chrome Local Network Access 拦截
    └── README.md            # 测试运行方法
```

---

## 五、架构

```
浏览器 (index.html)
   │  POST { provider, model, apiKey, messages, stream }
   │  代理地址支持三种写法：
   │    /api/chat              → Pages Functions（同源，最稳）
   │    https://api.你的域名.com → Worker 绑定自定义域
   │    https://xxx.workers.dev → Worker 默认域（国内常被墙，见第三节）
   │    http://127.0.0.1:8787   → 本机 local-proxy.mjs
   ▼
代理层（以上四选一，逻辑完全一致）
   │  补 CORS 头 + 校验参数 + 限流 + Authorization: Bearer <用户的 key>
   ▼
DeepSeek / 通义千问 官方 OpenAI 兼容接口
```

- **为什么需要代理**：大模型官方接口不允许浏览器直接跨域调用（CORS），且前端直连会把
  Key 暴露在浏览器网络面板里、无法统一限流。代理只做「透明转发」，不记录任何密钥。
- **四个版本逻辑一致**：`service` 都返回 `codelearn-proxy`，前端「测试连接」第 1 步会校验它，
  所以换部署方式不用改前端逻辑，只改代理地址。
- **前端零依赖**：只用 CodeMirror 5（CDN 引入，加载失败自动降级为原生 textarea），
  没有构建步骤、没有 npm 依赖、没有框架。

---

## 六、部署步骤

> **先选代理方案**：如果你在国内网络下访问 `*.workers.dev` 失败（`Failed to fetch`），
> 请直接看 **第三节「网络被墙怎么办」**，用同源 `/api/chat`（推荐）或本机 `local-proxy.mjs`，
> 下面的第 1 步可以跳过。下面按「Worker 默认可用的网络环境」来写。

### 第 1 步：部署 Worker（先做这步，才能拿到代理地址）

**方式 A — 控制台粘贴（推荐）**

1. 登录 <https://dash.cloudflare.com> → 左侧 **Workers & Pages** → **Create** → **Create Worker**
2. 名称填 `codelearn-proxy`（随意）→ **Deploy**
3. 点 **Edit code**，把 `cloudflare-proxy.js` 的全部内容粘贴进去覆盖模板 → **Deploy**
4. 记下生成的地址，形如：`https://codelearn-proxy.你的子域.workers.dev`
5. 【重要】回到 Worker 的 **Settings → Variables and Secrets**，添加变量：
   - `ALLOWED_ORIGINS` = `https://你的站点.pages.dev`（多个用英文逗号分隔；本地调试再加 `http://localhost:8080`）
   - 不设置则默认 `*`，任何网站都能调你的代理，正式站点务必收紧。

**方式 B — Wrangler CLI**

```bash
npm i -g wrangler
wrangler login
mkdir codelearn-proxy && cd codelearn-proxy
# 把 cloudflare-proxy.js 改名为 index.js 放进来
cat > wrangler.toml <<'EOF'
name = "codelearn-proxy"
main = "index.js"
compatibility_date = "2025-01-01"

[vars]
ALLOWED_ORIGINS = "https://你的站点.pages.dev,http://localhost:8080"
EOF
wrangler deploy
```

**验证代理是否活着**：浏览器直接打开 Worker 地址，应返回
`{"ok":true,"service":"codelearn-proxy",...}`。

### 第 2 步：部署前端

**方式 A — Cloudflare Pages（推荐，与 Worker 同生态）**

1. Workers & Pages → **Create** → **Pages** → **Upload assets**
2. 项目名随意，把 `index.html` 拖进去（或上传整个 `codelearn` 目录）→ **Deploy**
3. 得到 `https://项目名.pages.dev`
4. 回到 Worker，把 `ALLOWED_ORIGINS` 改成这个真实域名并保存

> Git 集成方式：把仓库连到 Pages，构建命令留空、输出目录填 `.`（因为不需要构建）。

**方式 B — GitHub Pages**

```bash
git init && git add index.html && git commit -m "init"
git branch -M main
git remote add origin https://github.com/你的用户名/codelearn.git
git push -u origin main
```

仓库 **Settings → Pages** → Source 选 `Deploy from a branch` → 分支 `main`、目录 `/ (root)` → Save。
地址为 `https://你的用户名.github.io/codelearn/`，把它加进 Worker 的 `ALLOWED_ORIGINS`。

**方式 C — 本地跑**

双击 `index.html` 即可（file:// 也能用）；或 `python -m http.server 8080` 后访问
<http://localhost:8080>（记得把 `http://localhost:8080` 加进 `ALLOWED_ORIGINS`）。

### 第 3 步：站点配置

1. 打开站点 → **API 设置** 标签页
2. 服务商选 **DeepSeek** 或 **通义千问**
3. 填入你自己的 API Key（[DeepSeek 控制台](https://platform.deepseek.com) / [阿里云百炼](https://bailian.console.aliyun.com)）
4. 代理地址填第 1 步拿到的 Worker 地址
5. 点 **测试连接** → 显示「连接成功」即配置完成
6. 顶部选择编程语言，切到 **代码助手 / 练习（出题 · 作答 · 批改）** 开始使用

---

## 七、网络被墙怎么办（`*.workers.dev` 连不上）

**症状**：前端报 `无法连接代理。原始错误：Failed to fetch`（注意与"401 认证失败"是两回事）。

**原因**：国内网络对 `*.workers.dev` 普遍做了 **DNS 污染 + SNI 阻断**。本机实测（2026-10）：

| 检查项 | 实测结果 |
| --- | --- |
| `nslookup code-proxy.xxx.workers.dev` | 解析到 `31.13.96.192`、`185.60.216.169`（**Facebook IP 段**）——每次查询还不一样 |
| 解析一个**根本不存在的**随机子域 | 竟然也"解析成功"，返回 `162.125.2.5`（**Dropbox IP**）→ 确证是污染 |
| 用公共 DoH（Cloudflare DNS）查询 | 返回正确答案 `104.21.72.244`（Cloudflare 真实 IP） |
| 用正确 IP + 正确 SNI 强制直连 | **ECONNRESET**（TCP 能连、TLS 握手被重置）→ SNI 阻断 |
| 同一台机器访问你的 Pages 站点、`api.deepseek.com` | **完全正常** |

> 结论：这是**网络层问题**，改代码没用；而且**改 hosts 文件也没用**（SNI 阻断发生在 TLS 阶段，
> 与 DNS 解析结果无关——上面那条 ECONNRESET 就是用正确 IP 测出来的）。

### 方案 ①（推荐）：改用同源 `/api/chat`（Pages Functions）

代理跑在**你自己的站点域名**下，同域请求、没有 CORS、完全不碰 `workers.dev`。

```bash
# 目录里放好 index.html 与 functions/api/chat.js（functions/ 必须与 index.html 同级，
# 不能放进 dist/ 之类的构建输出目录），然后在项目根目录执行：
npm i -g wrangler && wrangler login
wrangler pages deploy . --project-name=code-tutor-site
#                    ↑ project-name 必须与你现有的 Pages 项目名完全一致
```

- **注意**：控制台「拖拽上传」**不支持** Functions（[官方说明](https://developers.cloudflare.com/pages/functions/get-started/)），必须用 `wrangler` 或 Git 集成（构建命令留空、输出目录 `.`）。
- 部署后浏览器打开 `https://你的站点.pages.dev/api/chat`，应看到 `{"ok":true,"service":"codelearn-proxy","deploy":"pages-function",...}`
- 前端【API 设置】→ 代理地址填 **`/api/chat`**（以 `/` 开头会被识别为同源路径）

### 方案 ②：给 Worker 绑定自定义域名

Workers & Pages → 你的 Worker → **Settings → Domains & Routes → Add → Custom Domain**，
绑定例如 `api.你的域名.com`（域名需托管在 Cloudflare）。前端代理地址填 `https://api.你的域名.com`。

### 方案 ③：本机代理（最快，但新版 Chrome/Edge 需要授权）

```bash
node local-proxy.mjs        # 看到 "本机代理已启动 http://127.0.0.1:8787"
```

前端代理地址填 `http://127.0.0.1:8787`。

> ⚠️ **Chrome 147+ / Edge 147+ 会拦这一跳**。它们引入了 **Local Network Access** 策略：
> 公网 https 页面访问本机 `127.0.0.1` 必须由用户显式授权，否则前端只显示 `Failed to fetch`，
> 浏览器控制台原文（本机实测 Chrome 154.0.8037.93）：
> ```
> Access to fetch at 'http://127.0.0.1:8787/' from origin 'https://xxxx.pages.dev'
>   has been blocked by CORS policy: Permission was denied for this request
>   to access the `loopback` address space.
> net::ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS   (LocalNetworkAccessPermissionDenied)
> ```
> **处理**：点「测试连接」时留意地址栏弹出的「访问本地网络上的设备」提示 → 允许；
> 若已误拒，去 地址栏图标 → 网站设置 → 「本地网络访问」→ 允许 → 刷新重试。
> （`local-proxy.mjs` 已按规范返回 `Access-Control-Allow-Private-Network: true`，服务端无需再改。）
> 想彻底不折腾这一套，请用**方案 ①**。

优点是零依赖、不受任何封锁影响；代价是**只有你自己开着脚本时能用**，且每个浏览器都要单独授权一次。

### 怎么确认是"被墙"而不是"地址写错"

```bash
nslookup 你的worker名.你的子域.workers.dev      # 看是不是 Facebook/Twitter/Dropbox 等无关 IP
curl -v https://你的worker名.你的子域.workers.dev   # 看是不是 TCP 通、TLS 被 reset
```

前端「测试连接」第 1 步也会自动区分三种失败：**连不上（网络）** / **能连上但读不到（CORS）** /
**连上了但不是我们的脚本（装错）**，并给出对应处理建议。

---

## 八、故障排查（先看这一节）

新版【API 设置】的「测试连接（含代理自检）」分两步，**能直接定位问题在哪一端**：

```
① 代理自检   GET 一次代理地址，确认它返回 {"ok":true,"service":"codelearn-proxy","version":"1.1.0"}
② 模型连通性  真实调用一次大模型，确认 Key + 服务商匹配
```

### 症状：报错 `认证失败（401）… 服务商返回：Authentication Fails (governor)`

**先做 5 秒判定**：浏览器新标签页**直接打开你的代理地址**。

| 打开后看到 | 结论 | 处理 |
| --- | --- | --- |
| `{"ok":true,"service":"codelearn-proxy",...}` | 代理部署正确 | 问题在 **Key 或服务商选择**，见下方 A |
| 任何**不是**这个 JSON 的东西（报错、纯文本、别的 JSON） | 该地址上跑的不是本项目脚本 | 见下方 B |

**A. 代理没问题 → 查 Key**
1. 服务商选择与 Key 是否匹配：DeepSeek 的 Key 只能选 DeepSeek，通义千问（百炼）的 Key 只能选通义千问；
2. Key 是否复制完整（前后没有空格/换行）、是否已过期或删除；
3. 用 `curl` 直接验证（把 Key 换成你的，注意它只出现在你本机终端里）：
   ```bash
   curl https://api.deepseek.com/v1/chat/completions \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer sk-你的key" \
     -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"hi"}]}'
   ```
   返回 `Authentication Fails` 就是 Key 本身的问题，与本站无关。

**B. 该地址上跑的不是我们的脚本**（真实踩坑案例）
典型特征是：`GET` 代理地址也返回 401、响应头里没有 `X-Proxy`、`POST` 未知 provider 也不报 400。
多数情况是**把密钥读成了 `Authorization` 请求头**的老脚本，而本站是把密钥放在 JSON body 的 `apiKey` 字段里发的，
于是它每次拿空 Key 去请求上游，上游就回 `Authentication Fails (governor)`——**看起来像 Key 坏了，其实是 Worker 装错了**。

处理步骤：
1. 回 Cloudflare 控制台，确认**那个 Worker**（地址与站点里填的一致）的代码已被 `cloudflare-proxy.js` 全文覆盖；
2. 容易犯的错：**建了两个 Worker**，代码部署在 A，站点里填了 B 的地址；
3. 重新 Deploy 后，刷新页面点「测试连接」→ 第 1 步应显示 **代理自检通过（codelearn-proxy v1.1.0）**。

### 症状：`请求失败（502）… 无法连接上游接口`
Worker 能跑，但访问不到上游。检查 `PROVIDERS` 里的 endpoint 是否被改错，以及你的网络是否可直连服务商域名。

### 症状：`无权限（403）… 白名单拦截`
Worker 的 `ALLOWED_ORIGINS` 没写上当前站点域名。把它改成实际域名（含 `https://`，不要带结尾斜杠），多个用逗号分隔。

---

## 九、可选环境变量（Worker）

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | `*` | 允许的来源白名单，逗号分隔 |
| `MAX_TOKENS_CAP` | `8192` | 单次请求 `max_tokens` 上限 |
| `MAX_BODY_BYTES` | `524288` | 请求体上限（字节） |
| `RATE_LIMIT_PER_MIN` | `60` | 每 IP 每分钟请求上限（尽力而为） |
| `ALLOW_SERVER_KEY` | `false` | 设为 `true` 时允许用服务端密钥（你自己付费） |
| `SERVER_DEEPSEEK_KEY` / `SERVER_QWEN_KEY` | 无 | 服务端密钥，仅上一条为 true 时生效 |

---

## 十、安全注意事项

1. **密钥零存储**：`apiKey` 只存在于页面 JavaScript 内存变量 `state.apiKey` 中，
   不写 `localStorage` / `sessionStorage` / Cookie / IndexedDB，刷新即消失（已由自动化测试断言）。
2. **不要用别人的代理**：Key 会随请求经代理转发，代理方理论上可见。只填自己部署的 Worker。
3. **用限额 Key**：在服务商控制台设置消费上限，用完即轮换/销毁；不要用主账号高权限 Key。
4. **收紧白名单**：正式上线一定要设置 `ALLOWED_ORIGINS`，否则任何人都能白嫖你的 Worker 做转发。
5. **限流是尽力而为**：Worker 免费版的 Map 限流不跨机房共享，只防手滑连点。要真正防刷请用
   Cloudflare WAF 的 Rate Limiting Rules，或改用「服务端密钥 + 严格白名单 + 每日预算告警」。
6. **XSS 防护**：AI 返回内容全部先 HTML 转义再渲染（`esc()`），Markdown 渲染器不输出
   原始 HTML，因此模型输出无法注入脚本。
7. **隐私**：粘贴的代码和题目会发送给对应的 AI 服务商，不要提交涉密或含个人隐私的代码。

---

## 十一、免责声明

本项目为纯静态教学演示网站，仅供学习参考。AI 生成内容可能存在错误、过时语法或不被考试认可的
写法，**请以编译器运行结果、教材与考试大纲为准**。API 调用产生的费用由使用者账号承担。
因使用本网站造成的任何直接或间接损失（包括但不限于 API 费用、作业/考试成绩影响），
作者不承担任何责任。使用即表示已知悉并接受《API 设置》页的完整免责声明。

---

## 十二、自动化验证（8 套 · 409 项断言）

| 套件 | 运行方式 | 断言 | 覆盖 |
| --- | --- | --- | --- |
| `worker.test.mjs` | `node` | 22 | Worker 代理：身份标识、CORS、密钥来源、错误包装 |
| `alt-deploy.test.mjs` | `node` | 28 | Pages Function / 本机代理两条备选部署路径 |
| `e2e.mjs` | `node`（需 `jsdom`） | 131 | 前端全流程（含练习三步、对话、进度、皮肤、彩蛋栏、持久化、容量保护） |
| `browser.mjs` | headless Chrome | 18 |
| **`reader.mjs`** | headless Chrome + 线上域名 | **56** | 真实 CodeMirror、真实排版与像素、移动端、预览图 |
| `failure-repro.mjs` | headless Chrome | 6 | 复现「Worker 装错脚本」故障，验证自检提示是否指得准 |
| `live-verify.mjs` | headless Chrome + 线上域名 | 39 | 对生产域名跑完整链路：零配置、两步自检、对话、练习、皮肤、彩蛋栏 |
| **`feature-audit.mjs`** | headless Chrome + 线上域名 | **109** | **全功能完整性审计**：A 阶段真实链路 + B 阶段注入 AI 桩，逐项覆盖全部用户功能 |

**最近一次全量结果：409 / 409 通过 ✅**（含 96 项全功能审计，逐区域全绿：结构导航 7、语言联动 4、外观皮肤 6、帮助 4、彩蛋栏 4、进度空态 5、API 两步自检 7、安全 3、布局 4、对话 10、代码助手 7、练习出题 10、练习批改 10、内置题库 2、进度有数据 7、持久化 5）。

> 审计过程中发现并修复的真实缺陷：**地址栏 hash 变化不响应**（浏览器前进/后退不切页）——
> 已补 `hashchange` 监听，并由 `feature-audit.mjs` 的 A1 用例长期守住。

---

## 十三、通义千问"连接不稳定"的排查与修复

用无效 Key 做了一轮压测（每项 5 次），把问题定位清楚了：

| 路径 | 结果 | 说明 |
| --- | --- | --- |
| 浏览器/Node **直连** `dashscope.aliyuncs.com` | 5/5，**平均 96ms**（65~222ms） | 阿里云本身又快又稳 |
| 直连 `dashscope-intl.aliyuncs.com` | 5/5，342ms | 国际站也可达 |
| **经我们的代理**（`/api/chat` → Cloudflare 边缘 → 阿里云） | 5/5 但 **540ms~20s，平均 1.9s** | **抖动在这一段** |

### ⚠️ 最常见的坑：把「模型名称」设成了 VL 模型 → 出题也失败

为了做 OCR，很多人会把【API 设置】里的**模型名称**改成 `qwen-vl-max`。但 VL 模型是**多模态识别专用**，
它的**输出上限很小**（约 1500~2048 tokens），而出题 / 批改一次要输出 **7000** tokens —— 上游会直接返回
`400 max_tokens is invalid`，于是**出题失败、AI 识别也失败**，看起来像"通义总是出问题"。

**正确做法（现在界面已经引导了）**：

| 字段 | 填什么 | 用途 |
| --- | --- | --- |
| 模型名称 | **`qwen-plus`**（或 qwen-turbo / qwen-max） | 对话、出题、批改、代码诊断、文档提炼等**所有文本任务** |
| **视觉模型（新增）** | **`qwen-vl-max`**（留空则自动用） | **只给图片识别（OCR）用** |

配套的三层保护：
1. **视觉模型独立配置**：OCR 不再临时改你的全局模型（以前是 `state.model = 视觉模型` 再改回来，容易踩坑）；
2. **按模型限流**：`max_tokens` 会按模型自动封顶（VL 模型 ≤1500，qwen 系列 ≤6000），从源头避免 400；
3. **参数错误自动重试**：万一下游报 `max_tokens / parameter` 类错误，会自动把 `max_tokens` 调小（≤1500）再试一次；
4. **AI 识别失败自动降级**：某一页 AI 视觉失败时，**该页立即改用本地 OCR**，完成提示里会写「其中 N 页因 AI 失败已自动改用本地 OCR」，不会一片空白。

**三个真问题（都已修）**

1. **多模态内容被吃掉**（最致命）：代理里把 `content` 用 `String()` 强转，图片数组变成 `"[object Object]"` —— 视觉 OCR 每次都错。
   现在 `normalizeContent()` 会保留 `text` / `image_url` 结构（只放行 `data:image/*` 与 `https`），并在响应头回 `X-Images`。
2. **没有超时与重试**：上游卡住就一直等（实测有 20s 无响应），表现就是"时好时坏"。
   现在单次 **75s 超时**（可用 `UPSTREAM_TIMEOUT_MS` 调），**429/5xx/网络错误自动重试 1 次**，并把 `X-Upstream-Status/Attempts/Ms` 回给前端。
3. **默认走了慢路径**：既然 **DashScope 与 DeepSeek 都返回 CORS 头**（实测 `ACAO: *` / 回显 Origin），浏览器可以**直接打服务商**，不必绕 Cloudflare。

**新增「连接方式」开关（API 设置页）**

| 模式 | 路径 | 实测延迟 |
| --- | --- | --- |
| 经代理（默认） | 浏览器 → 你的 Cloudflare Worker/Pages Function → 服务商 | 0.5~3s（偶发更慢） |
| **直连服务商（推荐）** | 浏览器 → 服务商 | **100~300ms** |

- 直连模式**不需要配置代理地址**，Key 直接发给服务商（比走代理更安全），端点可改（千问国际站就换成 `dashscope-intl` 那个）。
- 「测试连接」在直连模式下第 1 步改成 **CORS 预检**，能立刻判断浏览器能不能直连。
- 两步自检的错误信息里现在会带 **代理诊断**：`上游状态 401 · 耗时 392 ms · 尝试 1 次`。

> 所以：**通义千问感觉不稳定时，优先切到「直连服务商」**；如果必须走代理（例如想统一限流），再考虑就近自建 Worker。

---

## 十四、踩过的坑：桌面端对话滚不动（已修）

**症状**：桌面端长对话无法向下滚动，超出的内容直接被裁掉。

**根因**：`.chat-shell` 是固定高度（`min(74vh, 780px)`）的 grid 容器，但 grid 子项 `.chat-main`
默认 `min-height:auto`，内容把它撑到 2723px（容器只有 666px）——于是 `#chatBody` 的
`scrollHeight === clientHeight`，内部滚动条永远不会出现，多出来的部分被 `overflow:hidden` 裁掉。

**修复**：`grid-template-rows:minmax(0,1fr)` + 从 `.chat-main` 到 `#chatBody` 逐层 `min-height:0`，
只让最内层滚动；同时收尾时按"用户是否贴着底部"再滚一次（流式结束会重排 DOM 高度）。

**沿用至今的两道防线**：`feature-audit.mjs` 的几何断言（`.chat-main` 高度必须 ≤ `.chat-shell`）+
`browser.mjs` 的真实滚动断言（追加 14 条消息后 `scrollTop` 能到底）；排障工具 `tests/scroll-diag.mjs`
会直接打印整条滚动链的尺寸与"能不能滚"。
