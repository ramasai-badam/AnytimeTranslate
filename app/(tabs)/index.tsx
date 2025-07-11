import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Mic, Volume2, RotateCcw, Settings } from 'lucide-react-native';
import LanguageSelector from '@/components/LanguageSelector';
import RecordingIndicator from '@/components/RecordingIndicator';
import TranslationDisplay from '@/components/TranslationDisplay';
import ModelDownloader from '@/components/ModelDownloader';
import { useTranslation } from '@/hooks/useTranslation';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

const { height } = Dimensions.get('window');

export default function TranslatorScreen() {
  const [topLanguage, setTopLanguage] = useState('en');
  const [bottomLanguage, setBottomLanguage] = useState('es');
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [isTopRecording, setIsTopRecording] = useState(false);
  const [isBottomRecording, setIsBottomRecording] = useState(false);
  const [showModelDownloader, setShowModelDownloader] = useState(false);

  const { translateText, isTranslating, isModelLoaded, initializeModel } = useTranslation();
  const { startRecording, stopRecording, isRecording } = useAudioRecording();
  const { speak: speakText, isSpeaking, stop: stopSpeaking } = useTextToSpeech();
  
  const { 
    speechText: topSpeechText, 
    startListening: startTopListening, 
    stopListening: stopTopListening, 
    isListening: isTopListening,
    clearText: clearTopText,
    isSupported: topSpeechSupported
  } = useSpeechToText(getLanguageCode(topLanguage));
  
  const { 
    speechText: bottomSpeechText, 
    startListening: startBottomListening, 
    stopListening: stopBottomListening, 
    isListening: isBottomListening,
    clearText: clearBottomText,
    isSupported: bottomSpeechSupported
  } = useSpeechToText(getLanguageCode(bottomLanguage));

  useEffect(() => {
    const initModel = async () => {
      try {
        await initializeModel();
      } catch (error) {
        console.log('Model not initialized yet:', error);
      }
    };
    
    initModel();
  }, []);

  function getLanguageCode(lang: string): string {
    const langMap: Record<string, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-BR',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
    };
    return langMap[lang] || 'en-US';
  }

  const handleStartRecording = async (isTop: boolean) => {
    try {
      await stopSpeaking();

      if (isTop) {
        setIsTopRecording(true);
        clearTopText();
        setTopText('');
        if (topSpeechSupported) {
          await startTopListening();
        }
        await startRecording();
      } else {
        setIsBottomRecording(true);
        clearBottomText();
        setBottomText('');
        if (bottomSpeechSupported) {
          await startBottomListening();
        }
        await startRecording();
      }
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please check microphone permissions.');
      setIsTopRecording(false);
      setIsBottomRecording(false);
    }
  };

  const handleStopRecording = async (isTop: boolean) => {
    try {
      await stopRecording();
      
      if (isTop) {
        if (topSpeechSupported) {
          await stopTopListening();
        }
        setIsTopRecording(false);
        
        if (topSpeechText.trim()) {
          setTopText(topSpeechText);
          
          try {
            const translatedText = await translateText(topSpeechText, topLanguage, bottomLanguage);
            setBottomText(translatedText);
          } catch (translationError) {
            console.error('Translation failed:', translationError);
            Alert.alert('Translation Error', 'Failed to translate text. Please try again.');
          }
        }
      } else {
        if (bottomSpeechSupported) {
          await stopBottomListening();
        }
        setIsBottomRecording(false);
        
        if (bottomSpeechText.trim()) {
          setBottomText(bottomSpeechText);
          
          try {
            const translatedText = await translateText(bottomSpeechText, bottomLanguage, topLanguage);
            setTopText(translatedText);
          } catch (translationError) {
            console.error('Translation failed:', translationError);
            Alert.alert('Translation Error', 'Failed to translate text. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to process recording');
    } finally {
      setIsTopRecording(false);
      setIsBottomRecording(false);
    }
  };

  const handleSpeak = async (text: string, language: string) => {
    if (!text.trim()) {
      Alert.alert('No Text', 'No text to speak');
      return;
    }

    try {
      await speakText(text, language);
    } catch (error) {
      console.error('Speech error:', error);
      Alert.alert('Speech Error', 'Failed to speak text');
    }
  };

  const swapLanguages = () => {
    setTopLanguage(bottomLanguage);
    setBottomLanguage(topLanguage);
    setTopText(bottomText);
    setBottomText(topText);
  };

  const showModelInfo = () => {
    setShowModelDownloader(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Model Status Indicator */}
      <View style={styles.statusBar}>
        <TouchableOpacity onPress={showModelInfo} style={styles.statusButton}>
          <View style={[styles.statusIndicator, { backgroundColor: isModelLoaded ? '#10b981' : '#ef4444' }]} />
          <Text style={styles.statusText}>
            {isModelLoaded ? 'Model Ready' : 'Download Model'}
          </Text>
          <Settings size={16} color="white" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
      
      {/* Top Section (Rotated 180 degrees) */}
      <View style={[styles.section, styles.topSection]}>
        <View style={styles.rotatedContent}>
          <LanguageSelector
            selectedLanguage={topLanguage}
            onLanguageChange={setTopLanguage}
            isRotated={true}
          />
          
          <TranslationDisplay
            text={isTopRecording ? (topSpeechText || 'Listening...') : topText}
            isRotated={true}
            isLoading={isTopRecording || (isTranslating && isTopRecording)}
          />
          
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.micButton, isTopRecording && styles.recordingButton]}
              onPressIn={() => handleStartRecording(true)}
              onPressOut={() => handleStopRecording(true)}
              disabled={isBottomRecording || isTranslating || isSpeaking}
            >
              <Mic size={32} color="white" />
              {isTopRecording && <RecordingIndicator />}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.speakerButton, isSpeaking && styles.speakingButton]}
              onPress={() => handleSpeak(topText, topLanguage)}
              disabled={!topText.trim() || isRecording || isTranslating}
            >
              <Volume2 size={28} color={topText.trim() && !isRecording && !isTranslating ? "white" : "#666"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Center Divider with Swap Button */}
      <View style={styles.divider}>
        <TouchableOpacity 
          style={styles.swapButton} 
          onPress={swapLanguages}
          disabled={isRecording || isTranslating || isSpeaking}
        >
          <RotateCcw size={24} color="white" />
        </TouchableOpacity>
        
        {isTranslating && (
          <Text style={styles.translatingText}>Translating...</Text>
        )}
        
        {isSpeaking && (
          <Text style={styles.translatingText}>Speaking...</Text>
        )}
      </View>

      {/* Bottom Section */}
      <View style={[styles.section, styles.bottomSection]}>
        <LanguageSelector
          selectedLanguage={bottomLanguage}
          onLanguageChange={setBottomLanguage}
          isRotated={false}
        />
        
        <TranslationDisplay
          text={isBottomRecording ? (bottomSpeechText || 'Listening...') : bottomText}
          isRotated={false}
          isLoading={isBottomRecording || (isTranslating && isBottomRecording)}
        />
        
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.micButton, isBottomRecording && styles.recordingButton]}
            onPressIn={() => handleStartRecording(false)}
            onPressOut={() => handleStopRecording(false)}
            disabled={isTopRecording || isTranslating || isSpeaking}
          >
            <Mic size={32} color="white" />
            {isBottomRecording && <RecordingIndicator />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.speakerButton, isSpeaking && styles.speakingButton]}
            onPress={() => handleSpeak(bottomText, bottomLanguage)}
            disabled={!bottomText.trim() || isRecording || isTranslating}
          >
            <Volume2 size={28} color={bottomText.trim() && !isRecording && !isTranslating ? "white" : "#666"} />
          </TouchableOpacity>
        </View>
      </View>

      <ModelDownloader
        visible={showModelDownloader}
        onClose={() => setShowModelDownloader(false)}
        onModelSelected={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  statusBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 1000,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  topSection: {
    backgroundColor: '#2563eb',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  bottomSection: {
    backgroundColor: '#dc2626',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  rotatedContent: {
    flex: 1,
    transform: [{ rotate: '180deg' }],
    justifyContent: 'space-between',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: 'white',
  },
  speakerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  speakingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: 'white',
  },
  divider: {
    height: 80,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swapButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  translatingText: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
    opacity: 0.8,
  },
});