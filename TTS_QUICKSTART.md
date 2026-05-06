# EchoEdu Text-to-Speech Integration

This document provides quick-start instructions for the Indic Parler-TTS integration in EchoEdu.

## Quick Start

### Prerequisites
- Python 3.11+ (already installed)
- Node.js & npm
- Virtual environment with Parler-TTS (already set up)

### Step 1: Test the Installation

Run the verification script to ensure everything is installed correctly:

```bash
cd echoedu
# Activate the Python virtual environment
./Indic-TTS/tts-env/Scripts/Activate.ps1

# Run the test
python test_tts_setup.py
```

Expected output:
```
✓ PyTorch is installed
✓ Transformers is installed
✓ All dependencies are installed!
✓ Audio generated successfully
✓ ALL TESTS PASSED!
```

### Step 2: Start the Backend Server

In a new terminal:

```bash
cd echoedu/server
npm install  # if not already done
npm start
```

You should see:
```
Backend running on http://localhost:3001
```

### Step 3: Test the TTS API

In another terminal, test the API:

```bash
# Test with a simple curl request
curl -X POST http://localhost:3001/api/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "नमस्ते दुनिया",
    "language": "hindi",
    "speaker": "Divya",
    "emotion": "neutral"
  }' > response.json
```

The response will contain base64-encoded audio.

### Step 4: Use in Frontend

Use the TTS hook in your React components:

```javascript
import useTTS from '@/hooks/useTTS';

function MyComponent() {
  const { generateSpeech, playAudio, isLoading } = useTTS();

  const handleClick = async () => {
    const result = await generateSpeech({
      text: "नमस्ते",
      language: "hindi"
    });
    if (result) playAudio();
  };

  return <button onClick={handleClick} disabled={isLoading}>Speak</button>;
}
```

## File Structure

```
echoedu/
├── server/
│   ├── index.js              # Backend API server (now with TTS endpoint)
│   ├── tts_server.py         # Python TTS service worker
│   └── package.json
├── src/
│   ├── hooks/
│   │   └── useTTS.js         # React hook for TTS
│   └── ...
├── Indic-TTS/
│   ├── tts-env/              # Python virtual environment
│   └── ...
├── test_tts_setup.py         # Installation verification script
├── TTS_SETUP_GUIDE.md        # Detailed setup guide
└── TTS_QUICKSTART.md         # This file
```

## Supported Languages & Features

### Languages (20+)
- Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam
- Gujarati, Marathi, Odia, Punjabi, Sanskrit
- Assamese, Bodo, Dogri, English, Konkani, Manipuri, Nepali, Sindhi, Urdu

### Voice Customization
- **Speakers**: 69+ unique voices across languages
- **Emotions**: neutral, happy, sad, angry, expressive
- **Speed**: slow, moderate, fast
- **Pitch**: low, moderate, high

## Example: Generate Speech with Different Parameters

```javascript
const { generateSpeech, playAudio } = useTTS();

// Example 1: Simple Hindi speech
await generateSpeech({
  text: "नमस्ते",
  language: "hindi"
});

// Example 2: Bengali with specific speaker and emotion
await generateSpeech({
  text: "আপনি কেমন আছেন?",
  language: "bengali",
  speaker: "Aditi",
  emotion: "happy"
});

// Example 3: English with custom speed and pitch
await generateSpeech({
  text: "Hello, how are you?",
  language: "english",
  speaker: "Mary",
  speed: "fast",
  pitch: "high"
});

// Example 4: Tamil with expressive tone
await generateSpeech({
  text: "வணக்கம்",
  language: "tamil",
  speaker: "Jaya",
  emotion: "expressive"
});
```

## API Reference

### POST `/api/tts`

**Request Body:**
```json
{
  "text": "Text to convert to speech",
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
  "audio": "base64_encoded_wav_data",
  "sampleRate": 24000,
  "language": "hindi",
  "speaker": "Divya",
  "emotion": "neutral"
}
```

### GET `/api/health`

Check if the TTS service is running:

```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "ok",
  "tts": "available"
}
```

## Troubleshooting

### Issue: "Module not found: parler_tts"

**Solution:**
```bash
./Indic-TTS/tts-env/Scripts/Activate.ps1
pip install git+https://github.com/huggingface/parler-tts.git
```

### Issue: "CUDA out of memory" (if using GPU)

**Solution:**
Use CPU instead by modifying `tts_server.py`:
```python
device = "cpu"  # Change from auto-detection to CPU
```

### Issue: Slow first request

**Explanation:** The first request downloads the ~2GB model. Subsequent requests are much faster.

### Issue: "Failed to generate speech"

**Debug steps:**
1. Verify backend is running: `curl http://localhost:3001/api/health`
2. Check Python environment: `./Indic-TTS/tts-env/Scripts/Activate.ps1 && python -c "import parler_tts"`
3. Check backend logs for error messages
4. Ensure text is not empty

## Performance Optimization

### For Development
- Use a shorter text for testing (faster generation)
- Cache generated audio to avoid regenerating the same text
- Use the same language consecutively to keep model in memory

### For Production
- Deploy on a machine with GPU (NVIDIA recommended)
- Use a load balancer if handling multiple requests
- Implement request queuing for concurrent TTS requests
- Cache frequently used phrases

## Next Steps

1. **Integrate with Groq AI**: Generate TTS for AI responses automatically
2. **Add to Dashboard**: Create a dedicated TTS interface
3. **Mobile Support**: Test audio playback on mobile devices
4. **Error Handling**: Add user-friendly error messages
5. **Custom Voices**: Fine-tune the model for unique voices

## Resources

- [Indic Parler-TTS on Hugging Face](https://huggingface.co/ai4bharat/indic-parler-tts)
- [GitHub Repository](https://github.com/huggingface/parler-tts)
- [Research Paper](https://arxiv.org/abs/2402.01912)
- [Detailed Setup Guide](./TTS_SETUP_GUIDE.md)

## Support

For issues or questions:
1. Check the [TTS_SETUP_GUIDE.md](./TTS_SETUP_GUIDE.md) for detailed troubleshooting
2. Review the backend logs in the terminal
3. Test with the verification script: `python test_tts_setup.py`

---

**Version**: 1.0  
**Last Updated**: May 6, 2026  
**Status**: ✓ Ready for Development
