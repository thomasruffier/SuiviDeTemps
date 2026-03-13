# Seguimiento de Tiempo 🕒

**Seguimiento de Tiempo** es una aplicación minimalista diseñada para rastrear sus horas de trabajo de manera sencilla y respetuosa con su privacidad. Le permite visualizar su actividad diaria, semanal y mensual sin fricciones.

🚀 **Demostración en Línea**: [suivi-de-temps.lapierrequimousse.com](https://suivi-de-temps.vercel.app)

## 🌟 Ventajas

- **Código Abierto**: El código es transparente y accesible para todos.
- **Sin cuenta**: No se requiere registro.
- **Datos locales**: Todos sus datos permanecen en su computadora (almacenados localmente en su navegador).
- **Auto-alojable**: Instálelo en su propia infraestructura muy fácilmente.
- **Multilingüe**: Disponible en varios idiomas.

## 🚀 Instalación Rápida

### Requisitos previos

- Node.js (se recomienda versión 18 o superior)
- pnpm (recomendado) o npm / yarn

### Instalación de dependencias

```bash
pnpm install
```

### Ejecutar en modo de desarrollo

```bash
pnpm dev
```

La aplicación estará accesible en `http://localhost:3000`.

## 📦 Producción y Despliegue

### Construcción estándar (Node.js)

Para construir la aplicación para un entorno Node.js:

```bash
pnpm build
```

### Generación Estática (SSG)

Para generar una versión estática de la aplicación:

```bash
pnpm generate
```

**¿Por qué usar la generación estática?**

- **Simplicidad de alojamiento**: Los archivos generados en la carpeta `.output/public` pueden alojarse en cualquier servidor.
- **Rendimiento**: Las páginas están pre-renderizadas, lo que permite una carga casi instantánea.

## 📄 Licencia

Este proyecto está bajo la licencia **GNU General Public License v3.0**. Consulte el archivo [LICENSE](LICENSE) para más detalles.
