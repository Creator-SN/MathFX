<div align="center">
  <img src="../src/renderer/src/assets/logo.svg" width="72" alt="MathFX Logo" />
  <h1>MathFX</h1>
  <p>一个美观、友好、简约的公式 OCR 工作台，基于 VLM API 工作。</p>
  <p>
    <a href="https://github.com/Creator-SN/MathFX/releases"><img src="https://img.shields.io/github/v/release/Creator-SN/MathFX?label=release" alt="最新版本" /></a>
    <a href="https://github.com/Creator-SN/MathFX/actions/workflows/release.yml"><img src="https://github.com/Creator-SN/MathFX/actions/workflows/release.yml/badge.svg" alt="发布工作流" /></a>
    <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-yellow.svg" alt="MIT License" /></a>
  </p>
  <p><a href="../README.md">English Documentation</a></p>
</div>

一个美观、友好、简约的公式 OCR 桌面工具，基于 VLM API 将屏幕上的数学公式转换为可编辑的 LaTeX。

## MathFX 是什么？

MathFX 是一个跨平台桌面公式识别工具。它的核心流程很简单：截取屏幕上的公式，交给具备视觉能力的语言模型识别，再将结果渲染和复制到你需要的位置。

它适合论文写作、课程笔记、科研工作以及日常需要快速录入公式的场景。界面保持简洁，让公式本身成为重点。

<div align="center">
  <img src="../src/renderer/src/assets/docs/scan.png" width="48%" alt="MathFX 浅色界面" />
  <img src="../src/renderer/src/assets/docs/scan_dark.png" width="48%" alt="MathFX 深色界面" />
</div>

## 主要功能

- **简约公式 OCR**：从任意屏幕区域截取公式，转换为可编辑 LaTeX。
- **基于 VLM API**：不绑定单一 OCR 厂商，使用支持图片输入的视觉语言模型完成识别。
- **自定义 API**：可以配置自定义名称、Base URL、API Key、模型名称以及 `reasoning_effort`，默认值为 `medium`。
- **LangGraph 调用流程**：通过 LangGraph 组织识别节点、模型调用和结果解析，便于后续扩展。
- **手动输入和编辑 LaTeX**：识别后可以直接修改，也可以手动输入 LaTeX，实时查看渲染结果。
- **多种格式复制**：支持纯 LaTeX、行内公式、独立公式、equation 环境、SVG 和图片格式，方便粘贴到 VS Code、Markdown、Word 或桌面应用。
- **历史记录**：本地保存识别结果，支持浏览、编辑、复制和删除。
- **浅色与深色主题**：简洁紧凑，不打扰主要工作流程。
- **Windows 与 macOS**：通过 GitHub Actions 自动构建发布安装包。

## 识别原理

MathFX 会将截图发送到当前选中的 Chat API。模型收到图片和公式识别提示词后，返回包含 LaTeX 的 JSON 数据。随后，MathFX 在本地完成结果解析、KaTeX 渲染、SVG 生成、格式转换以及剪贴板写入。

默认提示词要求模型返回兼容 KaTeX 的 LaTeX，并尽可能保留分数、根号、矩阵、希腊字母、上下标、极限、对齐公式、运算符和可见文本；模型不应返回 Markdown 代码块或额外解释。

由于 MathFX 使用 VLM API，所选模型必须支持图片输入。API 应兼容 OpenAI Chat Completions 格式，可以是云端 OpenAI 兼容服务，也可以是支持视觉模型的本地服务。

> 截图会发送给你配置的 API 服务商。处理敏感内容前，请先确认该服务商的隐私和数据留存政策。

## 快速开始

1. 从 [Releases](https://github.com/Creator-SN/MathFX/releases) 下载最新版本。
2. 打开 **订阅** 页面，添加一个 Chat API。
3. 填写名称、Base URL、API Key、支持图片输入的模型，以及可选的 `reasoning_effort`（默认 `medium`）。
4. 点击选中该订阅，使其进入激活状态。
5. 点击截图按钮，或使用 `Alt + Shift + X`（Windows）/ `Alt + Cmd + X`（macOS）快速截图。

<div align="center">
  <img src="../src/renderer/src/assets/docs/subscription.png" width="80%" alt="MathFX 订阅设置" />
</div>

## 编辑与复制公式

识别完成后，可以直接手动修正 LaTeX。MathFX 使用 KaTeX 在本地渲染编辑结果，并提供适合不同场景的复制方式：

- 复制纯 LaTeX 源码，适合 VS Code 等代码编辑器；
- 复制行内公式或独立公式，适合 Markdown 和文档；
- 复制 `equation` 环境，适合 LaTeX 文档；
- 复制渲染后的 SVG，适合 Word 等富文本应用；
- 复制图片，适合只接受位图内容的桌面软件。

公式及其原始截图会保存在本地历史记录中，可以随时重新编辑、复制或删除。

## 快捷键

- `Alt + Shift + X`（Windows）/ `Alt + Cmd + X`（macOS）：截取新的公式。

## 开发与构建

需要 Node.js 20+、Yarn 1.x，以及用于实际识别测试的 VLM API Key。

```bash
yarn install
yarn dev
```

构建 Electron 和渲染进程：

```bash
yarn build
```

构建平台安装包：

```bash
yarn build:win
yarn build:mac
```

推送匹配 `v*` 的 Git 标签会触发 GitHub Actions 自动发布。Windows 生成 NSIS 安装程序；macOS 使用 `Icon.icns` 生成 DMG 和 ZIP 安装包。

## 技术栈

- **Electron + Vue 3**：桌面应用和界面。
- **Vite / electron-vite**：开发与生产构建。
- **LangChain OpenAI + LangGraph**：VLM API 集成与识别流程。
- **KaTeX**：本地 LaTeX 渲染。
- **Pinia + lowdb**：应用状态及订阅、历史记录持久化。
- **VFluent 3**：简洁的 Fluent 风格组件。

## 开源协议

MathFX 使用 [MIT License](../LICENSE) 开源。
