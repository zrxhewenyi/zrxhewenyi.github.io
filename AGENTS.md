# 赵瑞翔个人学术主页

纯静态个人学术网站（HTML + CSS + 原生 JS，无框架、无构建步骤）。`site/` 是网站根目录；博客用 Markdown 编写、marked + DOMPurify 前端渲染。开发规格以 `要求.md` 为准。

## Commands

- 本地预览：`cd site` 后 `E:\anaconda\envs\data_prep\python.exe -m http.server 8000`，访问 http://127.0.0.1:8000（必须走 http；file:// 下 fetch 会被浏览器拦截，博客无法加载）
- QA 回归：项目根运行 `E:\anaconda\envs\data_prep\python.exe qa_test.py`（Playwright 41 项断言，复用系统 Edge，channel="msedge"）
- JS 语法检查：`node --check site/js/main.js`、`node --check site/js/blog.js`

## Architecture

- `site/index.html`：主页长滚动页，Hero（#home）+ 8 个 .section 区块（#about 关于我 / #news / #education / #research / #projects / #honors / #blog-entry / #contact），内容直接写死在 HTML
- `site/blog.html` / `site/post.html`：博客列表页 / 文章页模板（?p=slug）
- `site/css/style.css`：全站唯一样式；配色 / 间距 / 动效曲线全部走 :root CSS 变量
- `site/js/main.js`：导航区块高亮（IntersectionObserver）、汉堡菜单、回到顶部、滚动逐项渐显（stagger，--d 延迟 70ms/项上限 420ms）；暴露 `window.__initReveal(els)` 供动态渲染内容接入渐显
- `site/js/blog.js`：主页/列表页 fetch `posts/index.json` 渲染卡片（主页取前 3 篇）；文章页 fetch `posts/<slug>.md` → front matter 解析（兼容 BOM）→ marked.parse → DOMPurify.sanitize → 注入；slug 白名单 `/^[a-z0-9][a-z0-9-]*$/` 防路径穿越
- `site/posts/index.json`：文章清单（手动维护）；`site/posts/*.md`：文章正文
- `site/js/vendor/`：marked.min.js、purify.min.js 本地化（禁止改回 CDN）

## Conventions

- 配色只用 CSS 变量（--color-primary #1B3A5C 藏青、--color-accent #C0392B 砖红、--color-text/bg/card/border/muted 等），禁止散落硬编码色值
- 区块标题中英双语格式：`标题 <span class="section__title-en">EN</span>`
- 发新文章两步：`posts/<slug>.md`（front matter：title/date/tags/summary，与 index.json 一致）+ `posts/index.json` 登记
- 所有动效必须在 `prefers-reduced-motion: reduce` 下关闭（CSS 侧 `transition:none !important` + JS 侧跳过 reveal）
- 触控目标 ≥ 44px；`:focus-visible` 藏青描边；页面含 skip-link；禁止出现电话/生日/籍贯/政治面貌/Google Scholar/知乎
- 全站相对路径；三个页面均带 meta CSP（connect-src 'self'，博客 fetch 依赖它）
- 敏感文件（简历.pdf/成绩单.pdf/要求.md）已被 .gitignore 排除，不得提交

## Notes

- （留空，后续补充）
