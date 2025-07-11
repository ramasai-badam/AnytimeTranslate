# Local Speech Translation App

A React Native app that provides real-time speech translation using local AI models. The app features a split-screen interface where two users can speak in different languages and get instant translations using LLaMA models.

## Features

- **Local AI Translation**: Uses llama.rn to run GGUF models locally
- **Speech-to-Text**: Real-time speech recognition using Web Speech API (web) or native APIs
- **Text-to-Speech**: High-quality speech synthesis using expo-speech
- **Dual Interface**: Split screen design for two-way conversations
- **Language Selection**: Support for 12+ languages
- **Offline Capability**: Works completely offline once models are downloaded
- **Model Management**: Download, select, and manage GGUF models

## Implementation Status

### ✅ Completed
- Real speech-to-text using Web Speech API (web platform)
- LLaMA integration for local translation
- Text-to-speech using expo-speech
- Model download and management system
- Complete UI with recording and translation states
- Proper error handling and user feedback

### 🔄 Platform-Specific Notes
- **Web**: Uses Web Speech API for speech recognition
- **Native**: Requires expo-speech-recognition or react-native-voice for STT

## Architecture

The app uses a modular architecture with:

- **Hooks**: Custom hooks for translation, audio recording, speech-to-text, and TTS
- **Components**: Reusable UI components with proper state management
- **Utils**: Model management utilities for downloading and organizing GGUF files
- **Real Implementation**: All functionality is implemented with actual libraries

## Setup Instructions

### 1. Install Dependencies

The required dependencies are already added to package.json:

```bash
npm install
```

### 2. For Native Platforms (iOS/Android)

Since this uses native dependencies, you'll need to create a development build:

```bash
# Install Expo CLI if you haven't
npm install -g @expo/cli

# Create a development build
npx expo install expo-dev-client
npx expo run:ios # or expo run:android
```

### 3. Download Translation Models

The app includes a model downloader that can fetch GGUF models from Hugging Face:

1. Open the app and tap the model status indicator
2. Select "Download Models" 
3. Choose a model (recommended: Mistral 7B Instruct Q4_0 for best balance)
4. Wait for download to complete

### 4. Recommended Models

- **Mistral 7B Instruct (Q4_0)**: 4.1GB - Best quality/size balance
- **LLaMA 2 7B Chat (Q4_0)**: 3.8GB - Good general performance  
- **CodeLlama 7B Instruct (Q4_0)**: 3.8GB - Optimized for instructions

## Usage

1. **Download a Model**: Tap the status indicator and download a GGUF model
2. **Select Languages**: Use the dropdown selectors for source and target languages
3. **Record Speech**: Hold the microphone button to record speech
4. **Auto-Translation**: Release to stop recording and trigger automatic translation
5. **Listen to Translation**: Tap the speaker button to hear the translated text
6. **Swap Languages**: Use the rotate button to reverse translation direction

## Technical Implementation

### Speech-to-Text
- **Web**: Uses browser's Web Speech API with real-time recognition
- **Native**: Ready for expo-speech-recognition integration

### Translation
- **Engine**: LLaMA models running locally via llama.rn
- **Models**: GGUF format models (Q4_0 quantization recommended)
- **Prompting**: Optimized prompts for translation tasks

### Text-to-Speech
- **Engine**: expo-speech with language-specific voice selection
- **Quality**: Enhanced quality mode when available
- **Languages**: Supports all major languages with proper voice mapping

### Model Management
- **Download**: Automatic download from Hugging Face
- **Storage**: Local storage in app documents directory
- **Selection**: Easy model switching with persistent selection

## Performance Considerations

- **Model Size**: Q4_0 quantized models provide best performance/quality balance
- **Memory**: 4-8GB RAM recommended for 7B models
- **Storage**: 3-5GB free space needed per model
- **CPU**: Modern ARM processors recommended for real-time translation

## File Structure

```
hooks/
├── useAudioRecording.ts    # Audio recording with expo-av
├── useSpeechToText.ts      # Speech recognition (Web Speech API)
├── useTextToSpeech.ts      # Text-to-speech with expo-speech
└── useTranslation.ts       # LLaMA integration for translation

components/
├── LanguageSelector.tsx    # Language selection dropdown
├── ModelDownloader.tsx     # Model management interface
├── RecordingIndicator.tsx  # Visual recording feedback
└── TranslationDisplay.tsx  # Translation text display

utils/
└── modelManager.ts         # GGUF model download and management
```

## Troubleshooting

### Model Loading Issues
- Ensure sufficient storage space (5GB+ recommended)
- Check internet connection for model downloads
- Verify model file integrity after download

### Speech Recognition Issues
- **Web**: Ensure microphone permissions are granted
- **Native**: Install expo-speech-recognition for production use
- Check browser compatibility for Web Speech API

### Translation Quality
- Try different models for better results
- Ensure proper language selection
- Use shorter phrases for better accuracy

### Performance Issues
- Use smaller models (Q4_0 instead of Q8_0)
- Close other apps to free memory
- Consider using cloud translation for resource-constrained devices

## Development Notes

- All implementations use real libraries and APIs
- Web Speech API provides excellent STT on supported browsers
- LLaMA integration is production-ready with proper error handling
- Model management system handles downloads and storage automatically
- The app is designed for offline use once models are downloaded

## Next Steps

1. **Add More Models**: Integrate specialized translation models
2. **Improve Prompting**: Fine-tune translation prompts for better results
3. **Add Caching**: Cache translations for repeated phrases
4. **Optimize Performance**: Implement model quantization and optimization
5. **Add Languages**: Extend language support with more voice options