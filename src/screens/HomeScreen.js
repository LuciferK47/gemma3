/**
 * HomeScreen - Main dashboard for EcoGuardián application
 * Shows overview, recent discoveries, and quick actions
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ProgressBar,
  Chip,
  Surface,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import DatabaseService from '../services/DatabaseService';
import GemmaService from '../services/GemmaService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    total: 0,
    byCategory: {},
    recent: 0,
  });
  const [recentDiscoveries, setRecentDiscoveries] = useState([]);
  const [modelStatus, setModelStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load discovery statistics
      const discoveryStats = await DatabaseService.getDiscoveryStats();
      setStats(discoveryStats);
      
      // Load recent discoveries
      const recent = await DatabaseService.getDiscoveries(5, 0);
      setRecentDiscoveries(recent);
      
      // Get Gemma model status
      const status = GemmaService.getModelStatus();
      setModelStatus(status);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'camera':
        navigation.navigate('Camera');
        break;
      case 'audio':
        navigation.navigate('Audio');
        break;
      case 'history':
        navigation.navigate('History');
        break;
      default:
        break;
    }
  };

  const renderQuickActions = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.cardTitle}>Quick Actions</Title>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleQuickAction('camera')}
          >
            <Surface style={styles.quickActionSurface}>
              <Icon name="camera-alt" size={32} color="#2E7D32" />
            </Surface>
            <Text style={styles.quickActionText}>Identify Species</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleQuickAction('audio')}
          >
            <Surface style={styles.quickActionSurface}>
              <Icon name="mic" size={32} color="#2E7D32" />
            </Surface>
            <Text style={styles.quickActionText}>Analyze Sounds</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleQuickAction('history')}
          >
            <Surface style={styles.quickActionSurface}>
              <Icon name="history" size={32} color="#2E7D32" />
            </Surface>
            <Text style={styles.quickActionText}>My Discoveries</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderStats = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.cardTitle}>Your Impact</Title>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Discoveries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.recent}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Object.keys(stats.byCategory).length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>
        
        {Object.keys(stats.byCategory).length > 0 && (
          <View style={styles.categoryStats}>
            <Text style={styles.categoryTitle}>Discoveries by Category</Text>
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <View key={category} style={styles.categoryItem}>
                <Text style={styles.categoryName}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                <Chip mode="outlined" compact>
                  {count}
                </Chip>
              </View>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderRecentDiscoveries = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.cardTitle}>Recent Discoveries</Title>
          <Button
            mode="text"
            onPress={() => navigation.navigate('History')}
            labelStyle={styles.viewAllButton}
          >
            View All
          </Button>
        </View>
        
        {recentDiscoveries.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="search" size={48} color="#81C784" />
            <Text style={styles.emptyStateText}>No discoveries yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start exploring nature around you!
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Camera')}
              style={styles.emptyStateButton}
            >
              Make Your First Discovery
            </Button>
          </View>
        ) : (
          recentDiscoveries.map((discovery, index) => (
            <View key={discovery.id} style={styles.discoveryItem}>
              <View style={styles.discoveryIcon}>
                <Icon
                  name={
                    discovery.category === 'bird' ? 'flutter-dash' :
                    discovery.category === 'tree' ? 'park' :
                    discovery.category === 'insect' ? 'bug-report' :
                    'eco'
                  }
                  size={24}
                  color="#2E7D32"
                />
              </View>
              <View style={styles.discoveryContent}>
                <Text style={styles.discoveryName}>{discovery.species_name}</Text>
                <Text style={styles.discoveryScientific}>{discovery.scientific_name}</Text>
                <Text style={styles.discoveryDate}>
                  {new Date(discovery.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.discoveryMeta}>
                <Chip
                  mode="outlined"
                  compact
                  style={[
                    styles.confidenceChip,
                    { backgroundColor: discovery.confidence > 0.8 ? '#E8F5E8' : '#FFF3E0' }
                  ]}
                >
                  {Math.round(discovery.confidence * 100)}%
                </Chip>
              </View>
            </View>
          ))
        )}
      </Card.Content>
    </Card>
  );

  const renderModelStatus = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.cardTitle}>AI Status</Title>
        <View style={styles.modelStatusContainer}>
          <View style={styles.statusItem}>
            <Icon
              name={modelStatus?.isInitialized ? 'check-circle' : 'error'}
              size={20}
              color={modelStatus?.isInitialized ? '#2E7D32' : '#D32F2F'}
            />
            <Text style={styles.statusText}>
              Gemma 3n {modelStatus?.isInitialized ? 'Ready' : 'Not Ready'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Icon name="memory" size={20} color="#2E7D32" />
            <Text style={styles.statusText}>
              Model: {modelStatus?.modelSize || 'Unknown'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Icon name="offline-bolt" size={20} color="#2E7D32" />
            <Text style={styles.statusText}>Offline Ready</Text>
          </View>
        </View>
        
        {modelStatus?.capabilities && (
          <View style={styles.capabilitiesContainer}>
            <Text style={styles.capabilitiesTitle}>Capabilities</Text>
            <View style={styles.capabilitiesGrid}>
              {modelStatus.capabilities.map((capability, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={styles.capabilityChip}
                >
                  {capability}
                </Chip>
              ))}
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderConservationTip = () => (
    <Card style={[styles.card, styles.tipCard]}>
      <Card.Content>
        <View style={styles.tipHeader}>
          <Icon name="lightbulb" size={24} color="#FF8F00" />
          <Title style={styles.tipTitle}>Conservation Tip</Title>
        </View>
        <Paragraph style={styles.tipText}>
          Plant native species in your garden! Native plants support local wildlife, 
          require less water, and help maintain biodiversity in your area.
        </Paragraph>
        <Button
          mode="text"
          onPress={() => Alert.alert('More Tips', 'Check the Settings screen for more conservation tips!')}
          labelStyle={styles.tipButton}
        >
          Learn More
        </Button>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="eco" size={64} color="#2E7D32" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
        <ProgressBar indeterminate color="#2E7D32" style={styles.loadingBar} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
                        <Text style={styles.appTitle}>EcoGuardián</Text>
        <Text style={styles.subtitle}>Your AI-powered conservation companion</Text>
      </View>

      {renderQuickActions()}
      {renderStats()}
      {renderRecentDiscoveries()}
      {renderModelStatus()}
      {renderConservationTip()}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
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
  header: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#1B5E20',
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#81C784',
    textAlign: 'center',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    color: '#2E7D32',
    fontSize: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionSurface: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    backgroundColor: '#E8F5E8',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#1B5E20',
    textAlign: 'center',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#81C784',
    marginTop: 4,
  },
  categoryStats: {
    marginTop: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    color: '#1B5E20',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#81C784',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: '#2E7D32',
  },
  discoveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  discoveryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  discoveryContent: {
    flex: 1,
  },
  discoveryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
  },
  discoveryScientific: {
    fontSize: 12,
    color: '#81C784',
    fontStyle: 'italic',
  },
  discoveryDate: {
    fontSize: 11,
    color: '#BDBDBD',
    marginTop: 2,
  },
  discoveryMeta: {
    alignItems: 'flex-end',
  },
  confidenceChip: {
    height: 24,
  },
  modelStatusContainer: {
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
  capabilitiesContainer: {
    marginTop: 12,
  },
  capabilitiesTitle: {
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
  tipCard: {
    backgroundColor: '#FFF8E1',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#BF360C',
    lineHeight: 20,
    marginBottom: 8,
  },
  tipButton: {
    color: '#FF8F00',
    fontSize: 12,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
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
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#1B5E20',
    marginTop: 16,
    marginBottom: 20,
  },
  loadingBar: {
    width: 200,
  },
});