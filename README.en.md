# Time Tracker 🕒

**Time Tracker** is a minimalist application designed to track your working hours in a simple and privacy-respecting way. It allows you to visualize your daily, weekly, and monthly activity without any friction.

🚀 **Online Demo**: [suivi-de-temps.lapierrequimousse.com](https://suivi-de-temps.lapierrequimousse.com/)

## 🌟 Benefits

- **Open Source**: The code is transparent and accessible to everyone.
- **No Account**: No registration required.
- **Local Data**: All your data stays on your computer (stored locally in your browser).
- **Self-hostable**: Install it on your own infrastructure very easily.
- **Multilingual**: Available in several languages.

## 🚀 Quick Start

### Prerequisites

- Node.js (version 18 or higher recommended)
- pnpm (recommended) or npm / yarn

### Installing Dependencies

```bash
pnpm install
```

### Run in Development Mode

```bash
pnpm dev
```

The application will be accessible at `http://localhost:3000`.

## 📦 Production & Deployment

### Standard Build (Node.js)

To build the application for a Node.js environment:

```bash
pnpm build
```

### Static Generation (SSG)

To generate a static version of the application:

```bash
pnpm generate
```

**Why use static generation?**

- **Hosting Simplicity**: The files generated in the `.output/public` folder can be hosted on any host.
- **Performance**: Pages are pre-rendered, allowing for near-instant loading.

## 📄 License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for more details.
