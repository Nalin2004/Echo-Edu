import { useCallback, useRef, useState } from 'react';

const API_BASE = 'http://localhost:3001/api';

// ─── Text cleaning for TTS ────────────────────────────────────────────────────
/**
 * Strip characters that TTS engines read aloud as words.
 * Ellipses → pause, separating dashes → comma, slashes/pipes removed.
 */
function cleanTextForSpeech(raw = '') {
  return raw
    .replace(/\.{2,}/g, '. ')              // "..." → pause
    .replace(/\u2026/g, '. ')              // Unicode ellipsis …
    .replace(/\s*[\u2014\u2013]\s*/g, ', ') // em-dash / en-dash → comma
    .replace(/\s+-\s+/g, ', ')             // " - " separator → comma
    .replace(/[/|]/g, ' ')                 // slash / pipe → space
    .replace(/[\\^<>{}[\]=+]/g, ' ')       // other special chars
    .replace(/[*_`~#]/g, '')               // markdown remnants
    .replace(/[^\S\n]+/g, ' ')             // collapse spaces
    .replace(/\n{3,}/g, '\n\n')            // collapse blank lines
    .trim();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * useTTS — Text-to-Speech via the EchoEdu backend proxy.
 *
 * The backend calls Google Translate TTS server-side (no CORS issues).
 * Returns an MP3 blob that the browser plays with a plain <audio> element.
 * Supports all Indian languages: Hindi, Bengali, Tamil, Telugu, Marathi, etc.
 *
 * Exported API is backward-compatible with the previous useTTS shape.
 * New exports: speak(), stopSpeech(), isSpeaking
 */
export const useTTS = () => {
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioRef = useRef(null);    // currently playing <Audio> element

  // ── Stop playback ─────────────────────────────────────────────────────────
  const stopSpeech = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  // ── Speak ─────────────────────────────────────────────────────────────────
  const speak = useCallback(async (text, langCode = 'en') => {
    if (!text?.trim()) return;

    // Stop whatever is already playing
    stopSpeech();

    setIsLoading(true);
    setError(null);

    const cleanedText = cleanTextForSpeech(text);
    if (!cleanedText) { setIsLoading(false); return; }

    try {
      // Ask the backend to generate the audio (server-side Google TTS proxy)
      const response = await fetch(`${API_BASE}/tts`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text: cleanedText, language: langCode }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `TTS request failed: ${response.status}`);
      }

      // Create a local blob URL from the returned MP3 bytes
      const blob     = await response.blob();
      const blobUrl  = URL.createObjectURL(blob);
      const audio    = new Audio(blobUrl);
      audioRef.current = audio;

      audio.onplay  = () => { setIsLoading(false); setIsSpeaking(true);  };
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(blobUrl);    // free memory
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setIsLoading(false);
        URL.revokeObjectURL(blobUrl);
        audioRef.current = null;
        setError('Audio playback error');
      };

      await audio.play();
    } catch (err) {
      console.error('[useTTS] speak error:', err.message);
      setError(err.message);
      setIsLoading(false);
      setIsSpeaking(false);
    }
  }, [stopSpeech]);

  // ── Legacy shims (keep TutorPage.jsx call sites working) ─────────────────
  const generateSpeech = useCallback(async ({ text, language = 'en' }) => {
    await speak(text, language);
    return { url: '__server_tts__', text };
  }, [speak]);

  const playAudio = useCallback(() => {
    // No-op: speak() already starts playback
  }, []);

  const stopAudio = useCallback(() => stopSpeech(), [stopSpeech]);

  return {
    // New API
    speak,
    stopSpeech,
    isSpeaking,
    // Legacy-compatible
    generateSpeech,
    playAudio,
    stopAudio,
    isLoading,
    error,
    currentAudio: null,
  };
};

export default useTTS;
