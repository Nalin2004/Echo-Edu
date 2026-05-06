# Indic Parler-TTS Integration Guide

This guide explains how to use the Indic Parler-TTS setup in your EchoEdu application.

## Overview

The TTS (Text-to-Speech) system is now integrated into EchoEdu with support for 20+ Indian languages using the **Indic Parler-TTS** model from Hugging Face.

### Key Features

- **Multilingual Support**: Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Gujarati, Marathi, and more
- **Multiple Speakers**: 69+ unique voices across supported languages
- **Emotion Control**: Express different emotions (neutral, happy, sad, angry, expressive)
- **Speed & Pitch Control**: Customize speaking rate and pitch
- **High-Quality Audio**: Generate clear, natural-sounding speech

## Installation & Setup

### 1. Install Python Environment

The TTS service requires Python with PyTorch and Transformers. Follow the setup that was already done:

```bash
cd echoedu
# The virtual environment is already created at: Indic-TTS/tts-env
```

### 2. Verify Installation

Test that all dependencies are installed:

```bash
# Activate the venv
# Windows:
./Indic-TTS/tts-env/Scripts/Activate.ps1

# Verify packages
pip list | grep -E "torch|transformers|parler"
```

### 3. Environment Variables

Create a `.env` file in the `server` directory:

```bash
# server/.env
DEVICE=cuda:0  # or 'cpu' if no GPU
TTS_MODEL_NAME=ai4bharat/indic-parler-tts
```

## Backend Usage

### Starting the Server

```bash
# Terminal 1: Install dependencies (if not already done)
npm install

# Terminal 2: Start the backend server
npm start
# or
node server/index.js
```

The backend will now expose:
- `POST /api/tts` - Generate speech
- `GET /api/health` - Check service status

### API Endpoint: POST `/api/tts`

**Request:**
```json
{
  "text": "नमस्ते, आप कैसे हैं?",
  "language": "hindi",
  "speaker": "Divya",
  "emotion": "neutral",
  "speed": "moderate",
  "pitch": "moderate"
}
```

**Response:**
```json
{
  "success": true,
  "audio": "base64_encoded_audio_data",
  "sampleRate": 24000,
  "language": "hindi",
  "speaker": "Divya",
  "emotion": "neutral"
}
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | string | Required | Text to convert to speech |
| `language` | string | "hindi" | Language code |
| `speaker` | string | null | Speaker name (auto-selected if null) |
| `emotion` | string | "neutral" | Speech emotion |
| `speed` | string | "moderate" | Speaking speed: slow, moderate, fast |
| `pitch` | string | "moderate" | Pitch level: low, moderate, high |

**Supported Languages:**
```
assamese, bengali, bodo, dogri, english, gujarati, hindi, kannada, 
konkani, maithili, malayalam, manipuri, marathi, nepali, odia, 
punjabi, sanskrit, sindhi, tamil, telugu, urdu
```

## Frontend Usage

### Using the TTS Hook

```javascript
import { useTTS } from '@/hooks/useTTS';

