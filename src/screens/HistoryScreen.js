/**
 * HistoryScreen - Display user's discovery history and conservation impact
 * Shows all past species identifications and audio analyses
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  Searchbar,
  FAB,
  Portal,
  Modal,
  Surface,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

import DatabaseService from '../services/DatabaseService';

export default function HistoryScreen({ navigation }) {
  const [discoveries, setDiscoveries] = useState([]);
  const [filteredDiscoveries, setFilteredDiscoveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({ total: 0, byCategory: {}, recent: 0 });
  const [selectedDiscovery, setSelectedDiscovery] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const categories = ['all', 'tree', 'bird', 'insect', 'mammal', 'plant'];

  useFocusEffect(
    useCallback(() => {
      loadDiscoveries();
    }, [])
  );

  useEffect(() => {
    filterDiscoveries();
  }, [discoveries, searchQuery, selectedCategory]);

  const loadDiscoveries = async () => {
    try {
      setLoading(true);
      
      // Load discoveries and stats
      const [discoveryData, statsData] = await Promise.all([
        DatabaseService.getDiscoveries(100, 0),
        DatabaseService.getDiscoveryStats(),
      ]);
      
      setDiscoveries(discoveryData);
      setStats(statsData);
      
    } catch (error) {
      console.error('Error loading discoveries:', error);
      Alert.alert('Error', 'Failed to load discovery history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDiscoveries();
    setRefreshing(false);
  };

  const filterDiscoveries = () => {
    let filtered = discoveries;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(discovery => 
        discovery.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(discovery =>
        discovery.species_name.toLowerCase().includes(query) ||
        discovery.scientific_name?.toLowerCase().includes(query) ||
        discovery.category.toLowerCase().includes(query)
      );
    }

    setFilteredDiscoveries(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'bird':
        return 'flutter-dash';
      case 'tree':
        return 'park';
      case 'insect':
        return 'bug-report';
      case 'mammal':
        return 'pets';
      case 'plant':
        return 'local-florist';
      default:
        return 'eco';
    }
  };

  const showDiscoveryDetails = (discovery) => {
    setSelectedDiscovery(discovery);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedDiscovery(null);
  };

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Title style={styles.statsTitle}>Your Conservation Impact</Title>
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
          <View style={styles.categoryBreakdown}>
            <Text style={styles.breakdownTitle}>By Category</Text>
            <View style={styles.categoryChips}>
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <Chip
                  key={category}
                  mode="outlined"
                  style={styles.categoryChip}
                  icon={getCategoryIcon(category)}
                >
                  {category}: {count}
                </Chip>
              ))}
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Searchbar
        placeholder="Search discoveries..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor="#2E7D32"
        inputStyle={styles.searchInput}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilters}
        contentContainerStyle={styles.categoryFiltersContent}
      >
        {categories.map(category => (
          <Chip
            key={category}
            mode={selectedCategory === category ? 'flat' : 'outlined'}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.filterChip,
              selectedCategory === category && styles.selectedFilterChip
            ]}
            textStyle={[
              styles.filterChipText,
              selectedCategory === category && styles.selectedFilterChipText
            ]}
          >
            {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderDiscoveryItem = (discovery) => (
    <TouchableOpacity
      key={discovery.id}
      onPress={() => showDiscoveryDetails(discovery)}
    >
      <Card style={styles.discoveryCard}>
        <Card.Content>
          <View style={styles.discoveryHeader}>
            <View style={styles.discoveryIcon}>
              <Icon
                name={getCategoryIcon(discovery.category)}
                size={24}
                color="#2E7D32"
              />
            </View>
            <View style={styles.discoveryInfo}>
              <Text style={styles.discoveryName}>{discovery.species_name}</Text>
              <Text style={styles.discoveryScientific}>
                {discovery.scientific_name}
              </Text>
              <Text style={styles.discoveryDate}>
                {formatDate(discovery.created_at)}
              </Text>
            </View>
            <View style={styles.discoveryMeta}>
              <Chip
                mode="outlined"
                compact
                style={[
                  styles.confidenceChip,
                  {
                    backgroundColor: discovery.confidence > 0.8 ? '#E8F5E8' : '#FFF3E0'
                  }
                ]}
              >
                {Math.round(discovery.confidence * 100)}%
              </Chip>
              {discovery.conservation_status && (
                <Chip
                  mode="outlined"
                  compact
                  style={[
                    styles.statusChip,
                    {
                      borderColor: getConservationStatusColor(discovery.conservation_status),
                      backgroundColor: `${getConservationStatusColor(discovery.conservation_status)}20`,
                    }
                  ]}
                >
                  {discovery.conservation_status}
                </Chip>
              )}
            </View>
          </View>
          
          {discovery.location && (
            <View style={styles.locationInfo}>
              <Icon name="location-on" size={14} color="#757575" />
              <Text style={styles.locationText}>{discovery.location.name}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderDiscoveryDetails = () => (
    <Portal>
      <Modal
        visible={showDetails}
        onDismiss={closeDetails}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.detailsCard}>
          <Card.Content>
            <View style={styles.detailsHeader}>
              <Title style={styles.detailsTitle}>Discovery Details</Title>
              <TouchableOpacity onPress={closeDetails} style={styles.closeButton}>
                <Icon name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>
            
            {selectedDiscovery && (
              <>
                <View style={styles.speciesDetails}>
                  <Text style={styles.speciesName}>
                    {selectedDiscovery.species_name}
                  </Text>
                  <Text style={styles.scientificName}>
                    {selectedDiscovery.scientific_name}
                  </Text>
                  
                  <View style={styles.detailsMeta}>
                    <Chip mode="outlined" style={styles.categoryDetailChip}>
                      {selectedDiscovery.category}
                    </Chip>
                    <Chip
                      mode="outlined"
                      style={[
                        styles.confidenceDetailChip,
                        {
                          backgroundColor: selectedDiscovery.confidence > 0.8 ? '#E8F5E8' : '#FFF3E0'
                        }
                      ]}
                    >
                      {Math.round(selectedDiscovery.confidence * 100)}% Confidence
                    </Chip>
                  </View>
                </View>
                
                {selectedDiscovery.image_uri && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: selectedDiscovery.image_uri }}
                      style={styles.discoveryImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
                
                {selectedDiscovery.threats && selectedDiscovery.threats.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Threats</Text>
                    {selectedDiscovery.threats.map((threat, index) => (
                      <View key={index} style={styles.listItem}>
                        <Icon name="warning" size={16} color="#FF8F00" />
                        <Text style={styles.listText}>{threat}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {selectedDiscovery.recommendations && selectedDiscovery.recommendations.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Conservation Actions</Text>
                    {selectedDiscovery.recommendations.map((recommendation, index) => (
                      <View key={index} style={styles.listItem}>
                        <Icon name="eco" size={16} color="#2E7D32" />
                        <Text style={styles.listText}>{recommendation}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {selectedDiscovery.notes && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <Text style={styles.notesText}>{selectedDiscovery.notes}</Text>
                  </View>
                )}
                
                <View style={styles.discoveryMeta}>
                  <Text style={styles.metaText}>
                    Discovered on {formatDate(selectedDiscovery.created_at)}
                  </Text>
                  {selectedDiscovery.location && (
                    <Text style={styles.metaText}>
                      📍 {selectedDiscovery.location.name}
                    </Text>
                  )}
                </View>
              </>
            )}
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search" size={64} color="#BDBDBD" />
      <Text style={styles.emptyTitle}>No Discoveries Yet</Text>
      <Text style={styles.emptyText}>
        Start exploring nature around you to build your conservation impact!
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Camera')}
        style={styles.emptyButton}
      >
        Make Your First Discovery
      </Button>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="history" size={64} color="#2E7D32" />
        <Text style={styles.loadingText}>Loading your discoveries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E7D32']}
            tintColor="#2E7D32"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderStatsCard()}
        {renderFilters()}
        
        {filteredDiscoveries.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.discoveriesList}>
            {filteredDiscoveries.map(renderDiscoveryItem)}
          </View>
        )}
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="camera-alt"
        onPress={() => navigation.navigate('Camera')}
        color="#FFFFFF"
      />
      
      {renderDiscoveryDetails()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 16,
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
  categoryBreakdown: {
    marginTop: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 8,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    marginRight: 6,
    marginBottom: 6,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  searchInput: {
    color: '#1B5E20',
  },
  categoryFilters: {
    marginBottom: 8,
  },
  categoryFiltersContent: {
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  selectedFilterChip: {
    backgroundColor: '#2E7D32',
  },
  filterChipText: {
    color: '#1B5E20',
  },
  selectedFilterChipText: {
    color: '#FFFFFF',
  },
  discoveriesList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  discoveryCard: {
    marginBottom: 12,
    elevation: 1,
  },
  discoveryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  discoveryInfo: {
    flex: 1,
  },
  discoveryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 2,
  },
  discoveryScientific: {
    fontSize: 14,
    color: '#81C784',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  discoveryDate: {
    fontSize: 12,
    color: '#BDBDBD',
  },
  discoveryMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  confidenceChip: {
    height: 24,
  },
  statusChip: {
    height: 24,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#81C784',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#2E7D32',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2E7D32',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  detailsCard: {
    maxHeight: '80%',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  closeButton: {
    padding: 4,
  },
  speciesDetails: {
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
  detailsMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryDetailChip: {
    marginRight: 8,
  },
  confidenceDetailChip: {
    marginRight: 8,
  },
  imageContainer: {
    marginBottom: 16,
  },
  discoveryImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
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
  notesText: {
    fontSize: 14,
    color: '#1B5E20',
    lineHeight: 20,
  },
  metaText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
});