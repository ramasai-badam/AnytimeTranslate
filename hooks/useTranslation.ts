import { useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const initializeModel = async () => {
    try {
      const modelPath = await AsyncStorage.getItem('translation_model_path');
      
      if (!modelPath) {
        throw new Error('No translation model found. Please download a GGUF model first.');
      }

      // For now, we'll simulate model loading
      // In a real implementation, you would initialize llama.rn here
      console.log('Model would be initialized with:', modelPath);
      setIsModelLoaded(true);
      setModelError(null);
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initialize translation model:', errorMessage);
      setModelError(errorMessage);
      setIsModelLoaded(false);
      throw error;
    }
  };

  const translateText = async (
    text: string,
    fromLanguage: string,
    toLanguage: string
  ): Promise<string> => {
    if (!text.trim()) {
      return '';
    }

    setIsTranslating(true);

    try {
      // Try fallback translation first for common phrases
      const fallbackTranslation = getFallbackTranslation(text, fromLanguage, toLanguage);
      if (fallbackTranslation) {
        console.log('Using fallback translation for:', text);
        return fallbackTranslation;
      }

      // Simulate translation delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, return a simple translation
      const translation = `[${toLanguage.toUpperCase()}] ${text}`;
      
      console.log('Translation result:', translation);
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      
      const fallbackTranslation = getFallbackTranslation(text, fromLanguage, toLanguage);
      if (fallbackTranslation) {
        console.log('Using fallback translation due to error');
        return fallbackTranslation;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Translation failed: ${errorMessage}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const getFallbackTranslation = (text: string, fromLang: string, toLang: string): string | null => {
    const fallbackDict: Record<string, Record<string, string>> = {
      'hello': {
        'es': 'hola',
        'fr': 'bonjour',
        'de': 'hallo',
        'it': 'ciao',
        'pt': 'olá',
        'ru': 'привет',
        'ja': 'こんにちは',
        'ko': '안녕하세요',
        'zh': '你好',
        'ar': 'مرحبا',
        'hi': 'नमस्ते',
      },
      'thank you': {
        'es': 'gracias',
        'fr': 'merci',
        'de': 'danke',
        'it': 'grazie',
        'pt': 'obrigado',
        'ru': 'спасибо',
        'ja': 'ありがとう',
        'ko': '감사합니다',
        'zh': '谢谢',
        'ar': 'شكرا',
        'hi': 'धन्यवाद',
      },
      'goodbye': {
        'es': 'adiós',
        'fr': 'au revoir',
        'de': 'auf wiedersehen',
        'it': 'arrivederci',
        'pt': 'tchau',
        'ru': 'до свидания',
        'ja': 'さようなら',
        'ko': '안녕히 가세요',
        'zh': '再见',
        'ar': 'وداعا',
        'hi': 'अलविदा',
      },
      'yes': {
        'es': 'sí',
        'fr': 'oui',
        'de': 'ja',
        'it': 'sì',
        'pt': 'sim',
        'ru': 'да',
        'ja': 'はい',
        'ko': '네',
        'zh': '是',
        'ar': 'نعم',
        'hi': 'हाँ',
      },
      'no': {
        'es': 'no',
        'fr': 'non',
        'de': 'nein',
        'it': 'no',
        'pt': 'não',
        'ru': 'нет',
        'ja': 'いいえ',
        'ko': '아니요',
        'zh': '不',
        'ar': 'لا',
        'hi': 'नहीं',
      },
    };

    const lowerText = text.toLowerCase().trim();
    return fallbackDict[lowerText]?.[toLang] || null;
  };

  const releaseModel = async () => {
    setIsModelLoaded(false);
  };

  return {
    translateText,
    isTranslating,
    isModelLoaded,
    modelError,
    releaseModel,
    initializeModel,
  };
}