# Local Speech Translation App

A React Native app that provides real-time speech translation using local AI models. The app features a split-screen interface where two users can speak in different languages and get instant translations.

## Features

- **Local AI Translation**: Ready for llama.rn integration to run GGUF models locally
- **Speech-to-Text**: Records and converts speech to text (currently mocked)
- **Text-to-Speech**: Reads translated text aloud using expo-speech
- **Dual Interface**: Split screen design for two-way conversations
- **Language Selection**: Support for 12+ languages
- **Offline Capability**: Designed to work without internet connection

## Current Implementation Status

### ✅ Completed
- UI framework with recording and TTS capabilities
- Language selection and audio controls
- Mock translation logic for testing
- Proper state management for recording/translation flow
- Visual feedback for recording and translation states

### 🔄 Ready for Integration
- llama.rn for local translation models
- Real speech-to-text implementation
- GGUF model loading and management

## Architecture

The app is structured with proper separation of concerns:

- **Hooks**: Custom hooks for translation, audio recording, and speech-to-text
- **Components**: Reusable UI components for language selection, recording indicators, and translation display
- **Mock Implementation**: Currently uses mock data for testing the complete flow

## Next Steps for Production

### 1. Export to Local Development

Since llama.rn requires native code compilation:

```bash
# Export your Expo project
npx expo eject

# Or create a development build
npx expo install expo-dev-client
npx expo run:ios # or expo run:android
```

### 2. Install llama.rn

```bash
npm install llama.rn
```

### 3. Add Translation Models

- Download GGUF translation models (recommended: quantized models like Q4_0, Q5_0)
- Place models in `assets/models/` directory
- Update `useTranslation.ts` hook with actual model paths

### 4. Implement Real Speech Recognition

Replace the mock implementation in `useSpeechToText.ts` with:

```typescript
import Voice from '@react-native-community/voice';
// or
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
```

### 5. Update Translation Hook

Replace the mock translation in `useTranslation.ts`:

```typescript
const translateText = async (text: string, fromLang: string, toLang: string) => {
  if (!llamaInstance) {
    llamaInstance = await initLlama({
      model: 'assets/models/your-translation-model.gguf',
      n_ctx: 2048,
    });
  }

  const prompt = `Translate from ${fromLang} to ${toLang}: "${text}"`;
  const result = await llamaInstance.completion({
    prompt,
    n_predict: 100,
  });

  return result.content || result.text;
};
```

## Usage

1. Select source and target languages using the dropdown selectors
2. Hold the microphone button to record speech
3. Release to stop recording and trigger translation
4. Tap the speaker button to hear the translation
5. Use the swap button to reverse language directions

## Model Recommendations

- **Lightweight**: Use quantized models (Q4_0, Q5_0) for mobile devices
- **Multilingual**: Models like mT5, NLLB, or specialized translation models
- **Size**: Keep models under 1GB for reasonable app size and performance

## Performance Considerations

- Local inference requires significant device resources
- Test on target devices for performance validation
- Consider model caching and optimization strategies
- Implement proper error handling for model loading failures

## Development Notes

- The app currently uses mock implementations to demonstrate the complete flow
- All hooks are designed to be easily replaceable with real implementations
- UI provides proper loading states and error handling
- The architecture supports both online and offline translation modes