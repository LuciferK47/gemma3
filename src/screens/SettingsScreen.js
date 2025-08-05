/**
 * SettingsScreen - App settings and user preferences
 * Manages Gemma 3n model settings, privacy options, and conservation preferences
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  List,
  Switch,
  Button,
  Divider,
  Chip,
  Surface,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import DatabaseService from '../services/DatabaseService';
import GemmaService from '../services/GemmaService';

export default function SettingsScreen() {
  const [preferences, setPreferences] = useState({
    notifications_enabled: true,
    location_sharing: true,
    offline_mode: true,
    conservation_reminders: true,
    auto_save_discoveries: true,
    high_accuracy_mode: false,
  });
  const [modelStatus, setModelStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load user preferences
      const prefs = {};
      for (const key of Object.keys(preferences)) {
        const value = await DatabaseService.getUserPreference(key);
        prefs[key] = value === 'true';
      }
      setPreferences(prefs);
      
      // Get model status
      const status = GemmaService.getModelStatus();
      setModelStatus(status);
      
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key, value) => {
    try {
      await DatabaseService.setUserPreference(key, value.toString());
      setPreferences(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating preference:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your discoveries and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, you would clear the database here
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'Export your discoveries and conservation data for backup or sharing with researchers.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // In a real app, you would implement data export here
            Alert.alert('Coming Soon', 'Data export feature will be available in the next update');
          },
        },
      ]
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://ecoguardian.example.com/privacy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://ecoguardian.example.com/terms');
  };

  const renderModelSettings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.cardTitle}>Gemma 3n AI Model</Title>
        
        {modelStatus && (
          <>
            <View style={styles.modelInfo}>
              <View style={styles.statusItem}>
                <Icon
                  name={modelStatus.isInitialized ? 'check-circle' : 'error'}
                  size={20}
                  color={modelStatus.isInitialized ? '#2E7D32' : '#D32F2F'}
                />
                <Text style={styles.statusText}>
                  Status: {modelStatus.isInitialized ? 'Ready' : 'Not Ready'}
                </Text>
              </View>
              
              <View style={styles.statusItem}>
                <Icon name="memory" size={20} color="#2E7D32" />
                <Text style={styles.statusText}>
                  Model Size: {modelStatus.modelSize}
                </Text>
              </View>
              
              <View style={styles.statusItem}>
                <Icon name="storage" size={20} color="#2E7D32" />
                <Text style={styles.statusText}>
                  Species Database: {modelStatus.speciesCount} entries
                </Text>
              </View>
            </View>
            
            <View style={styles.capabilitiesSection}>
              <Text style={styles.sectionTitle}>AI Capabilities</Text>
              <View style={styles.capabilitiesGrid}>
                {modelStatus.capabilities.map((capability, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    style={styles.capabilityChip}
                    icon="check"
                  >
                    {capability}
                  </Chip>
                ))}
              </View>
            </View>
          </>
        )}
        
        <List.Item
          title="High Accuracy Mode"
          description="Use full 4B model for maximum accuracy (uses more battery)"
          left={props => <List.Icon {...props} icon="precision-manufacturing" />}
          right={() => (
            <Switch
              value={preferences.high_accuracy_mode}
              onValueChange={(value) => updatePreference('high_accuracy_mode', value)}
            />
          )}
        />
      </Card.Content>
    </Card>
  );

  const renderPrivacySettings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.cardTitle}>Privacy & Data</Title>
        
        <List.Item
          title="Location Sharing"
          description="Include location data with discoveries for better conservation insights"
          left={props => <List.Icon {...props} icon="location-on" />}
          right={() => (
            <Switch
              value={preferences.location_sharing}
              onValueChange={(value) => updatePreference('location_sharing', value)}
            />
          )}
        />
        
        <List.Item
          title="Offline Mode"
          description="Process all data locally on your device for maximum privacy"
          left={props => <List.Icon {...props} icon="offline-bolt" />}
          right={() => (
            <Switch
              value={preferences.offline_mode}
              onValueChange={(value) => updatePreference('offline_mode', value)}
            />
          )}
        />
        
        <List.Item
          title="Auto-Save Discoveries"
          description="Automatically save identified species to your history"
          left={props => <List.Icon {...props} icon="save" />}
          right={() => (
            <Switch
              value={preferences.auto_save_discoveries}
              onValueChange={(value) => updatePreference('auto_save_discoveries', value)}
            />
          )}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Export My Data"
          description="Download your discoveries and conservation data"
          left={props => <List.Icon {...props} icon="download" />}
          onPress={exportData}
        />
        
        <List.Item
          title="Clear All Data"
          description="Permanently delete all discoveries and settings"
          left={props => <List.Icon {...props} icon="delete-forever" />}
          onPress={clearAllData}
          titleStyle={styles.dangerText}
        />
      </Card.Content>
    </Card>
  );

  const renderNotificationSettings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.cardTitle}>Notifications</Title>
        
        <List.Item
          title="Enable Notifications"
          description="Receive updates about your conservation impact"
          left={props => <List.Icon {...props} icon="notifications" />}
          right={() => (
            <Switch
              value={preferences.notifications_enabled}
              onValueChange={(value) => updatePreference('notifications_enabled', value)}
            />
          )}
        />
        
        <List.Item
          title="Conservation Reminders"
          description="Get reminded about conservation actions you can take"
          left={props => <List.Icon {...props} icon="eco" />}
          right={() => (
            <Switch
              value={preferences.conservation_reminders}
              onValueChange={(value) => updatePreference('conservation_reminders', value)}
            />
          )}
        />
      </Card.Content>
    </Card>
  );

  const renderAboutSection = () => (
    <Card style={styles.card}>
      <Card.Content>
                        <Title style={styles.cardTitle}>About EcoGuardián</Title>
        
        <View style={styles.aboutInfo}>
          <Text style={styles.aboutText}>
                              EcoGuardián is an AI-powered environmental conservation assistant built with Google's Gemma 3n model.
            Our mission is to democratize conservation knowledge and empower everyone to protect our planet.
          </Text>
          
          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <Text style={styles.versionText}>Built for Gemma 3n Hackathon</Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Privacy Policy"
          left={props => <List.Icon {...props} icon="privacy-tip" />}
          onPress={openPrivacyPolicy}
        />
        
        <List.Item
          title="Terms of Service"
          left={props => <List.Icon {...props} icon="description" />}
          onPress={openTermsOfService}
        />
        
        <List.Item
          title="Open Source Licenses"
          left={props => <List.Icon {...props} icon="code" />}
          onPress={() => Alert.alert('Open Source', 'This app uses various open source libraries. Full license information available in the app repository.')}
        />
      </Card.Content>
    </Card>
  );

  const renderConservationTips = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.cardTitle}>Conservation Tips</Title>
        
        <View style={styles.tipsContainer}>
          <Surface style={styles.tipSurface}>
            <Icon name="local-florist" size={24} color="#2E7D32" />
            <Text style={styles.tipText}>
              Plant native species to support local wildlife and reduce water usage
            </Text>
          </Surface>
          
          <Surface style={styles.tipSurface}>
            <Icon name="recycling" size={24} color="#2E7D32" />
            <Text style={styles.tipText}>
              Reduce, reuse, and recycle to minimize environmental impact
            </Text>
          </Surface>
          
          <Surface style={styles.tipSurface}>
            <Icon name="directions-walk" size={24} color="#2E7D32" />
            <Text style={styles.tipText}>
              Choose walking, cycling, or public transport to reduce carbon footprint
            </Text>
          </Surface>
          
          <Surface style={styles.tipSurface}>
            <Icon name="water-drop" size={24} color="#2E7D32" />
            <Text style={styles.tipText}>
              Conserve water by fixing leaks and using efficient appliances
            </Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="settings" size={64} color="#2E7D32" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderModelSettings()}
      {renderPrivacySettings()}
      {renderNotificationSettings()}
      {renderConservationTips()}
      {renderAboutSection()}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🌱 Built with ❤️ for environmental conservation
        </Text>
        <Text style={styles.footerSubtext}>
          Powered by Google Gemma 3n • Privacy-First • Offline-Ready
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 12,
  },
  modelInfo: {
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#1B5E20',
    marginLeft: 8,
  },
  capabilitiesSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 8,
  },
  capabilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  capabilityChip: {
    marginRight: 6,
    marginBottom: 6,
  },
  divider: {
    marginVertical: 8,
  },
  dangerText: {
    color: '#D32F2F',
  },
  aboutInfo: {
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 14,
    color: '#1B5E20',
    lineHeight: 20,
    marginBottom: 12,
  },
  versionInfo: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#81C784',
    marginBottom: 2,
  },
  tipsContainer: {
    gap: 12,
  },
  tipSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E8F5E8',
    elevation: 1,
  },
  tipText: {
    fontSize: 14,
    color: '#1B5E20',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#81C784',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
  },
  loadingText: {
    fontSize: 16,
    color: '#1B5E20',
    marginTop: 16,
  },
});