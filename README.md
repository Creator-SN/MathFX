<div align="center">
    <img src="./src/assets/logo.svg" width="60" style="width: 60px;"/>
    <p>MathFX</p>
    <p><img src="https://img.shields.io/github/v/release/Creator-SN/MathFX" /></p>
</div>

<p align="center">
    <a href="LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg">
    </a>
</p>

## 💡 MathFX(Preview)

A pure open source and cross platforms Math Formulates OCR tool based on the Electron.

<div align="center" style="display: flex; justify-content: space-around;">
    <img src="./src/assets/docs/scan.png" width="320" style="width: 48%; box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);"/>
    <img src="./src/assets/docs/scan_dark.png" width="320" style="width: 48%; box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);"/>
</div>

## 🎈 Platform

- ✔ Windows 11 [Supported]
- ✔ Windows 10 [Supported]
- ✔ Mac(AMD64) [Supported]


## ✨ Installation

See the [Release Page](https://github.com/Creator-SN/MathFX/releases).

## 🔨 Tutorial

First, you need to set up the subscriptions, MathFX currently supports three formulate OCR APIs. Including:

1. **SLatex OCR** **(Recommend)**: To build your own backend server, you can deploy the OCR server in this repo [SLatexOCR](https://github.com/aleversn/sLatexOCR).
2. **Mathpix**: You can register the OCR API services with `$1` started, and the current pricing is much cheaper than directly using the Mathpix desktop application, each month you can have a `1,000` free requests. (`Although it costs $1 to sign up and a Credit Card is necessary, but the performance of this API is currently the best`).  [See Details](https://mathpix.com/ocr)
3. **Xunfei** Formula Recognition API: You can register the OCR API for free and obtain a `500` requests per day. [See Details](https://www.xfyun.cn/service/formula-discern)
4. **Baidu** Formula Recognition API: You can register the OCR API for free and obtain a `1,000` requests per month. [See Details](https://ai.baidu.com/tech/ocr/formula)

> Note that the performance of `Xunfei` and `Baidu` OCR API is not good in complex science formulates scenes.

Once you have an OCR API subscription, all you need to do is fill in the necessary information about the current subscription. Then click this subscription's item block until the block's border is `blue`.

<div align="center">
    <img src="./src/assets/docs/subscription.png" style="width: 80%; box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);"/>
</div>

Now you can scan for a new formulate scene on the `Scan` page or press `Alt + Shift/Cmd + X` to quick scan.

## ⌨ Shortcuts

- `Alt` + `Shift/Cmd` + `M`: Show the main program.
- `Alt` + `Shift/Cmd` + `X`: Start a new quick scan.

## 🌏 Language

Currently supports two languages.

- English
- 简体中文(Chinese)

## Acknowledgements

This Project is Develop Based on [VFluentForElectron](https://github.com/Creator-SN/VFluentForElectron).

## License

MIT License

Copyright (c) 2024 Creator SN®

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
