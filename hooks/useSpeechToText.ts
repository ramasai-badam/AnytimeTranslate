import { useState } from 'react';
import Voice from '@react-native-community/voice';

export function useSpeechToText(language: string = 'en-US') {
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Start listening for speech
  const startListening = async () => {
    setIsListening(true);
    setSpeechText('');
    setError(null);
    Voice.onSpeechResults = (event) => {
      if (event.value && event.value.length > 0) {
        setSpeechText(event.value[0]);
      }
    };
    Voice.onSpeechError = (event) => {
      setError(event.error?.message ?? 'Unknown error');
      setIsListening(false);
    };
    try {
      await Voice.start(language);
    } catch (e: any) {
      setError(e.message);
      setIsListening(false);
    }
  };

  // Stop listening
  const stopListening = async () => {
    setIsListening(false);
    try {
      await Voice.stop();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return {
    isListening,
    speechText,
    error,
    startListening,
    stopListening,
  };
}
