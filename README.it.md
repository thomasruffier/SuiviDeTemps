# Monitoraggio del Tempo 🕒

**Monitoraggio del Tempo** è un'applicazione minimalista progettata per tracciare le ore di lavoro in modo semplice e rispettoso della privacy. Ti consente di visualizzare la tua attività quotidiana, settimanale e mensile senza alcuna frizione.

🚀 **Demo Online**: [suivi-de-temps.vercel.app ](https://suivi-de-temps.vercel.app)

## 🌟 Vantaggi

- **Open Source**: Il codice è trasparente e accessibile a tutti.
- **Senza account**: Nessuna registrazione richiesta.
- **Dati locali**: Tutti i tuoi dati rimangono sul tuo computer (memorizzati localmente nel tuo browser).
- **Self-hostable**: Installabile molto facilmente sulla propria infrastruttura.
- **Multilingue**: Disponibile in diverse lingue.

## 🚀 Installazione Rapida

### Prerequisiti

- Node.js (versione 18 o superiore consigliata)
- pnpm (consigliato) o npm / yarn

### Installazione delle dipendenze

```bash
pnpm install
```

### Avvio in modalità sviluppo

```bash
pnpm dev
```

L'applicazione sarà accessibile su `http://localhost:3000`.

## 📦 Produzione e Distribuzione

### Build standard (Node.js)

Per compilare l'applicazione per un ambiente Node.js:

```bash
pnpm build
```

### Generazione Statica (SSG)

Per generare una versione statica dell'applicazione:

```bash
pnpm generate
```

**Perché usare la generazione statica?**

- **Semplicità di hosting**: I file generati nella cartella `.output/public` possono essere ospitati su qualsiasi host.
- **Prestazioni**: Le pagine sono pre-renderizzate, consentendo un caricamento quasi istantaneo.

## 📄 Licenza

Questo progetto è distribuito sotto licenza **GNU General Public License v3.0**. Consulta il file [LICENSE](LICENSE) per maggiori dettagli.
