const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('https://comprar.gob.ar/');
  await p.locator('a:has-text("Procesos con apertura pr")').first().click();
  await p.waitForTimeout(5000);
  const tableHTML = await p.evaluate(() => { 
    const t = document.querySelector('table'); 
    return t ? t.innerText.substring(0, 1000) : 'NO_TABLE'; 
  }); 
  console.log(tableHTML);
  await b.close();
})();
