import { useState } from 'react';
import * as Speech from 'expo-speech';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = async (text: string, language: string = 'en-US') => {
    if (!text.trim()) {
      return;
    }

    try {
      setIsSpeaking(true);

      // Stop any current speech
      await Speech.stop();

      // Language code mapping for expo-speech
      const languageMap: Record<string, string> = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-BR',
        'ru': 'ru-RU',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'ar': 'ar-SA',
        'hi': 'hi-IN',
      };

      const speechLanguage = languageMap[language] || language;

      // Configure speech options
      const options: Speech.SpeechOptions = {
        language: speechLanguage,
        pitch: 1.0,
        rate: 0.8,
        quality: Speech.VoiceQuality.Enhanced,
        onStart: () => {
          setIsSpeaking(true);
        },
        onDone: () => {
          setIsSpeaking(false);
        },
        onStopped: () => {
          setIsSpeaking(false);
        },
        onError: (error) => {
          console.error('Speech error:', error);
          setIsSpeaking(false);
        },
      };

      // Start speaking
      await Speech.speak(text, options);
    } catch (error) {
      console.error('Failed to speak text:', error);
      setIsSpeaking(false);
      throw error;
    }
  };

  const stop = async () => {
    try {
      await Speech.stop();
      setIsSpeaking(false);
    } catch (error) {
      console.error('Failed to stop speech:', error);
    }
  };

  const pause = async () => {
    try {
      await Speech.pause();
    } catch (error) {
      console.error('Failed to pause speech:', error);
    }
  };

  const resume = async () => {
    try {
      await Speech.resume();
    } catch (error) {
      console.error('Failed to resume speech:', error);
    }
  };

  const getAvailableVoices = async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices;
    } catch (error) {
      console.error('Failed to get available voices:', error);
      return [];
    }
  };

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    getAvailableVoices,
  };
}