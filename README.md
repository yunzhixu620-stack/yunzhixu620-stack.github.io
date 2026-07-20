# Yunzhi Product Lab

这是 `yunzhixu620-stack.github.io` 的产品总目录。它解决三个问题：

1. 根网址此前没有入口，项目只能依赖分散的子路径被发现；
2. 可用产品、MVP、交互原型、实验和历史版本混在一起；
3. 医疗、题库等高风险项目缺少统一的公开边界说明。

## 项目目录

| 项目 | 状态 | 方向 | 在线体验 | 代码 |
|---|---|---|---|---|
| MindGrow | 可用产品 | AI 知识 | [打开](https://yunzhixu620-stack.github.io/mindgrow/) | [仓库](https://github.com/yunzhixu620-stack/mindgrow) |
| 校招测评题库 | 可用产品 | 垂直产品 | [打开](https://yunzhixu620-stack.github.io/campus-question-bank-pwa/) | [仓库](https://github.com/yunzhixu620-stack/campus-question-bank-pwa) |
| 第七街区：真人测试 | MVP | 垂直产品 | [打开](https://yunzhixu620-stack.github.io/seventh-district-mvp/) | [仓库](https://github.com/yunzhixu620-stack/seventh-district-mvp) |
| GM 全服邮件配置中台 | 交互原型 | 游戏研发 | [打开](https://yunzhixu620-stack.github.io/gm-mail-platform/) | [仓库](https://github.com/yunzhixu620-stack/gm-mail-platform) |
| ProjectOS | MVP | 游戏研发 | 暂无在线版 | [仓库](https://github.com/yunzhixu620-stack/projectos) |
| 代号 R 美术排期 | 可用产品 | 游戏研发 | [打开](https://yunzhixu620-stack.github.io/nightwalker-art-schedule/) | [仓库](https://github.com/yunzhixu620-stack/nightwalker-art-schedule) |
| 多语言任务进度 | MVP | 游戏研发 | [打开](https://yunzhixu620-stack.github.io/got-progress-dashboard/) | [仓库](https://github.com/yunzhixu620-stack/got-progress-dashboard) |
| 游戏产品经理智能体 | MVP | AI 产品 | [打开](https://yunzhixu620-stack.github.io/gaming-grab/) | [仓库](https://github.com/yunzhixu620-stack/gaming-grab) |
| AnyDiagnosis | 交互原型 | 垂直产品 | [打开](https://yunzhixu620-stack.github.io/anydiagnosis-showcase/) | [仓库](https://github.com/yunzhixu620-stack/anydiagnosis-showcase) |
| MindFlow | 实验 | AI 知识 | [打开](https://yunzhixu620-stack.github.io/mindflow/) | [仓库](https://github.com/yunzhixu620-stack/mindflow) |
| MindFlow AI | 已归档 | AI 知识 | [历史版本](https://yunzhixu620-stack.github.io/mindflow-ai/) | [仓库](https://github.com/yunzhixu620-stack/mindflow-ai) |

## 目录结构

```text
yunzhixu620-stack.github.io/
├── index.html                 # 产品目录单页
├── styles.css                # 全站视觉与响应式布局
├── app.js                    # 搜索、筛选、详情弹层和 URL 状态
├── projects.js               # 所有项目的唯一公开清单
├── assets/
│   └── covers/               # 项目真实页面预览
├── docs/
│   ├── STATUS_MODEL.md       # 五种产品状态的判定规则
│   ├── CONTENT_BOUNDARIES.md # 医疗与题库公开边界
│   └── IMPROVEMENT_PLAN.md   # 产品改进批次与验收条件
├── scripts/
│   └── validate.mjs          # 项目清单、状态、链接与封面校验
├── 404.html                  # 未知路径返回目录入口
└── .nojekyll
```

结构参考了 ProjectManager 的优秀实践：根目录提供总览表；子项目保持独立；状态、文档、边界和测试可被快速发现；MVP 明确列出“不做什么”。本站采用纯静态 HTML/CSS/JS，不增加构建和服务端依赖。

## 发布

创建公开仓库 `yunzhixu620-stack/yunzhixu620-stack.github.io`，把本目录内容推送到 `main` 分支，并在 GitHub Pages 中选择从 `main / root` 发布。

发布前至少确认：

- 所有卡片状态与各仓库 README 一致；
- 医疗与题库的公开边界仍然有效；
- 历史项目没有被重新标成“可用产品”；
- 在线链接、移动端布局、键盘搜索与详情弹层可以使用。

可先运行 `node scripts/validate.mjs` 检查项目数量、状态值、必要字段、链接格式和封面文件。
