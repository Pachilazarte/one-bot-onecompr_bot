# Bot de Scraping - COMPR.AR

Bot automatizado construido con Node.js y Playwright para extraer licitaciones del portal COMPR.AR basadas en palabras clave y enviar notificaciones por correo electrónico.

## Requisitos Previos

- Node.js (v16 o superior)
- Git

## Instalación Local

1. Clonar el repositorio.
2. Instalar las dependencias de Node:
   ```bash
   npm install
   ```
3. Instalar los navegadores de Playwright:
   ```bash
   npx playwright install chromium
   ```
4. Renombrar `.env.example` a `.env` y completar las credenciales:
   - `SMTP_USER` y `SMTP_PASS` (opcionales): Para recibir alertas por email.
   - `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`: Para recibir alertas por Telegram.

## Configuración de Palabras Clave

Edita el archivo `keywords.json` agregando o quitando palabras. El sistema es "case-insensitive" y no tiene en cuenta los acentos.

## Ejecución Local

Para correr el bot manualmente:

```bash
node src/index.js
```

## Despliegue en GitHub Actions (Recomendado)

El repositorio incluye un archivo `.github/workflows/scraper.yml` configurado para correr todos los días a las 8 AM hora Argentina.

Para activarlo:
1. Sube este código a un repositorio en GitHub.
2. Ve a **Settings > Secrets and variables > Actions**.
3. Agrega los siguientes "Repository secrets" (puedes agregar los de Email, los de Telegram, o ambos):
   - `TELEGRAM_BOT_TOKEN`: El token dado por @BotFather.
   - `TELEGRAM_CHAT_ID`: El ID del grupo/chat.
   - `SMTP_USER`, `SMTP_PASS`, etc. (si usas email).
4. (Opcional) Ve a la pestaña **Actions**, selecciona "Daily COMPR.AR Scraper" y haz clic en "Run workflow" para probarlo en la nube.

## Cómo obtener credenciales de Telegram
1. Abre Telegram y busca a **@BotFather**.
2. Escribe `/newbot` y sigue los pasos para crear tu bot. Te dará un **Token** (ej: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`).
3. Agrega el bot a un grupo de tu empresa o inícia un chat con él.
4. Para obtener el **Chat ID**, envía un mensaje al grupo/chat, y luego entra en tu navegador a: `https://api.telegram.org/bot<TU_TOKEN>/getUpdates`. Busca el ID que aparece bajo la clave `"chat": {"id": ...}`.
