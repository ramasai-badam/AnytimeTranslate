import { useState, useRef } from 'react';
import { initLlama, LlamaContext } from 'llama.rn';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const llamaContextRef = useRef<LlamaContext | null>(null);

  const initializeModel = async () => {
    try {
      if (llamaContextRef.current) {
        return llamaContextRef.current;
      }

      // Check if model is already cached
      const modelPath = await AsyncStorage.getItem('translation_model_path');
      
      if (!modelPath) {
        throw new Error('Translation model not found. Please download a GGUF model first.');
      }

      // Initialize LLaMA with the model
      const context = await initLlama({
        model: modelPath,
        use_mlock: true,
        n_ctx: 2048,
        n_batch: 512,
        n_threads: 4,
        embedding: false,
      });

      llamaContextRef.current = context;
      setIsModelLoaded(true);
      return context;
    } catch (error) {
      console.error('Failed to initialize translation model:', error);
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
      const context = await initializeModel();

      // Language code to full name mapping
      const languageNames: Record<string, string> = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi',
      };

      const fromLangName = languageNames[fromLanguage] || fromLanguage;
      const toLangName = languageNames[toLanguage] || toLanguage;

      // Create a translation prompt
      const prompt = `Translate the following text from ${fromLangName} to ${toLangName}. Only provide the translation, no explanations or additional text.

Text to translate: "${text}"

Translation:`;

      // Generate translation using LLaMA
      const result = await context.completion({
        prompt,
        n_predict: 256,
        temperature: 0.1,
        top_p: 0.9,
        top_k: 40,
        repeat_penalty: 1.1,
        stop: ['\n\n', 'Text to translate:', 'Translation:'],
      });

      // Extract the translation from the result
      let translation = result.text || '';
      
      // Clean up the translation
      translation = translation.trim();
      
      // Remove any remaining prompt artifacts
      translation = translation.replace(/^Translation:\s*/i, '');
      translation = translation.replace(/^["']|["']$/g, ''); // Remove quotes
      
      if (!translation) {
        throw new Error('No translation generated');
      }

      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      
      // Fallback to a simple dictionary for common phrases
      const fallbackTranslations = getFallbackTranslation(text, fromLanguage, toLanguage);
      if (fallbackTranslations) {
        return fallbackTranslations;
      }
      
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const getFallbackTranslation = (text: string, fromLang: string, toLang: string): string | null => {
    // Simple fallback dictionary for common phrases
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
    };

    const lowerText = text.toLowerCase().trim();
    return fallbackDict[lowerText]?.[toLang] || null;
  };

  const downloadModel = async (modelUrl: string, modelName: string) => {
    try {
      // This would typically download a GGUF model file
      // For now, we'll just store the path
      await AsyncStorage.setItem('translation_model_path', `models/${modelName}`);
      return true;
    } catch (error) {
      console.error('Failed to download model:', error);
      return false;
    }
  };

  const releaseModel = async () => {
    if (llamaContextRef.current) {
      await llamaContextRef.current.release();
      llamaContextRef.current = null;
      setIsModelLoaded(false);
    }
  };

  return {
    translateText,
    isTranslating,
    isModelLoaded,
    downloadModel,
    releaseModel,
    initializeModel,
  };
}