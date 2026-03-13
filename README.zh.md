# 时间追踪 🕒

**时间追踪**是一款极简的应用，旨在以简单且尊重隐私的方式追踪您的工作时间。它让您可以毫无障碍地查看每日、每周和每月的活动。

🚀 **在线演示**: [suivi-de-temps.lapierrequimousse.com](https://suivi-de-temps.lapierrequimousse.com/)

## 🌟 优势

- **开源**: 代码透明，所有人都可以访问。
- **无需账号**: 无需注册。
- **本地数据**: 您的所有数据都保存在您的计算机上（本地存储在您的浏览器中）。
- **可自托管**: 非常容易地安装在您自己的基础设施上。
- **多语言**: 提供多种语言版本。

## 🚀 快速入门

### 准备工作

- Node.js (建议版本 18 或更高)
- pnpm (推荐) 或 npm / yarn

### 安装依赖

```bash
pnpm install
```

### 以开发模式运行

```bash
pnpm dev
```

该应用将可以通过 `http://localhost:3000` 访问。

## 📦 生产与部署

### 标准构建 (Node.js)

针对 Node.js 环境构建应用：

```bash
pnpm build
```

### 静态生成 (SSG)

生成应用的静态版本：

```bash
pnpm generate
```

**为什么要使用静态生成？**

- **托管简单**: 在 `.output/public` 文件夹中生成的文件可以托管在任何主机上。
- **性能**: 页面是预渲染的，可以实现近乎即时的加载。

## 📄 许可证

本项目采用 **GNU General Public License v3.0** 许可证。有关更多详细信息，请参阅 [LICENSE](LICENSE) 文件。
