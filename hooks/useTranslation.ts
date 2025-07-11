import { useState } from 'react';

// Mock translation for now since llama.rn needs native setup
export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);

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
      // Simulate translation delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock translation responses for testing
      const mockTranslations: Record<string, Record<string, string>> = {
        'Hello, how are you today?': {
          'es': 'Hola, ¿cómo estás hoy?',
          'fr': 'Bonjour, comment allez-vous aujourd\'hui?',
          'de': 'Hallo, wie geht es dir heute?',
          'it': 'Ciao, come stai oggi?',
          'pt': 'Olá, como você está hoje?',
          'ru': 'Привет, как дела сегодня?',
          'ja': 'こんにちは、今日はいかがですか？',
          'ko': '안녕하세요, 오늘 어떻게 지내세요?',
          'zh': '你好，你今天怎么样？',
          'ar': 'مرحبا، كيف حالك اليوم؟',
          'hi': 'नमस्ते, आज आप कैसे हैं?',
        }
      };

      const translation = mockTranslations[text]?.[toLanguage] || `[${toLanguage.toUpperCase()}] ${text}`;
      
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translateText,
    isTranslating,
  };
}