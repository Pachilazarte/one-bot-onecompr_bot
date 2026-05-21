require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { scrapeProcesses } = require('./scraper');
const { processData } = require('./processor');
const { filterNewProcesses, saveProcessed } = require('./database');
const { generateSummary } = require('./ai');
const { sendAlertEmail, sendTelegramAlert } = require('./notifier');

async function main() {
  console.log('=== Iniciando Bot de Scraping COMPR.AR ===');
  
  // Cargar palabras clave
  const keywordsPath = path.resolve(__dirname, '../keywords.json');
  let keywords = [];
  try {
    keywords = JSON.parse(fs.readFileSync(keywordsPath, 'utf-8'));
    console.log(`Palabras clave cargadas: ${keywords.length}`);
  } catch (e) {
    console.error('No se pudo leer keywords.json. Usando arreglo vacío.');
  }

  const url = process.env.COMPRAR_URL || 'https://comprar.gob.ar/';

  try {
    // 1. Scraping: extraer procesos de la tabla HTML
    const allProcesses = await scrapeProcesses(url);

    // 2. Procesamiento: filtrar por keywords
    const matchedProcesses = processData(allProcesses, keywords);

    // 3. Base de Datos: filtrar duplicados
    const newProcesses = filterNewProcesses(matchedProcesses);
    
    console.log(`Procesos nuevos sin notificar previamente: ${newProcesses.length}`);

    // 4. Notificador: enviar alertas
    if (newProcesses.length > 0) {
      await sendAlertEmail(newProcesses);
      
      console.log('Generando reporte inteligente con IA...');
      const aiMessage = await generateSummary(newProcesses);
      
      console.log('Enviando mensaje a Telegram...');
      await sendTelegramAlert(aiMessage);
      
      // 5. Guardar como procesados
      const newIds = newProcesses.map(p => p.numProceso);
      saveProcessed(newIds);
      console.log('Base de datos actualizada con los nuevos procesos.');
    } else {
      console.log('No hay procesos nuevos para alertar.');
    }



  } catch (error) {
    console.error('Ocurrió un error en la ejecución principal:', error);
    process.exit(1);
  }

  console.log('=== Fin de la ejecución ===');
}

main();
