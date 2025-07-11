import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Download, Trash2, CheckCircle } from 'lucide-react-native';
import { ModelManager, AVAILABLE_MODELS, ModelInfo } from '@/utils/modelManager';

interface ModelDownloaderProps {
  visible: boolean;
  onClose: () => void;
  onModelSelected?: (modelPath: string) => void;
}

export default function ModelDownloader({ visible, onClose, onModelSelected }: ModelDownloaderProps) {
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentModel, setCurrentModel] = useState<string | null>(null);

  const modelManager = ModelManager.getInstance();

  useEffect(() => {
    if (visible) {
      loadInstalledModels();
      loadCurrentModel();
    }
  }, [visible]);

  const loadInstalledModels = async () => {
    try {
      const models = await modelManager.getInstalledModels();
      setInstalledModels(models);
    } catch (error) {
      console.error('Failed to load installed models:', error);
    }
  };

  const loadCurrentModel = async () => {
    try {
      const model = await modelManager.getCurrentModel();
      setCurrentModel(model);
    } catch (error) {
      console.error('Failed to load current model:', error);
    }
  };

  const handleDownloadModel = async (model: ModelInfo) => {
    try {
      setDownloadingModel(model.fileName);
      setDownloadProgress(0);

      const modelPath = await modelManager.downloadModel(model, (progress) => {
        setDownloadProgress(progress);
      });

      Alert.alert('Success', `${model.name} downloaded successfully!`);
      await loadInstalledModels();
      await loadCurrentModel();
      onModelSelected?.(modelPath);
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Download Failed', `Failed to download ${model.name}. Please try again.`);
    } finally {
      setDownloadingModel(null);
      setDownloadProgress(0);
    }
  };

  const handleDeleteModel = async (modelPath: string) => {
    const modelName = modelPath.split('/').pop() || 'Unknown Model';
    
    Alert.alert(
      'Delete Model',
      `Are you sure you want to delete ${modelName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await modelManager.deleteModel(modelPath);
              await loadInstalledModels();
              await loadCurrentModel();
              Alert.alert('Success', 'Model deleted successfully!');
            } catch (error) {
              console.error('Delete failed:', error);
              Alert.alert('Delete Failed', 'Failed to delete model. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSelectModel = async (modelPath: string) => {
    try {
      await modelManager.setCurrentModel(modelPath);
      setCurrentModel(modelPath);
      onModelSelected?.(modelPath);
      Alert.alert('Success', 'Model selected successfully!');
    } catch (error) {
      console.error('Failed to select model:', error);
      Alert.alert('Error', 'Failed to select model. Please try again.');
    }
  };

  const isModelInstalled = (fileName: string) => {
    return installedModels.some(path => path.includes(fileName));
  };

  const getInstalledModelPath = (fileName: string) => {
    return installedModels.find(path => path.includes(fileName));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Translation Models</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Available Models</Text>
          <Text style={styles.description}>
            Download a GGUF model to enable local translation. Smaller models are faster but less accurate.
          </Text>

          {AVAILABLE_MODELS.map((model) => {
            const installed = isModelInstalled(model.fileName);
            const installedPath = getInstalledModelPath(model.fileName);
            const isCurrentModel = currentModel === installedPath;
            const isDownloading = downloadingModel === model.fileName;

            return (
              <View key={model.fileName} style={styles.modelCard}>
                <View style={styles.modelInfo}>
                  <View style={styles.modelHeader}>
                    <Text style={styles.modelName}>{model.name}</Text>
                    {isCurrentModel && (
                      <View style={styles.currentBadge}>
                        <CheckCircle size={16} color="#10b981" />
                        <Text style={styles.currentText}>Current</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.modelSize}>Size: {model.size}</Text>
                  <Text style={styles.modelDescription}>{model.description}</Text>
                </View>

                <View style={styles.modelActions}>
                  {isDownloading ? (
                    <View style={styles.downloadProgress}>
                      <ActivityIndicator size="small" color="#2563eb" />
                      <Text style={styles.progressText}>
                        {Math.round(downloadProgress)}%
                      </Text>
                    </View>
                  ) : installed ? (
                    <View style={styles.installedActions}>
                      {!isCurrentModel && (
                        <TouchableOpacity
                          style={styles.selectButton}
                          onPress={() => installedPath && handleSelectModel(installedPath)}
                        >
                          <Text style={styles.selectText}>Select</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => installedPath && handleDeleteModel(installedPath)}
                      >
                        <Trash2 size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => handleDownloadModel(model)}
                    >
                      <Download size={20} color="white" />
                      <Text style={styles.downloadText}>Download</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}

          {installedModels.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Installed Models</Text>
              {installedModels.map((modelPath) => {
                const fileName = modelPath.split('/').pop() || 'Unknown';
                const isCurrentModel = currentModel === modelPath;

                return (
                  <View key={modelPath} style={styles.installedModelCard}>
                    <View style={styles.modelInfo}>
                      <Text style={styles.installedModelName}>{fileName}</Text>
                      {isCurrentModel && (
                        <View style={styles.currentBadge}>
                          <CheckCircle size={16} color="#10b981" />
                          <Text style={styles.currentText}>Current</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.installedActions}>
                      {!isCurrentModel && (
                        <TouchableOpacity
                          style={styles.selectButton}
                          onPress={() => handleSelectModel(modelPath)}
                        >
                          <Text style={styles.selectText}>Select</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteModel(modelPath)}
                      >
                        <Trash2 size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  closeText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  modelCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modelInfo: {
    flex: 1,
    marginBottom: 12,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
  },
  modelSize: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  modelDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  modelActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  downloadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    marginLeft: 8,
    color: '#2563eb',
    fontWeight: '600',
  },
  installedActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  selectText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  installedModelCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  installedModelName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
});