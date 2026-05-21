const nodemailer = require('nodemailer');

async function sendAlertEmail(newProcesses) {
  if (newProcesses.length === 0) {
    console.log('No hay nuevos procesos para notificar por email.');
    return;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ALERT_RECIPIENTS } = process.env;

  if (!SMTP_USER || !SMTP_PASS || !ALERT_RECIPIENTS) {
    console.warn('Faltan credenciales de correo en el archivo .env. Saltando notificación por email.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.gmail.com',
    port: SMTP_PORT || 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  let htmlContent = `
    <h2>Nuevas Licitaciones en COMPR.AR</h2>
    <p>Se han encontrado <strong>${newProcesses.length}</strong> nuevas licitaciones que coinciden con tus palabras clave:</p>
    <ul>
  `;

  newProcesses.forEach(p => {
    htmlContent += `
      <li style="margin-bottom: 10px;">
        <strong>Proceso:</strong> ${p.numProceso}<br/>
        <strong>Descripción:</strong> ${p.nombreProceso}<br/>
        <strong>Tipo:</strong> ${p.tipoProceso}<br/>
        <strong>Apertura:</strong> ${p.fechaApertura}<br/>
        <strong>Unidad:</strong> ${p.unidadEjecutora}<br/>
      </li>
    `;
  });

  htmlContent += `</ul><p>Saludos,<br/>Tu Bot de Scraping</p>`;

  try {
    const info = await transporter.sendMail({
      from: `"Bot COMPR.AR" <${SMTP_USER}>`,
      to: ALERT_RECIPIENTS,
      subject: `Nuevas Licitaciones Encontradas (${newProcesses.length})`,
      html: htmlContent,
    });

    console.log('Correo enviado exitosamente:', info.messageId);
  } catch (error) {
    console.error('Error enviando el correo:', error);
  }
}

const { getSubscribers } = require('./subscribers');

async function sendTelegramAlert(messageText) {
  if (!messageText) return;

  const { TELEGRAM_BOT_TOKEN } = process.env;

  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Falta TELEGRAM_BOT_TOKEN en el archivo .env. Saltando notificación por Telegram.');
    return;
  }

  const subscribers = getSubscribers();

  if (subscribers.length === 0) {
    console.log('No hay suscriptores guardados para enviar el mensaje por Telegram.');
    return;
  }

  const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  console.log(`Enviando alerta de Telegram a ${subscribers.length} suscriptores...`);

  for (const chatId of subscribers) {
    try {
      const response = await fetch(telegramApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'Markdown'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error enviando a ${chatId}:`, errorData);
      } else {
        console.log(`Mensaje enviado exitosamente a ${chatId}.`);
      }
    } catch (error) {
      console.error(`Error de red enviando a ${chatId}:`, error);
    }
  }
}

module.exports = { sendAlertEmail, sendTelegramAlert };
