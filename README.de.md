# Zeiterfassung 🕒

**Zeiterfassung** ist eine minimalistische Anwendung, die entwickelt wurde, um Ihre Arbeitsstunden auf einfache und datenschutzfreundliche Weise zu erfassen. Sie ermöglicht es Ihnen, Ihre täglichen, wöchentlichen und monatlichen Aktivitäten ohne Reibungsverluste zu visualisieren.

🚀 **Online-Demo**: [suivi-de-temps.vercel.app ](https://suivi-de-temps.vercel.app)

## 🌟 Vorteile

- **Open Source**: Der Code ist transparent und für jeden zugänglich.
- **Kein Konto**: Keine Registrierung erforderlich.
- **Lokale Daten**: Alle Ihre Daten bleiben auf Ihrem Computer (lokal in Ihrem Browser gespeichert).
- **Self-hostable**: Installieren Sie es ganz einfach auf Ihrer eigenen Infrastruktur.
- **Mehrsprachig**: In mehreren Sprachen verfügbar.

## 🚀 Schnellstart

### Voraussetzungen

- Node.js (Version 18 oder höher empfohlen)
- pnpm (empfohlen) oder npm / yarn

### Abhängigkeiten installieren

```bash
pnpm install
```

### Im Entwicklungsmodus ausführen

```bash
pnpm dev
```

Die Anwendung ist unter `http://localhost:3000` erreichbar.

## 📦 Produktion & Bereitstellung

### Standard-Build (Node.js)

Um die Anwendung für eine Node.js-Umgebung zu erstellen:

```bash
pnpm build
```

### Statische Generierung (SSG)

Um eine statische Version der Anwendung zu generieren:

```bash
pnpm generate
```

**Warum statische Generierung verwenden?**

- **Einfachheit des Hostings**: Die im Ordner `.output/public` generierten Dateien können auf jedem Host gehostet werden.
- **Leistung**: Die Seiten sind vorgerendert, was ein nahezu sofortiges Laden ermöglicht.

## 📄 Lizenz

Dieses Projekt steht unter der **GNU General Public License v3.0**. Weitere Details finden Sie in der Datei [LICENSE](LICENSE).
