const fs = require('fs');
const path = require('path');

const SUBSCRIBERS_DB = path.resolve(__dirname, '../data/subscribers.json');

function getSubscribers() {
  if (!fs.existsSync(SUBSCRIBERS_DB)) {
    // Si no existe, al menos leemos el del archivo .env para tener al administrador siempre
    const adminId = process.env.TELEGRAM_CHAT_ID;
    return adminId ? [adminId.toString()] : [];
  }
  try {
    const data = fs.readFileSync(SUBSCRIBERS_DB, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveSubscribers(subscribers) {
  const dir = path.dirname(SUBSCRIBERS_DB);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SUBSCRIBERS_DB, JSON.stringify(subscribers, null, 2));
}

async function updateSubscribersFromTelegram() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  console.log('Revisando nuevos mensajes en Telegram...');
  const url = `https://api.telegram.org/bot${token}/getUpdates`;

  try {
    const response = await fetch(url);
    if (!response.ok) return;

    const data = await response.json();
    if (!data.ok || !data.result) return;

    const currentSubscribers = getSubscribers();
    let newSubsCount = 0;

    data.result.forEach(update => {
      // Si recibimos un mensaje, capturamos el ID del chat
      if (update.message && update.message.chat && update.message.chat.id) {
        const chatId = update.message.chat.id.toString();
        if (!currentSubscribers.includes(chatId)) {
          currentSubscribers.push(chatId);
          newSubsCount++;
          console.log(`¡Nuevo suscriptor agregado! ID: ${chatId} (${update.message.from?.first_name || 'Desconocido'})`);
        }
      }
    });

    if (newSubsCount > 0) {
      saveSubscribers(currentSubscribers);
    } else {
      console.log('No hay suscriptores nuevos.');
    }
  } catch (error) {
    console.error('Error al actualizar suscriptores de Telegram:', error);
  }
}

module.exports = { getSubscribers, updateSubscribersFromTelegram };
