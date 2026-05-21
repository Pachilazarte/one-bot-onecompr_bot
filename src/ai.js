async function generateSummary(processes) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('No se encontró OPENROUTER_API_KEY en las variables de entorno.');
  }

  // Preparamos los datos en un formato de texto para que la IA los lea fácilmente
  let processesText = processes.map(p => 
    `Proceso: ${p.numProceso}\n` +
    `Descripción: ${p.nombreProceso}\n` +
    `Tipo: ${p.tipoProceso}\n` +
    `Apertura: ${p.fechaApertura}\n` +
    `Unidad: ${p.unidadEjecutora}`
  ).join('\n\n');

  const systemPrompt = `Eres un consultor experto en negocios y tecnología para una empresa de desarrollo de software.
Tu objetivo es analizar la lista de licitaciones públicas de Argentina que se te proporciona y redactar un mensaje CORTO, persuasivo y muy claro, ideal para enviar por Telegram a los socios de tu empresa.

REGLAS PARA EL MENSAJE:
1. Usa emojis para hacerlo visual y atractivo (🚨, 💼, 💻, etc).
2. Empieza con un título llamativo.
3. Menciona las oportunidades encontradas de forma resumida (usa viñetas o puntos cortos, menciona el número de proceso y de qué se trata).
4. Explica brevemente por qué esto es una oportunidad para la empresa (ej: "podemos ofrecer un software a medida para...", "podemos proveer el equipamiento...").
5. Agrega al final este link genérico al portal: https://comprar.gob.ar/
6. Mantén todo en máximo 2 o 3 párrafos. No lo hagas muy extenso.`;

  const userPrompt = `Aquí tienes las licitaciones nuevas encontradas hoy:\n\n${processesText}\n\nPor favor redacta el mensaje de Telegram.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error de OpenRouter: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error("Error comunicándose con OpenRouter:", error);
    throw error;
  }
}

module.exports = { generateSummary };
