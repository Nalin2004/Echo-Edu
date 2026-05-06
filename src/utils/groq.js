const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';
const MAX_RESPONSE_TOKENS = 1200;

const LANGUAGE_INSTRUCTIONS = {
  en: 'Respond in English.',
  hi: 'Always respond in Hindi using Devanagari script only. Do not use English.',
  bn: 'Always respond in Bengali script only. Do not use English.',
  te: 'Always respond in Telugu script only. Do not use English.',
  mr: 'Always respond in Marathi using Devanagari script only. Do not use English.',
  ta: 'Always respond in Tamil script only. Do not use English.',
  gu: 'Always respond in Gujarati script only. Do not use English.',
  kn: 'Always respond in Kannada script only. Do not use English.',
  ml: 'Always respond in Malayalam script only. Do not use English.',
  pa: 'Always respond in Punjabi using Gurmukhi script only. Do not use English.',
  or: 'Always respond in Odia script only. Do not use English.',
  ur: 'Always respond in Urdu script only. Do not use English.',
};

export async function askAI(
  messages,
  languageCode = 'en',
  selectedClass = 'Class 1',
  selectedSubject = 'Mathematics'
) {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    throw new Error('Groq API key is not set. Please add VITE_GROQ_API_KEY to your .env file.');
  }

  const langInstruction = LANGUAGE_INSTRUCTIONS[languageCode] || LANGUAGE_INSTRUCTIONS.en;
  const classInstruction = `Answer as if you are teaching ${selectedClass} ${selectedSubject}. Keep the explanation simple and age-appropriate.`;

  const systemPrompt = `You are EchoEdu, a friendly AI tutor for children.
${classInstruction}
Keep answers simple, clear, and encouraging. Use examples children can relate to.
Prefer short paragraphs over lists. Finish your explanation completely and do not stop mid-sentence.
Respond in plain text only. Do not use markdown formatting (no #, *, -, bullet lists, or code formatting).
Do not use emojis or decorative symbols.
${langInstruction}`;

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: MAX_RESPONSE_TOKENS,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
}
