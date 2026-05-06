# EchoEdu – Voice of Every Child's Future

A voice-first AI tutor app with Indian language support, Groq AI, and Web Speech API.

## 🆕 What's New

1. **Authentication** – Sign up / Login with Free & Premium tiers
2. **Dashboard** – Free users see an "Upgrade to Premium" button
3. **Groq AI** – Real AI answers via `.env` API key
4. **12 Indian Languages** – Switch language anywhere; AI responds in that language

## 🚀 Setup

### 1. Install dependencies
```bash
cd echoedu
npm install
```

### 2. Configure your API keys

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and paste your key:
```
VITE_GROQ_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
ELEVENLABS_MODEL_ID=eleven_v3
```

Get your free API key at: https://console.groq.com/
Get your ElevenLabs API key at: https://elevenlabs.io/

### 3. Add your public images

Make sure these images are in the `public/` folder:
- `child_first_page.png`
- `section3image.png`
- `favicon.svg`

### 4. Run the app
```bash
npm run dev
```

In a second terminal, run the local TTS server:
```bash
npm run server
```

Open http://localhost:5173

## 📁 Project Structure

```
src/
├── context/
│   └── AuthContext.jsx       # Auth + language state
├── components/
│   ├── Navbar.jsx            # Navbar with auth & language selector
│   ├── Navbar.css
│   ├── LanguageSelector.jsx  # Indian language dropdown
│   └── LanguageSelector.css
├── pages/
│   ├── HomePage.jsx          # Landing page
│   ├── SignupPage.jsx        # Sign up with tier selection
│   ├── LoginPage.jsx         # Login
│   ├── Dashboard.jsx         # User dashboard + upgrade button
│   ├── Dashboard.css
│   ├── TutorPage.jsx         # AI chat interface
│   ├── TutorPage.css
│   └── Auth.css
├── utils/
│   └── groq.js         # Groq API integration
├── App.jsx                   # Router setup
├── App.css                   # Homepage styles
├── Navbar.css
├── index.css
└── main.jsx
```

## 🌐 Supported Indian Languages

English, Hindi (हिंदी), Bengali (বাংলা), Telugu (తెలుగు), Marathi (मराठी),
Tamil (தமிழ்), Gujarati (ગુજરાતી), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം),
Punjabi (ਪੰਜਾਬੀ), Odia (ଓଡ଼ିଆ), Urdu (اردو)
