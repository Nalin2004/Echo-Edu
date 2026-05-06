import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * BCP-47 locale codes verified to work in Chrome's Web Speech API.
 * Chrome sends audio to Google's servers for recognition, so these must
 * match Google's supported locale strings exactly.
 */
const LANG_TO_BCP47 = {
  en: 'en-IN',   // English (India)
  hi: 'hi-IN',   // Hindi
  bn: 'bn-IN',   // Bengali (India)
  te: 'te-IN',   // Telugu
  mr: 'mr-IN',   // Marathi
  ta: 'ta-IN',   // Tamil
  gu: 'gu-IN',   // Gujarati
  kn: 'kn-IN',   // Kannada
  ml: 'ml-IN',   // Malayalam
  pa: 'pa-IN',   // Punjabi
  or: 'or-IN',   // Odia
  ur: 'ur-PK',   // Urdu
};

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

/**
 * useVoiceInput
 *
 * Manages microphone input via Web Speech API (SpeechRecognition).
 * Auto-sends the transcript when the user stops speaking.
 * Enter key and send button remain fully functional.
 *
 * @param {{ language: string, onTranscript: Function }} options
 */
export function useVoiceInput({ language = 'en', onTranscript }) {
  const [isListening, setIsListening]   = useState(false);
  const [transcript,  setTranscript]    = useState('');

  const recognitionRef   = useRef(null);
  const hasSentRef       = useRef(false);
  const silenceTimerRef  = useRef(null);    // manual silence detection for Indian languages
  const onTranscriptRef  = useRef(onTranscript);
  const languageRef      = useRef(language);

  // Keep refs current every render — no re-instantiation needed
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { languageRef.current     = language;     }, [language]);

  const isSupported = Boolean(SpeechRecognitionAPI);

  // ─── Cancel the silence timer ───
  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // ─── Send the captured text via the callback ───
  const sendCaptured = useCallback((text) => {
    const trimmed = (text || '').trim();
    if (trimmed && !hasSentRef.current) {
      hasSentRef.current = true;
      onTranscriptRef.current?.(trimmed);
      setTranscript('');
    }
  }, []);

  // ─── Stop listening ───
  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []); // eslint-disable-line

  // ─── Start listening ───
  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) return;

    // Abort any previous session cleanly
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) { /* ignore */ }
      recognitionRef.current = null;
    }
    clearSilenceTimer();

    const bcp47 = LANG_TO_BCP47[languageRef.current] || 'en-IN';
    const recognition = new SpeechRecognitionAPI();

    /**
     * Key settings for Indian language recognition:
     *
     * continuous: true  — Do NOT auto-stop on first pause. Indian languages
     *   have natural mid-sentence pauses; without this, Chrome stops too early.
     *   We implement our own silence detection instead (silenceTimerRef).
     *
     * interimResults: true — Show live text in the textarea as user speaks.
     *
     * lang: bcp47 — Tells Chrome which language model to use on Google's servers.
     */
    recognition.lang           = bcp47;
    recognition.continuous     = true;   // don't cut off on silence
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    hasSentRef.current = false;
    let accumulatedFinal = '';            // local accumulator, avoids stale state

    setTranscript('');
    setIsListening(true);
    recognitionRef.current = recognition;

    // ── Result handler ──
    recognition.onresult = (event) => {
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          accumulatedFinal += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }

      const display = (accumulatedFinal + interim).trim();
      if (display) setTranscript(display);

      /**
       * Silence detection: reset a 2-second timer every time we receive speech.
       * When 2s of silence passes, stop and auto-send.
       * 2s is enough to distinguish a natural pause from a sentence end,
       * while not cutting off mid-sentence for slower speakers.
       */
      clearSilenceTimer();
      silenceTimerRef.current = setTimeout(() => {
        const textToSend = accumulatedFinal.trim() || display;
        if (textToSend) {
          try { recognition.stop(); } catch (_) { /* ignore */ }
          sendCaptured(textToSend);
        }
      }, 2000);
    };

    // ── End handler ──
    recognition.onend = () => {
      clearSilenceTimer();
      setIsListening(false);
      recognitionRef.current = null;

      // Auto-send whatever we accumulated (if not already sent by timer)
      const textToSend = accumulatedFinal.trim();
      if (textToSend) {
        setTimeout(() => sendCaptured(textToSend), 60);
      } else {
        // Fall back to state if local var was somehow empty
        setTimeout(() => {
          setTranscript((current) => {
            sendCaptured(current);
            return current;
          });
        }, 60);
      }
    };

    // ── Error handler ──
    recognition.onerror = (event) => {
      clearSilenceTimer();
      const ignored = ['no-speech', 'aborted', 'interrupted'];
      if (!ignored.includes(event.error)) {
        console.error('[useVoiceInput] SpeechRecognition error:', event.error);
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    // ── Start ──
    try {
      recognition.start();
    } catch (err) {
      console.error('[useVoiceInput] Failed to start SpeechRecognition:', err);
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [sendCaptured]);

  // Re-start with new language if user switches language while mic is active
  useEffect(() => {
    if (isListening) {
      stopListening();
      setTimeout(startListening, 150);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) { /* ignore */ }
        recognitionRef.current = null;
      }
    };
  }, []); // eslint-disable-line

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
  };
}

export default useVoiceInput;
