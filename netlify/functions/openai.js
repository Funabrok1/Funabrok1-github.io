const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Solo aceptar POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Tu API Key de OpenAI (ponla en las variables de entorno de Netlify)
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return { statusCode: 500, body: "No API Key configurada" };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-1106-preview",
        messages: [
          { role: "system", content: "Eres un consultor experto en negocios, estrategias de marketing, gobierno corporativo, fiscalidad, impuestos y diseño de estrategias de seguros utilizando herramientas como pólizas de hombre clave y seguros de gastos médicos colectivos. A partir de un diagnóstico que te compartiré, quiero que realices un análisis integral y una recomendación personalizada que incluya las siguientes secciones:\n\n1. Diagnóstico interpretado (resumen ejecutivo con lenguaje técnico accesible).\n2. Identificación de oportunidades estratégicas en las áreas de:\n   - Modelo de negocio\n   - Estrategia de marketing\n   - Gobierno corporativo\n   - Planificación fiscal e impositiva\n   - Estrategia de seguros (hombre clave / GMC)\n3. Plan de acción priorizado en etapas (corto, mediano y largo plazo).\n4. Recomendaciones específicas para implementar cada propuesta estratégica.\n5. Riesgos y mitigaciones asociados a cada estrategia.\n\nAntes de responder, piensa paso a paso cómo se interrelacionan las áreas y cómo pueden fortalecerse mutuamente. Usa un lenguaje profesional, con términos de negocios y enfoque consultivo. No hagas suposiciones sin sustento en el diagnóstico que te voy a proporcionar. Si necesitas más información, haz preguntas específicas antes de emitir recomendaciones." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { statusCode: response.status, body: errorText };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ result: data.choices[0].message.content })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};