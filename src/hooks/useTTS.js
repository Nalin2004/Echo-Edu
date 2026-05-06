import { useCallback, useRef, useState } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

export const useTTS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const audioRef = useRef(null);

  const generateSpeech = useCallback(async ({ text, language = 'en', onProgress = null }) => {
    if (!text?.trim()) {
      setError('Text cannot be empty');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      onProgress?.('Connecting to TTS service...');

      const response = await fetch(`${API_BASE_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'TTS generation failed');
      }

      onProgress?.('Generating audio...');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const nextAudio = { url: audioUrl, blob: audioBlob, text };

      setCurrentAudio((previousAudio) => {
        if (previousAudio?.url) URL.revokeObjectURL(previousAudio.url);
        return nextAudio;
      });

      onProgress?.('Audio ready');
      return nextAudio;
    } catch (err) {
      const errorMsg = err.message || 'Failed to generate speech';
      setError(errorMsg);
      console.error('TTS Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const playAudio = useCallback((audioUrl = null) => {
    const url = audioUrl || currentAudio?.url;
    if (!url) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch((err) => {
      console.error('Error playing audio:', err);
      setError('Failed to play audio');
    });
  }, [currentAudio]);

  const stopAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, []);

  const downloadAudio = useCallback((filename = 'echo_edu_speech.mp3') => {
    if (!currentAudio?.blob) return;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(currentAudio.blob);
    link.download = filename;
    link.click();
  }, [currentAudio]);

  const clearAudio = useCallback(() => {
    stopAudio();
    if (currentAudio?.url) URL.revokeObjectURL(currentAudio.url);
    setCurrentAudio(null);
  }, [currentAudio, stopAudio]);

  return {
    generateSpeech,
    playAudio,
    stopAudio,
    downloadAudio,
    clearAudio,
    isLoading,
    error,
    currentAudio,
  };
};

export default useTTS;
