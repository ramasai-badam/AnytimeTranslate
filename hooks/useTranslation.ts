import { useState } from 'react';
import { initLlama } from 'llama.rn';

let llamaInstance: any = null;

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = async (
    text: string,
    fromLanguage: string,
    toLanguage: string
  ): Promise<string> => {
    setIsTranslating(true);

    try {
      if (!llamaInstance) {
        llamaInstance = await initLlama({
          model: 'assets/models/gemma-3n-E2B-it-IQ4_XS.gguf', // adjust path as needed
          n_ctx: 2048,
        });
      }

      const prompt = `Translate the following text from ${fromLanguage} to ${toLanguage}: "${text}"`;
      const result = await llamaInstance.completion({
        prompt,
        n_predict: 100,
      });

      return result.content || result.text || '[Translation unavailable]';
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