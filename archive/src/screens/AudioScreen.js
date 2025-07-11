/**
 * AudioScreen - Environmental sound analysis using Gemma 3n
 * Records and analyzes environmental sounds for biodiversity assessment
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import {
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  ActivityIndicator,
  Portal,
  Modal,
  Surface,
  ProgressBar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import GemmaService from '../services/GemmaService';
import DatabaseService from '../services/DatabaseService';

const { width, height } = Dimensions.get('window');

export default function AudioScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [location, setLocation] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingTimer = useRef(null);

  useEffect(() => {
    requestPermissions();
    getCurrentLocation();
    
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
      startRecordingTimer();
    } else {
      stopPulseAnimation();
      stopRecordingTimer();
    }
  }, [isRecording]);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required for environmental sound analysis.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      setHasPermission(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        const address = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          name: address[0] ? `${address[0].city}, ${address[0].region}` : 'Unknown Location',
        });
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startRecordingTimer = () => {
    setRecordingDuration(0);
    recordingTimer.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
  };

  const startRecording = async () => {
    try {
      console.log('🎤 Starting audio recording...');
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      console.log('⏹️ Stopping recording...');
      setIsRecording(false);
      
      if (!recording) return;
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
      
      console.log('📁 Recording saved to:', uri);
      
      // Start analysis
      if (uri) {
        await analyzeAudio(uri, recordingDuration);
      }
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  const analyzeAudio = async (uri, duration) => {
    try {
      setIsAnalyzing(true);
      console.log('🔊 Starting audio analysis...');
      
      // Use Gemma 3n for environmental audio analysis
      const result = await GemmaService.analyzeEnvironmentalAudio(uri, duration, location);
      
      setAnalysisResult(result);
      setShowResult(true);
      
      // Save analysis to database
      await saveAudioAnalysis(result, uri, duration);
      
      console.log('✅ Audio analysis completed');
      
    } catch (error) {
      console.error('Audio analysis error:', error);
      Alert.alert(
        'Analysis Failed',
        'Unable to analyze audio. Please try recording again in a quieter environment.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAudioAnalysis = async (result, uri, duration) => {
    try {
      const analysisData = {
        audio_uri: uri,
        duration: duration,
        detected_sounds: result.sounds,
        biodiversity_score: result.biodiversityScore,
        environmental_health: result.environmentalHealth,
        detected_species: result.species,
        location: location,
        recommendations: result.recommendations,
      };
      
      await DatabaseService.saveAudioAnalysis(analysisData);
      console.log('💾 Audio analysis saved to database');
      
    } catch (error) {
      console.error('Save audio analysis error:', error);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBiodiversityColor = (score) => {
    if (score >= 0.8) return '#2E7D32';
    if (score >= 0.6) return '#689F38';
    if (score >= 0.4) return '#FF8F00';
    return '#D32F2F';
  };

  const getHealthStatusIcon = (health) => {
    switch (health?.toLowerCase()) {
      case 'excellent':
        return 'eco';
      case 'good':
        return 'nature';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'help';
    }
  };

  const closeResult = () => {
    setShowResult(false);
    setAnalysisResult(null);
    setAudioUri(null);
    setRecordingDuration(0);
  };

  const renderAnalysisResult = () => (
    <Portal>
      <Modal
        visible={showResult}
        onDismiss={closeResult}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.resultCard}>
          <Card.Content>
            <View style={styles.resultHeader}>
              <Title style={styles.resultTitle}>Environmental Analysis</Title>
              <TouchableOpacity onPress={closeResult} style={styles.closeButton}>
                <Icon name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>
            
            {analysisResult && (
              <>
                <View style={styles.analysisOverview}>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Biodiversity Score</Text>
                    <Text style={[
                      styles.scoreValue,
                      { color: getBiodiversityColor(analysisResult.biodiversityScore) }
                    ]}>
                      {Math.round(analysisResult.biodiversityScore * 100)}%
                    </Text>
                    <ProgressBar
                      progress={analysisResult.biodiversityScore}
                      color={getBiodiversityColor(analysisResult.biodiversityScore)}
                      style={styles.scoreBar}
                    />
                  </View>
                  
                  <View style={styles.healthContainer}>
                    <Icon
                      name={getHealthStatusIcon(analysisResult.environmentalHealth)}
                      size={32}
                      color={getBiodiversityColor(analysisResult.biodiversityScore)}
                    />
                    <Text style={styles.healthStatus}>
                      {analysisResult.environmentalHealth} Health
                    </Text>
                  </View>
                </View>
                
                {analysisResult.sounds && analysisResult.sounds.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detected Sounds</Text>
                    <View style={styles.soundsContainer}>
                      {analysisResult.sounds.map((sound, index) => (
                        <Chip
                          key={index}
                          mode="outlined"
                          style={styles.soundChip}
                          icon="volume-up"
                        >
                          {sound}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}
                
                {analysisResult.species && analysisResult.species.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Identified Species</Text>
                    {analysisResult.species.map((species, index) => (
                      <View key={index} style={styles.speciesItem}>
                        <Icon name="pets" size={20} color="#2E7D32" />
                        <Text style={styles.speciesText}>{species}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recommendations</Text>
                    {analysisResult.recommendations.map((recommendation, index) => (
                      <View key={index} style={styles.listItem}>
                        <Icon name="lightbulb" size={16} color="#FF8F00" />
                        <Text style={styles.listText}>{recommendation}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={styles.recordingInfo}>
                  <View style={styles.infoItem}>
                    <Icon name="timer" size={16} color="#757575" />
                    <Text style={styles.infoText}>
                      Duration: {formatDuration(recordingDuration)}
                    </Text>
                  </View>
                  
                  {location && (
                    <View style={styles.infoItem}>
                      <Icon name="location-on" size={16} color="#757575" />
                      <Text style={styles.infoText}>{location.name}</Text>
                    </View>
                  )}
                </View>
              </>
            )}
            
            <View style={styles.resultActions}>
              <Button
                mode="outlined"
                onPress={closeResult}
                style={styles.actionButton}
              >
                Record Again
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  closeResult();
                  // Could navigate to detailed analysis screen
                }}
                style={[styles.actionButton, styles.primaryButton]}
              >
                View Details
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  const renderRecordingInterface = () => (
    <View style={styles.recordingContainer}>
      <View style={styles.visualizer}>
        <Animated.View
          style={[
            styles.recordButton,
            {
              transform: [{ scale: pulseAnim }],
              backgroundColor: isRecording ? '#D32F2F' : '#2E7D32',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.recordButtonInner}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <Icon
                name={isRecording ? 'stop' : 'mic'}
                size={48}
                color="#FFFFFF"
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      <View style={styles.recordingInfo}>
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>
              Recording: {formatDuration(recordingDuration)}
            </Text>
          </View>
        )}
        
        {isAnalyzing && (
          <View style={styles.analysisIndicator}>
            <Text style={styles.analysisText}>
              🤖 Analyzing with Gemma 3n...
            </Text>
            <ActivityIndicator size="small" color="#2E7D32" style={styles.analysisSpinner} />
          </View>
        )}
        
        {!isRecording && !isAnalyzing && (
          <Text style={styles.instructionText}>
            Tap to start recording environmental sounds
          </Text>
        )}
      </View>
    </View>
  );

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.permissionText}>Requesting microphone permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="mic-off" size={64} color="#BDBDBD" />
        <Text style={styles.permissionTitle}>Microphone Access Required</Text>
        <Text style={styles.permissionText}>
          Please grant microphone permissions to analyze environmental sounds
        </Text>
        <Button
          mode="contained"
          onPress={requestPermissions}
          style={styles.permissionButton}
        >
          Grant Permissions
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Environmental Sound Analysis</Title>
        <Paragraph style={styles.headerSubtitle}>
          Record nature sounds to assess biodiversity and ecosystem health
        </Paragraph>
        
        {location && (
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={16} color="#81C784" />
            <Text style={styles.locationText}>{location.name}</Text>
          </View>
        )}
      </View>
      
      {renderRecordingInterface()}
      
      <Card style={styles.tipsCard}>
        <Card.Content>
          <Title style={styles.tipsTitle}>Recording Tips</Title>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Icon name="volume-up" size={16} color="#2E7D32" />
              <Text style={styles.tipText}>Find a quiet outdoor location</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="timer" size={16} color="#2E7D32" />
              <Text style={styles.tipText}>Record for 30-60 seconds for best results</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="nature" size={16} color="#2E7D32" />
              <Text style={styles.tipText}>Early morning or evening are ideal times</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="phone-android" size={16} color="#2E7D32" />
              <Text style={styles.tipText}>Hold device steady and avoid wind noise</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      {renderAnalysisResult()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#81C784',
    textAlign: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#81C784',
    marginLeft: 4,
  },
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  visualizer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingInfo: {
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D32F2F',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
  },
  analysisIndicator: {
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  analysisText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B5E20',
    marginBottom: 8,
  },
  analysisSpinner: {
    marginTop: 4,
  },
  instructionText: {
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
    fontWeight: '500',
  },
  tipsCard: {
    margin: 16,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    color: '#1B5E20',
    marginLeft: 8,
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#81C784',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#2E7D32',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  resultCard: {
    maxHeight: height * 0.8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  closeButton: {
    padding: 4,
  },
  analysisOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreBar: {
    width: 80,
    height: 4,
  },
  healthContainer: {
    alignItems: 'center',
    marginLeft: 20,
  },
  healthStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  soundsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  soundChip: {
    marginRight: 6,
    marginBottom: 6,
  },
  speciesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  speciesText: {
    fontSize: 14,
    color: '#1B5E20',
    marginLeft: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  listText: {
    fontSize: 14,
    color: '#1B5E20',
    marginLeft: 8,
    flex: 1,
  },
  recordingInfo: {
    marginTop: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#2E7D32',
  },
});