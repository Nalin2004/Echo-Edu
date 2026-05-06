import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const app = express();
const DEFAULT_ELEVENLABS_VOICE_ID = 'pNInz6obpgDQGcFmaJgB';
const DEFAULT_ELEVENLABS_MODEL_ID = 'eleven_v3';
const TTS_TEXT_LIMITS = {
  eleven_v3: 5000,
  eleven_multilingual_v2: 10000,
  eleven_flash_v2_5: 40000,
  eleven_turbo_v2_5: 40000,
};
const INDIAN_TTS_LANGUAGES = {
  en: { iso6391: 'en', elevenV3: 'eng', name: 'English' },
  hi: { iso6391: 'hi', elevenV3: 'hin', name: 'Hindi' },
  bn: { iso6391: 'bn', elevenV3: 'ben', name: 'Bengali' },
  te: { iso6391: 'te', elevenV3: 'tel', name: 'Telugu' },
  mr: { iso6391: 'mr', elevenV3: 'mar', name: 'Marathi' },
  ta: { iso6391: 'ta', elevenV3: 'tam', name: 'Tamil' },
  gu: { iso6391: 'gu', elevenV3: 'guj', name: 'Gujarati' },
  kn: { iso6391: 'kn', elevenV3: 'kan', name: 'Kannada' },
  ml: { iso6391: 'ml', elevenV3: 'mal', name: 'Malayalam' },
  pa: { iso6391: 'pa', elevenV3: 'pan', name: 'Punjabi' },
  or: { iso6391: 'or', elevenV3: null, name: 'Odia' },
  ur: { iso6391: 'ur', elevenV3: 'urd', name: 'Urdu' },
};
const MULTILINGUAL_V2_APP_LANGUAGES = new Set(['en', 'hi', 'ta']);

function normalizeLanguage(language) {
  const normalized = String(language || 'en').toLowerCase().split('-')[0];
  return INDIAN_TTS_LANGUAGES[normalized] ? normalized : 'en';
}

function resolveLanguageCode(language, modelId) {
  const normalized = normalizeLanguage(language);
  const config = INDIAN_TTS_LANGUAGES[normalized];

  if (modelId === 'eleven_v3') return config.elevenV3;
  if (MULTILINGUAL_V2_APP_LANGUAGES.has(normalized)) return config.iso6391;

  return null;
}

function resolveModelId(requestedModelId, language) {
  const normalized = normalizeLanguage(language);
  if (requestedModelId === 'eleven_v3' || MULTILINGUAL_V2_APP_LANGUAGES.has(normalized)) {
    return requestedModelId;
  }

  return DEFAULT_ELEVENLABS_MODEL_ID;
}

function getTextLimit(modelId) {
  return TTS_TEXT_LIMITS[modelId] || TTS_TEXT_LIMITS.eleven_v3;
}

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

for (const envFile of ['.env.local', '.env']) {
  const envPath = path.join(rootDir, envFile);
  if (!fs.existsSync(envPath)) continue;

  const entries = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && value && process.env[key] === undefined) process.env[key] = value;
  }
}

// MyMemory free translation — no API key needed
app.post('/api/translate', async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text || !targetLang) return res.status(400).json({ error: 'Missing text or targetLang' });

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json({ translated: data.responseData.translatedText });
  } catch (err) {
    res.status(500).json({ error: 'Translation failed' });
  }
});

// ElevenLabs TTS endpoint
app.post('/api/tts', async (req, res) => {
  const { text, language = 'en' } = req.body;
  const trimmedText = typeof text === 'string' ? text.trim() : '';
  
  if (!trimmedText) return res.status(400).json({ error: 'Missing text' });
  if (!process.env.ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: 'Missing ELEVENLABS_API_KEY' });
  }

  try {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_ELEVENLABS_VOICE_ID;
    const requestedModelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_ELEVENLABS_MODEL_ID;
    const modelId = resolveModelId(requestedModelId, language);
    const languageCode = resolveLanguageCode(language, modelId);
    const textLimit = getTextLimit(modelId);
    const requestBody = {
      text: trimmedText.slice(0, textLimit),
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    };

    if (languageCode) requestBody.language_code = languageCode;

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const details = await response.text();
      return res.status(response.status).json({ error: 'TTS generation failed', details });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);

  } catch (err) {
    res.status(500).json({ error: 'TTS failed', details: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    tts: 'elevenlabs',
    defaultModel: process.env.ELEVENLABS_MODEL_ID || DEFAULT_ELEVENLABS_MODEL_ID,
    supportedLanguages: Object.keys(INDIAN_TTS_LANGUAGES),
  });
});

app.listen(3001, () => console.log('Backend running on http://localhost:3001'));
