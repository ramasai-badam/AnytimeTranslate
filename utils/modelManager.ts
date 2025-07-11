import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

export interface ModelInfo {
  name: string;
  size: string;
  description: string;
  downloadUrl: string;
  fileName: string;
}

// Recommended GGUF models for translation
export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    name: 'LLaMA 2 7B Chat (Q4_0)',
    size: '3.8GB',
    description: 'Good balance of quality and speed for translation tasks',
    downloadUrl: 'https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.q4_0.bin',
    fileName: 'llama-2-7b-chat.q4_0.bin',
  },
  {
    name: 'CodeLlama 7B Instruct (Q4_0)',
    size: '3.8GB',
    description: 'Optimized for instruction following, good for translation',
    downloadUrl: 'https://huggingface.co/TheBloke/CodeLlama-7B-Instruct-GGUF/resolve/main/codellama-7b-instruct.q4_0.bin',
    fileName: 'codellama-7b-instruct.q4_0.bin',
  },
  {
    name: 'Mistral 7B Instruct (Q4_0)',
    size: '4.1GB',
    description: 'High quality multilingual model',
    downloadUrl: 'https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF/resolve/main/mistral-7b-instruct-v0.1.q4_0.bin',
    fileName: 'mistral-7b-instruct-v0.1.q4_0.bin',
  },
];

export class ModelManager {
  private static instance: ModelManager;
  private modelsDir: string;

  private constructor() {
    this.modelsDir = `${RNFS.DocumentDirectoryPath}/models`;
  }

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  async initializeModelsDirectory(): Promise<void> {
    try {
      const exists = await RNFS.exists(this.modelsDir);
      if (!exists) {
        await RNFS.mkdir(this.modelsDir);
      }
    } catch (error) {
      console.error('Failed to create models directory:', error);
      throw error;
    }
  }

  async downloadModel(model: ModelInfo, onProgress?: (progress: number) => void): Promise<string> {
    try {
      await this.initializeModelsDirectory();
      
      const filePath = `${this.modelsDir}/${model.fileName}`;
      
      // Check if model already exists
      const exists = await RNFS.exists(filePath);
      if (exists) {
        console.log('Model already exists:', filePath);
        await this.setCurrentModel(filePath);
        return filePath;
      }

      console.log('Downloading model:', model.name);
      
      // Download the model
      const downloadResult = await RNFS.downloadFile({
        fromUrl: model.downloadUrl,
        toFile: filePath,
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          onProgress?.(progress);
        },
      }).promise;

      if (downloadResult.statusCode === 200) {
        console.log('Model downloaded successfully:', filePath);
        await this.setCurrentModel(filePath);
        return filePath;
      } else {
        throw new Error(`Download failed with status code: ${downloadResult.statusCode}`);
      }
    } catch (error) {
      console.error('Failed to download model:', error);
      throw error;
    }
  }

  async setCurrentModel(modelPath: string): Promise<void> {
    try {
      await AsyncStorage.setItem('translation_model_path', modelPath);
    } catch (error) {
      console.error('Failed to set current model:', error);
      throw error;
    }
  }

  async getCurrentModel(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('translation_model_path');
    } catch (error) {
      console.error('Failed to get current model:', error);
      return null;
    }
  }

  async getInstalledModels(): Promise<string[]> {
    try {
      await this.initializeModelsDirectory();
      const files = await RNFS.readDir(this.modelsDir);
      return files
        .filter(file => file.name.endsWith('.bin') || file.name.endsWith('.gguf'))
        .map(file => file.path);
    } catch (error) {
      console.error('Failed to get installed models:', error);
      return [];
    }
  }

  async deleteModel(modelPath: string): Promise<void> {
    try {
      const exists = await RNFS.exists(modelPath);
      if (exists) {
        await RNFS.unlink(modelPath);
        
        // If this was the current model, clear it
        const currentModel = await this.getCurrentModel();
        if (currentModel === modelPath) {
          await AsyncStorage.removeItem('translation_model_path');
        }
      }
    } catch (error) {
      console.error('Failed to delete model:', error);
      throw error;
    }
  }

  async getModelSize(modelPath: string): Promise<number> {
    try {
      const stat = await RNFS.stat(modelPath);
      return stat.size;
    } catch (error) {
      console.error('Failed to get model size:', error);
      return 0;
    }
  }
}