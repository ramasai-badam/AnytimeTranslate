import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

interface TranslationDisplayProps {
  text: string;
  isRotated?: boolean;
  isLoading?: boolean;
}

export default function TranslationDisplay({
  text,
  isRotated = false,
  isLoading = false,
}: TranslationDisplayProps) {
  const getDisplayText = () => {
    if (isLoading) {
      return 'Processing...';
    }
    return text || 'Tap and hold the microphone to start speaking...';
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="white" />
            <Text style={[styles.text, styles.loadingText]}>
              Processing...
            </Text>
          </View>
        ) : (
          <Text style={[styles.text, isRotated && styles.rotatedText]}>
            {getDisplayText()}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    minHeight: 120,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  rotatedText: {
    // Text is already rotated by parent container
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
  },
});