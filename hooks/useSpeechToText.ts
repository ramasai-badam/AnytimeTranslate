import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export function useSpeechToText(language: string = 'en-US') {
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check if speech recognition is supported
  useEffect(() => {
    const checkSupport = async () => {
      if (Platform.OS === 'web') {
        const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        setIsSupported(supported);
      } else {
        // For native platforms, check expo-speech-recognition support
        try {
          const supported = await ExpoSpeechRecognitionModule.getSupportedLocales({});
            setIsSupported(
            (supported.locales && supported.locales.length > 0) ||
            (supported.installedLocales && supported.installedLocales.length > 0)
            );
        } catch (err) {
          console.log('Speech recognition not supported on this device');
          setIsSupported(false);
        }
      }
    };
    
    checkSupport();
  }, []);

  // Handle speech recognition events for native platforms
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setError(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results && event.results.length > 0) {
      const transcript = event.results
        .map((result: any) => result.transcript)
        .join(' ');
      setSpeechText(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setError(`Speech recognition error: ${event.error}`);
    setIsListening(false);
  });

  // Web Speech API setup
  useEffect(() => {
    if (Platform.OS === 'web' && isSupported) {
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
    }

    return () => {
      if (recognitionRef.current && Platform.OS === 'web') {
        recognitionRef.current.stop();
      }
    };
  }, [language, isSupported]);

  const startListening = async () => {
    if (!isSupported) {
      setError('Speech recognition not supported on this device');
      return;
    }

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
        // For native platforms using expo-speech-recognition
        const { status } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Microphone permission not granted');
        }

        await ExpoSpeechRecognitionModule.start({
          lang: language,
          interimResults: true,
          maxAlternatives: 1,
          continuous: false,
        });
      }
    } catch (error) {
      setError(`Failed to start speech recognition: ${error}`);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      if (Platform.OS === 'web' && recognitionRef.current) {
        recognitionRef.current.stop();
      } else {
        await ExpoSpeechRecognitionModule.stop();
      }
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
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
    isSupported,
    startListening,
    stopListening,
    clearText,
  };
}