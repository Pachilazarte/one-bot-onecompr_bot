const { chromium } = require('playwright');

async function scrapeProcesses(url) {
  console.log(`Iniciando navegador para acceder a ${url}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Página principal cargada.');

    console.log('Buscando sección de Licitaciones de apertura próxima...');
    const linkLocator = page.locator('a:has-text("Procesos con apertura pr")').first();
    await linkLocator.click();
    console.log('Accediendo a la lista de licitaciones...');

    await page.waitForTimeout(5000); // Esperar a que cargue la tabla
    
    console.log('Extrayendo datos de la tabla HTML...');
    const processes = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 5) return null;
        return {
          numProceso: cells[0].innerText.trim(),
          nombreProceso: cells[1].innerText.trim(),
          tipoProceso: cells[2].innerText.trim(),
          fechaApertura: cells[3].innerText.trim(),
          unidadEjecutora: cells[4].innerText.trim()
        };
      }).filter(p => p !== null && p.numProceso !== '');
    });

    console.log(`Se extrajeron ${processes.length} procesos de la página.`);
    await browser.close();
    return processes;

  } catch (error) {
    console.error('Error durante el scraping con Playwright:', error);
    await browser.close();
    throw error;
  }
}

module.exports = { scrapeProcesses };
