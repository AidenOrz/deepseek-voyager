> [!NOTE]
> ## 维护权交接：由 [@AidenOrz](https://github.com/AidenOrz) 继续维护
>
> 原维护者因时间与精力有限已停止维护，现由 [@AidenOrz](https://github.com/AidenOrz) 接手，继续提供功能更新与兼容性修复。欢迎提交 [Issue](https://github.com/AidenOrz/deepseek-voyager/issues) / PR。
>
> 本项目改编自 [Nagi-ovo/gemini-voyager](https://github.com/Nagi-ovo/gemini-voyager)。衷心感谢原作者 [@Nagi-ovo](https://github.com/Nagi-ovo) 的开源工作，也感谢前维护者 [@Azurboy](https://github.com/Azurboy) 与所有使用、反馈和支持本项目的朋友。

# DeepSeek Voyager
<p align="center">
  <a href="https://github.com/AidenOrz/deepseek-voyager/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/AidenOrz/deepseek-voyager?color=blue" alt="License">
  </a>
  <a href="https://github.com/AidenOrz/deepseek-voyager/releases">
    <img src="https://img.shields.io/github/v/release/AidenOrz/deepseek-voyager?color=brightgreen&label=release" alt="Latest Release">
  </a>
  <a href="https://github.com/AidenOrz/deepseek-voyager/stargazers">
    <img src="https://img.shields.io/github/stars/AidenOrz/deepseek-voyager?style=social" alt="GitHub Stars">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Supported-brightgreen?logo=googlechrome&logoColor=white" alt="Chrome Supported">
  <img src="https://img.shields.io/badge/Edge-Supported-blue?logo=microsoftedge&logoColor=white" alt="Edge Supported">
  <img src="https://img.shields.io/badge/Firefox-Untested-lightgrey?logo=firefoxbrowser&logoColor=white" alt="Firefox Untested">
  <img src="https://img.shields.io/badge/Safari-Untested-lightgrey?logo=safari&logoColor=white" alt="Safari Untested">
</p>

DeepSeek 适配版——为 [DeepSeek](https://chat.deepseek.com) 提供时间轴导航、文件夹管理与对话导出的增强工具。

本项目改编自 [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager)，针对 DeepSeek 平台进行了全面适配。感谢原作者 @ [Nagi-ovo](https://github.com/Nagi-ovo)

---

## 🆕 v0.2.0 更新亮点

**彻底修复文件夹功能：**
- **指针拖拽**：使用 `window` 捕获阶段 Pointer Events 实现自定义拖拽，绕过 DeepSeek 页面对原生 HTML5 拖拽的拦截——会话拖入文件夹在最新版页面上稳定可用
- **完整文件夹拖拽**：支持会话拖入文件夹、文件夹拖入文件夹（嵌套）、嵌套文件夹移回根目录
- **手感优化**：拖拽高亮改用 outline（不改变布局尺寸，消除指针抖动）、拖拽期间临时关闭源元素原生 draggable 并在结束后恢复、多指针保护
- **更紧凑的列表**：缩小列表/条目/图标/缩进间距，置顶、更多、移除按钮改为悬浮显示，标题可展示更多文字
- 移除赞助二维码

---

## 功能概览

### 时间轴导航（已完成）
- 点击节点快速定位到对应消息
- 悬停预览消息内容
- 长按可标记重要消息（跨标签页同步）
- 支持拖拽调整时间轴位置
- 自动跟随滚动位置

### 文件夹管理（已完成，v0.2.0 彻底修复）
- 两层级结构：文件夹与子文件夹
- 支持拖拽对话到文件夹（指针拖拽，绕过页面事件拦截）
- 支持文件夹拖入文件夹、移回根目录
- 右键菜单：重命名、复制、删除
- 固定常用文件夹
- 导入/导出文件夹数据，支持跨设备同步

### 对话导出（已完成）
- 导出为 Markdown / JSON，支持选择导出的对话轮次
- 公式复制：点击公式即可复制 LaTeX 源码

### 提示词管理（待完成）

---

## 安装使用
### 下载最新release包
目前仅适配Chromium 浏览器，Firefox和Safari没试过

加载到浏览器
   - 打开 `chrome://extensions`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"，选择下载的 release 文件打开

---

## 许可与致谢

MIT License（详见 `LICENSE`）。

本项目基于 [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager) 改编，感谢原作者的工作。原项目面向 Google Gemini，本分支专注适配 DeepSeek 平台。

---

## 相关链接
- 原项目：https://github.com/Nagi-ovo/gemini-voyager
- DeepSeek：https://chat.deepseek.com
- Issues：https://github.com/AidenOrz/deepseek-voyager/issues

  ---

<p align="center">
  <b>觉得这个插件还不错？</b>
  <br />
  可以点一个 <b>Star</b> (⭐) 嘿嘿！
  <br />
</p>