function MyComponent() {
  const {
    generateSpeech,
    playAudio,
    stopAudio,
    downloadAudio,
    isLoading,
    error,
    currentAudio,
    supportedLanguages,
  } = useTTS();

  const handleGenerateSpeech = async () => {
    const result = await generateSpeech({
      text: "नमस्ते दुनिया",
      language: "hindi",
      speaker: "Divya",
      emotion: "happy",
      speed: "moderate",
      pitch: "moderate",
      onProgress: (status) => console.log(status),
    });

    if (result) {
      playAudio();
    }
  };

  return (
    <div>
      <button onClick={handleGenerateSpeech} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Speech'}
      </button>

      {currentAudio && (
        <div>
          <button onClick={() => playAudio()}>Play</button>
          <button onClick={stopAudio}>Stop</button>
          <button onClick={() => downloadAudio('speech.wav')}>Download</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

### Basic Example Component

```javascript
import React, { useState } from 'react';
import useTTS from '@/hooks/useTTS';

export default function TTSDemo() {
  const { generateSpeech, playAudio, isLoading, error, supportedLanguages } = useTTS();
  const [text, setText] = useState('नमस्ते');
  const [language, setLanguage] = useState('hindi');

  const handleGenerateAndPlay = async () => {
    const result = await generateSpeech({
      text,
      language,
    });
    if (result) playAudio();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Text-to-Speech Demo</h2>

      <div>
        <label>
          Language:
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {Object.entries(supportedLanguages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label>
          Text:
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            style={{ width: '100%' }}
          />
        </label>
      </div>

      <button
        onClick={handleGenerateAndPlay}
        disabled={isLoading || !text}
      >
        {isLoading ? 'Generating...' : 'Generate & Play'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
```

## Integration with Groq AI

To integrate TTS with your Groq AI responses:

```javascript
import useTTS from '@/hooks/useTTS';

export function ChatWithTTS() {
  const { generateSpeech, playAudio } = useTTS();
  const [aiResponse, setAiResponse] = useState('');

  const handleAIResponse = async (response) => {
    setAiResponse(response);

    // Detect language from response (you can enhance this)
    const language = detectLanguage(response);

    // Generate speech from AI response
    const result = await generateSpeech({
      text: response,
      language,
      emotion: 'expressive',
      speed: 'moderate',
    });

    if (result) {
      playAudio();
    }
  };

  return (
    // Your component JSX
  );
}

function detectLanguage(text) {
  // Simple detection - enhance as needed
  if (/[ा-ह]|[^A-Za-z0-9]/.test(text)) return 'hindi';
  if (/[ে-়]/.test(text)) return 'bengali';
  // Add more patterns...
  return 'english';
}
```

## Supported Speakers by Language

Each language has recommended speakers:

- **Hindi**: Rohit, Divya
- **Bengali**: Arjun, Aditi
- **Tamil**: Jaya, Kavitha
- **Telugu**: Prakash, Lalitha
- **Kannada**: Suresh, Anu
- **Malayalam**: Anjali, Harish
- **Gujarati**: Yash, Neha
- **Marathi**: Sanjay, Sunita
- And many more...

## Performance Tips

1. **First Load**: The first TTS request will download the model (~2GB). Subsequent requests are faster.
2. **GPU Usage**: If CUDA is available, it will automatically use GPU for faster generation.
3. **Caching**: Consider caching generated audio to avoid regenerating the same text.
4. **Batch Processing**: For multiple requests, process them sequentially to manage memory.

## Troubleshooting

### "Failed to generate speech" Error

1. Ensure the backend server is running:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. Check that Python dependencies are installed:
   ```bash
   pip list | grep parler
   ```

3. Check memory: TTS requires ~4-6GB of RAM (or VRAM if using GPU)

### Slow Generation

- First request is slow due to model loading (normal)
- Use GPU if available for faster inference
- Reduce text length for faster generation

### Audio Quality Issues

- Ensure language is correctly specified
- Use "very clear audio" or "very noisy audio" in descriptions
- Check the emotion parameter matches the content

## Model Information

- **Model**: ai4bharat/indic-parler-tts
- **Base**: Parler-TTS Mini v1.1
- **License**: Apache 2.0
- **Size**: 900M parameters
- **Sample Rate**: 24000 Hz
- **Format**: WAV

## Resources

- [Hugging Face Model Card](https://huggingface.co/ai4bharat/indic-parler-tts)
- [GitHub Repository](https://github.com/huggingface/parler-tts)
- [Paper](https://arxiv.org/abs/2402.01912)

## Next Steps

1. Test the TTS endpoint with curl
2. Add TTS button to your UI components
3. Integrate with Groq AI responses
4. Customize voice characteristics as needed
5. Deploy with GPU support for production

---

For issues or questions, refer to the [Indic Parler-TTS documentation](https://huggingface.co/ai4bharat/indic-parler-tts).
