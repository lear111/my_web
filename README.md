# Lear's World - 个人网站空间 🚀

欢迎来到我的个人网页空间，这是一个集成 3D 互动体验、动态信息流与全网留言板的轻量级个人作品集网站。

## ✨ 核心特性

- **3D 魔方入场互动**：基于 `Three.js` 构建的可交互 3D 魔方作为网站的引导页，支持 PC 端鼠标与原生移动端触摸操作。
- **现代化视觉设计**：采用清爽的蓝天白云背景色调，大量运用高级的“毛玻璃（Glassmorphism）”拟态 UI 设计。
- **无服务器动态渲染 (Serverless)**：利用原生的 `fetch` 结合本地 JSON（如 `posts.json`、`profile.json`）完成内容的高效加载与展示，无需额外部署后端服务器。
- **漫游留言板系统**：接入 `Giscus` 第三方评论插件，基于 GitHub Discussions 实现数据跨域漫游，配有快捷悬浮留言入口与输入框置顶优化。
- **多分类内容流**：原生支持切换 `主页展示`、`项目作品`、`生活日常`、`学习记录` 等分类。
- **模块化扩展**：设有专门的 `pages/` 渲染目录用于挂载大型独立独立项目（如 `tree_day` 植树节项目）或是长篇独立博客文章。

## 🛠️ 技术栈

- 核心护城河：**Vanilla JS (原生 JavaScript) + HTML5 + CSS3**
- 3D 渲染引擎：**Three.js** (`TrackballControls` 镜头控制)
- 评论驱动引擎：**Giscus**

## 📂 目录结构

```text
my_web/
├── index.html           # 全站总入口 —— 逼真的 3D 互动魔方页面
├── personal.html        # 个人大厅与信息集散地 (支持分类过滤和内容发布)
├── app.js               # Three.js 魔方引擎与事件分发核心逻辑
├── styles.css           # 全局样式表 (包含各种毛玻璃渐变和交互动效)
├── README.md            # 项目说明文档
├── data/
│   └── myweb_data/      # 数据存储源
│       ├── profile.json # 个人主页资料配置
│       └── posts.json   # 文章/日志的数据源文件
└── pages/               # 独立项目与长文章存放区
    ├── template.html    # 标准的长图文专用模板网页
    └── tree_day/        # 独立的植树节 Web 挂载项目
```

## 🌐 访问与部署

该项目专为 **GitHub Pages** 设计，能够直接通过 `git push` 解析并自动在云端构建分发。所有的留言与文章数据更新可以借由内源环境与版本控制系统完成同步交互。

---

*Made with ❤️ by Lear.*
