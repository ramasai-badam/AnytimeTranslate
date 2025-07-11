import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

// For web platform, we'll use the Web Speech API
// For native platforms, you'd use expo-speech-recognition or react-native-voice
export function useSpeechToText(language: string = 'en-US') {
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web Speech API implementation
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setSpeechText(finalTranscript || interimTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setError('Speech recognition not supported in this browser');
      }
    }

    return () => {
      if (recognitionRef.current && Platform.OS === 'web') {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const startListening = async () => {
    try {
      setError(null);
      setSpeechText('');

      if (Platform.OS === 'web') {
        if (recognitionRef.current) {
          recognitionRef.current.lang = language;
          recognitionRef.current.start();
        } else {
          throw new Error('Speech recognition not available');
        }
      } else {
        // For native platforms, you would use expo-speech-recognition here
        // This is a fallback for testing
        setIsListening(true);
        // Simulate speech recognition for native platforms
        setTimeout(() => {
          setSpeechText('Hello, this is a test message for native platforms');
          setIsListening(false);
        }, 2000);
      }
    } catch (error) {
      setError(`Failed to start speech recognition: ${error}`);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    if (Platform.OS === 'web' && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const clearText = () => {
    setSpeechText('');
    setError(null);
  };

  return {
    isListening,
    speechText,
    error,
    startListening,
    stopListening,
    clearText,
  };
}