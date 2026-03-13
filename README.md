# Suivi de Temps 🕒

[English](README.en.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Italiano](README.it.md) | [Dansk](README.da.md) | [中文](README.zh.md) | [العربية](README.ar.md)

**Suivi de Temps** est une application minimaliste conçue pour traquer vos heures de travail de manière simple et respectueuse de votre vie privée. Elle vous permet de visualiser votre activité quotidienne, hebdomadaire et mensuelle sans aucune friction.

🚀 **Démo en ligne** : [suivi-de-temps.vercel.app ](https://suivi-de-temps.vercel.app)

## 🌟 Avantages

- **Open Source** : Le code est transparent et accessible à tous.
- **Pas de compte** : Aucune inscription requise.
- **Données locales** : Toutes vos données restent sur votre ordinateur (stockées localement dans votre navigateur).
- **Self-hostable** : Installez-le sur votre propre infrastructure très facilement.
- **Multilingue** : Disponible dans plusieurs langues.

## 🚀 Installation rapide

### Prérequis

- Node.js (version 18 ou supérieure recommandée)
- pnpm (recommandé) ou npm / yarn

### Installation des dépendances

```bash
pnpm install
```

### Lancer en mode développement

```bash
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`.

## 📦 Production & Déploiement

### Build standard (Node.js)

Pour construire l'application pour un environnement Node.js :

```bash
pnpm build
```

### Génération Statique (SSG)

Pour générer une version statique de l'application :

```bash
pnpm generate
```

**Pourquoi utiliser la génération statique ?**

- **Simplicité d'hébergement** : Les fichiers générés dans le dossier `.output/public` peuvent être hébergés sur n'importe quel hébergeur.
- **Performance** : Les pages sont pré-rendues, ce qui permet un chargement quasi instantané.

## 📄 Licence

Ce projet est sous licence **GNU General Public License v3.0**. Consultez le fichier [LICENSE](LICENSE) pour plus de détails.
