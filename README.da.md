# Tidsregistrering 🕒

**Tidsregistrering** er en minimalistisk applikation designet til at spore dine arbejdstimer på en enkel og privatlivs-respekterende måde. Den giver dig mulighed for at visualisere din daglige, ugentlige og månedlige aktivitet uden friktion.

🚀 **Online Demo**: [suivi-de-temps.lapierrequimousse.com](https://suivi-de-temps.vercel.app)

## 🌟 Fordele

- **Open Source**: Koden er gennemsigtig og tilgængelig for alle.
- **Ingen konto**: Ingen registrering påkrævet.
- **Lokale data**: Alle dine data bliver på din computer (gemt lokalt i din browser).
- **Self-hostable**: Installer det meget nemt på din egen infrastruktur.
- **Multiproget**: Tilgængelig på flere sprog.

## 🚀 Hurtig start

### Forudsætninger

- Node.js (version 18 eller højere anbefales)
- pnpm (anbefales) eller npm / yarn

### Installation af afhængigheder

```bash
pnpm install
```

### Kør i udviklingstilstand

```bash
pnpm dev
```

Applikationen vil være tilgængelig på `http://localhost:3000`.

## 📦 Produktion & udrulning

### Standard build (Node.js)

For at bygge applikationen til et Node.js-miljø:

```bash
pnpm build
```

### Statisk generering (SSG)

For at generere en statisk udgave af applikationen:

```bash
pnpm generate
```

**Hvorfor bruge statisk generering?**

- **Enkel hosting**: Filerne genereret i `.output/public` mappen kan hostes på enhver udbyder.
- **Ydeevne**: Siderne er præ-rendered, hvilket giver næsten øjeblikkelig indlæsning.

## 📄 Licens

Dette projekt er licenseret under **GNU General Public License v3.0**. Se filen [LICENSE](LICENSE) for flere detaljer.
