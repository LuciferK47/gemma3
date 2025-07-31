/**
 * CameraScreen - Species identification through camera
 * Uses Gemma 3n multimodal capabilities for real-time species identification
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
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
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import GemmaService from '../services/GemmaService';
import DatabaseService from '../services/DatabaseService';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [location, setLocation] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  
  const cameraRef = useRef(null);

  useEffect(() => {
    requestPermissions();
    getCurrentLocation();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      
      if (cameraStatus === 'granted' && mediaStatus === 'granted') {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        Alert.alert(
          'Permissions Required',
          'Camera and media library permissions are required for species identification.',
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

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsAnalyzing(true);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          exif: false,
        });
        
        setCapturedImage(photo.uri);
        
        // Save to media library
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        
        // Analyze with Gemma 3n
        await analyzeSpecies(photo.uri);
        
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
        setIsAnalyzing(false);
      }
    }
  };

  const analyzeSpecies = async (imageUri) => {
    try {
      console.log('🔍 Starting species analysis...');
      
      // Use Gemma 3n for species identification
      const result = await GemmaService.identifySpeciesFromImage(imageUri, location);
      
      setAnalysisResult(result);
      setShowResult(true);
      
      // Save discovery to database
      await saveDiscovery(result, imageUri);
      
      console.log('✅ Species analysis completed');
      
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Analysis Failed',
        'Unable to identify species. Please try again with a clearer image.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveDiscovery = async (result, imageUri) => {
    try {
      const discoveryData = {
        species_id: result.species.id,
        species_name: result.species.name,
        scientific_name: result.species.scientificName,
        category: result.species.category,
        confidence: result.confidence,
        image_uri: imageUri,
        location: location,
        conservation_status: result.conservationStatus,
        threats: result.threats,
        recommendations: result.recommendations,
        notes: `Identified using Gemma 3n with ${Math.round(result.confidence * 100)}% confidence`,
      };
      
      await DatabaseService.saveDiscovery(discoveryData);
      console.log('💾 Discovery saved to database');
      
    } catch (error) {
      console.error('Save discovery error:', error);
    }
  };

  const toggleCameraType = () => {
    setType(
      type === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  const closeResult = () => {
    setShowResult(false);
    setAnalysisResult(null);
    setCapturedImage(null);
  };

  const getConservationStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'endangered':
        return '#D32F2F';
      case 'vulnerable':
        return '#FF8F00';
      case 'near threatened':
        return '#F57C00';
      case 'least concern':
        return '#2E7D32';
      default:
        return '#757575';
    }
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
              <Title style={styles.resultTitle}>Species Identified!</Title>
              <TouchableOpacity onPress={closeResult} style={styles.closeButton}>
                <Icon name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>
            
            {analysisResult && (
              <>
                <View style={styles.speciesInfo}>
                  <Text style={styles.speciesName}>
                    {analysisResult.species.name}
                  </Text>
                  <Text style={styles.scientificName}>
                    {analysisResult.species.scientificName}
                  </Text>
                  
                  <View style={styles.metaInfo}>
                    <Chip
                      mode="outlined"
                      style={[
                        styles.confidenceChip,
                        {
                          backgroundColor: analysisResult.confidence > 0.8 ? '#E8F5E8' : '#FFF3E0'
                        }
                      ]}
                    >
                      {Math.round(analysisResult.confidence * 100)}% Confidence
                    </Chip>
                    
                    <Chip
                      mode="outlined"
                      style={[
                        styles.statusChip,
                        {
                          borderColor: getConservationStatusColor(analysisResult.conservationStatus),
                          backgroundColor: `${getConservationStatusColor(analysisResult.conservationStatus)}20`,
                        }
                      ]}
                    >
                      {analysisResult.conservationStatus}
                    </Chip>
                  </View>
                </View>
                
                <Paragraph style={styles.description}>
                  {analysisResult.description}
                </Paragraph>
                
                {analysisResult.threats && analysisResult.threats.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Threats</Text>
                    {analysisResult.threats.map((threat, index) => (
                      <View key={index} style={styles.listItem}>
                        <Icon name="warning" size={16} color="#FF8F00" />
                        <Text style={styles.listText}>{threat}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Conservation Actions</Text>
                    {analysisResult.recommendations.map((recommendation, index) => (
                      <View key={index} style={styles.listItem}>
                        <Icon name="eco" size={16} color="#2E7D32" />
                        <Text style={styles.listText}>{recommendation}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {location && (
                  <View style={styles.locationInfo}>
                    <Icon name="location-on" size={16} color="#757575" />
                    <Text style={styles.locationText}>{location.name}</Text>
                  </View>
                )}
              </>
            )}
            
            <View style={styles.resultActions}>
              <Button
                mode="outlined"
                onPress={closeResult}
                style={styles.actionButton}
              >
                Take Another Photo
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  closeResult();
                  // Could navigate to detailed species info screen
                }}
                style={[styles.actionButton, styles.primaryButton]}
              >
                Learn More
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  const renderCameraControls = () => (
    <View style={styles.controlsContainer}>
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleFlash}
        >
          <Icon
            name={flashMode === Camera.Constants.FlashMode.off ? 'flash-off' : 'flash-on'}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        
        <View style={styles.locationIndicator}>
          {location && (
            <>
              <Icon name="location-on" size={16} color="#FFFFFF" />
              <Text style={styles.locationText}>{location.name}</Text>
            </>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleCameraType}
        >
          <Icon name="flip-camera-ios" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.bottomControls}>
        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={[
              styles.captureButton,
              isAnalyzing && styles.captureButtonDisabled
            ]}
            onPress={takePicture}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        </View>
        
        {isAnalyzing && (
          <View style={styles.analysisIndicator}>
            <Text style={styles.analysisText}>
              🤖 Analyzing with Gemma 3n...
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.permissionText}>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="camera-alt" size={64} color="#BDBDBD" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          Please grant camera permissions to identify species
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
      <Camera
        style={styles.camera}
        type={type}
        flashMode={flashMode}
        ref={cameraRef}
      >
        {renderCameraControls()}
      </Camera>
      
      <View style={styles.instructionsContainer}>
        <Surface style={styles.instructionsSurface}>
          <Text style={styles.instructionsText}>
            📸 Point camera at plants, animals, or insects for AI identification
          </Text>
        </Surface>
      </View>
      
      {renderAnalysisResult()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  bottomControls: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  analysisIndicator: {
    marginTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  analysisText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
  },
  instructionsSurface: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 2,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1B5E20',
    textAlign: 'center',
    fontWeight: '500',
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
  speciesInfo: {
    marginBottom: 16,
  },
  speciesName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#81C784',
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  confidenceChip: {
    marginRight: 8,
  },
  statusChip: {
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    color: '#1B5E20',
    lineHeight: 20,
    marginBottom: 16,
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
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
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