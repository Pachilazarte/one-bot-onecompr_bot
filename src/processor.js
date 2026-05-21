function processData(processes, keywords) {
  console.log(`Procesando ${processes.length} procesos extraídos...`);
  const matchedProcesses = [];
  
  const normalizeText = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const normalizedKeywords = keywords.map(normalizeText);

  processes.forEach((p) => {
    const normalizedName = normalizeText(p.nombreProceso);
    const match = normalizedKeywords.some(keyword => normalizedName.includes(keyword));
    if (match) {
      matchedProcesses.push({
        ...p,
        link: `https://comprar.gob.ar/`
      });
    }
  });

  console.log(`Licitaciones coincidentes con las palabras clave: ${matchedProcesses.length}`);
  return matchedProcesses;
}

module.exports = { processData };
