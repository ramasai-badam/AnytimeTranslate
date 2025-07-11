# Speech Translation App

A React Native app that provides real-time speech translation using local AI models. The app features a split-screen interface where two users can speak in different languages and get instant translations.

## Features

- **Local AI Translation**: Uses llama.rn to run GGUF models locally
- **Speech-to-Text**: Real-time speech recognition using Web Speech API (web) or expo-speech-recognition (native)
- **Text-to-Speech**: High-quality speech synthesis using expo-speech
- **Dual Interface**: Split screen design for two-way conversations
- **Language Selection**: Support for 12+ languages
- **Offline Capability**: Works completely offline once models are downloaded
- **Model Management**: Download, select, and manage GGUF models

## Setup Instructions

### 1. Install Dependencies

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

## Usage

1. **Download a Model**: Tap the status indicator and download a GGUF model
2. **Select Languages**: Use the dropdown selectors for source and target languages
3. **Record Speech**: Hold the microphone button to record speech
4. **Auto-Translation**: Release to stop recording and trigger automatic translation
5. **Listen to Translation**: Tap the speaker button to hear the translated text
6. **Swap Languages**: Use the rotate button to reverse translation direction

## Supported Languages

- English, Spanish, French, German, Italian, Portuguese
- Russian, Japanese, Korean, Chinese, Arabic, Hindi

## Development

```bash
# Start development server
npm run dev

# Build for web
npm run build:web

# Run on Android
npm run android

# Run on iOS
npm run ios
```