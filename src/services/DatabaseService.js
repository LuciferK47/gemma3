/**
 * DatabaseService - Offline database management for EcoGuard
 * Handles local storage of discoveries, species data, and user preferences
 */

import * as SQLite from 'expo-sqlite';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize SQLite database with required tables
   */
  async initialize() {
    try {
      console.log('📊 Initializing database...');
      
      // Open database connection
      this.db = SQLite.openDatabase('ecoguard.db');
      
      // Create tables
      await this.createTables();
      
      // Insert initial data
      await this.insertInitialData();
      
      this.isInitialized = true;
      console.log('✅ Database initialized successfully');
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw new Error(`Database initialization failed: ${error.message}`);
    }
  }

  /**
   * Create database tables
   */
  async createTables() {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          // Discoveries table - stores user's species identifications
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS discoveries (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              species_id TEXT NOT NULL,
              species_name TEXT NOT NULL,
              scientific_name TEXT,
              category TEXT NOT NULL,
              confidence REAL NOT NULL,
              image_uri TEXT,
              audio_uri TEXT,
              location_lat REAL,
              location_lng REAL,
              location_name TEXT,
              conservation_status TEXT,
              threats TEXT,
              recommendations TEXT,
              notes TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);

          // Species database table - offline species information
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS species (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              scientific_name TEXT,
              category TEXT NOT NULL,
              description TEXT,
              conservation_status TEXT,
              habitat TEXT,
              threats TEXT,
              conservation_actions TEXT,
              image_urls TEXT,
              audio_patterns TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);

          // Audio analysis table - environmental sound recordings
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS audio_analysis (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              audio_uri TEXT NOT NULL,
              duration REAL NOT NULL,
              detected_sounds TEXT,
              biodiversity_score REAL,
              environmental_health TEXT,
              detected_species TEXT,
              location_lat REAL,
              location_lng REAL,
              location_name TEXT,
              recommendations TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);

          // Ecosystem assessments table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS ecosystem_assessments (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              image_uri TEXT,
              audio_uri TEXT,
              overall_health REAL,
              biodiversity_index REAL,
              threats TEXT,
              strengths TEXT,
              recommendations TEXT,
              location_lat REAL,
              location_lng REAL,
              location_name TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);

          // User preferences table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS user_preferences (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);

          // Conservation actions table - track user's conservation activities
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS conservation_actions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              action_type TEXT NOT NULL,
              description TEXT NOT NULL,
              species_related TEXT,
              location_lat REAL,
              location_lng REAL,
              location_name TEXT,
              impact_score INTEGER DEFAULT 1,
              completed BOOLEAN DEFAULT FALSE,
              completed_at DATETIME,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);
        },
        error => {
          console.error('❌ Error creating tables:', error);
          reject(error);
        },
        () => {
          console.log('✅ Database tables created');
          resolve();
        }
      );
    });
  }

  /**
   * Insert initial species data
   */
  async insertInitialData() {
    const initialSpecies = [
      {
        id: 'oak_tree',
        name: 'Oak Tree',
        scientific_name: 'Quercus',
        category: 'tree',
        description: 'Deciduous hardwood tree, important for ecosystem biodiversity. Provides habitat for numerous species.',
        conservation_status: 'Least Concern',
        habitat: 'Temperate forests, woodlands, parks',
        threats: JSON.stringify(['Deforestation', 'Climate change', 'Oak wilt disease', 'Urban development']),
        conservation_actions: JSON.stringify(['Plant native oak species', 'Protect existing oak forests', 'Monitor for diseases', 'Create oak corridors']),
      },
      {
        id: 'american_robin',
        name: 'American Robin',
        scientific_name: 'Turdus migratorius',
        category: 'bird',
        description: 'Common songbird and indicator of ecosystem health. Known for its melodic song and orange breast.',
        conservation_status: 'Least Concern',
        habitat: 'Gardens, parks, forests, urban areas',
        threats: JSON.stringify(['Pesticide use', 'Habitat loss', 'Window collisions', 'Climate change']),
        conservation_actions: JSON.stringify(['Create bird-friendly gardens', 'Reduce pesticide use', 'Install window decals', 'Provide nesting sites']),
      },
      {
        id: 'monarch_butterfly',
        name: 'Monarch Butterfly',
        scientific_name: 'Danaus plexippus',
        category: 'insect',
        description: 'Migratory butterfly crucial for pollination. Famous for its incredible migration journey.',
        conservation_status: 'Endangered',
        habitat: 'Milkweed habitats, migration corridors, gardens',
        threats: JSON.stringify(['Habitat destruction', 'Pesticides', 'Climate change', 'Deforestation']),
        conservation_actions: JSON.stringify(['Plant milkweed', 'Create pollinator gardens', 'Support migration corridors', 'Reduce pesticide use']),
      },
      {
        id: 'eastern_bluebird',
        name: 'Eastern Bluebird',
        scientific_name: 'Sialia sialis',
        category: 'bird',
        description: 'Beautiful songbird with brilliant blue plumage. Symbol of happiness and conservation success.',
        conservation_status: 'Least Concern',
        habitat: 'Open woodlands, farmlands, orchards',
        threats: JSON.stringify(['Habitat loss', 'Competition from invasive species', 'Pesticides']),
        conservation_actions: JSON.stringify(['Install bluebird houses', 'Maintain open habitats', 'Control invasive species', 'Provide water sources']),
      },
      {
        id: 'white_pine',
        name: 'Eastern White Pine',
        scientific_name: 'Pinus strobus',
        category: 'tree',
        description: 'Majestic coniferous tree, important for forest ecosystems and wildlife habitat.',
        conservation_status: 'Least Concern',
        habitat: 'Mixed forests, mountainous regions',
        threats: JSON.stringify(['White pine blister rust', 'Air pollution', 'Climate change', 'Logging']),
        conservation_actions: JSON.stringify(['Plant disease-resistant varieties', 'Monitor forest health', 'Reduce air pollution', 'Sustainable forestry']),
      },
    ];

    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          initialSpecies.forEach(species => {
            tx.executeSql(
              `INSERT OR REPLACE INTO species 
               (id, name, scientific_name, category, description, conservation_status, habitat, threats, conservation_actions) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                species.id,
                species.name,
                species.scientific_name,
                species.category,
                species.description,
                species.conservation_status,
                species.habitat,
                species.threats,
                species.conservation_actions,
              ]
            );
          });

          // Insert default user preferences
          const defaultPreferences = [
            ['language', 'en'],
            ['notifications_enabled', 'true'],
            ['location_sharing', 'true'],
            ['offline_mode', 'true'],
            ['conservation_reminders', 'true'],
          ];

          defaultPreferences.forEach(([key, value]) => {
            tx.executeSql(
              'INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)',
              [key, value]
            );
          });
        },
        error => {
          console.error('❌ Error inserting initial data:', error);
          reject(error);
        },
        () => {
          console.log('✅ Initial data inserted');
          resolve();
        }
      );
    });
  }

  /**
   * Save a new species discovery
   */
  async saveDiscovery(discoveryData) {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            `INSERT INTO discoveries 
             (species_id, species_name, scientific_name, category, confidence, image_uri, audio_uri, 
              location_lat, location_lng, location_name, conservation_status, threats, recommendations, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              discoveryData.species_id,
              discoveryData.species_name,
              discoveryData.scientific_name,
              discoveryData.category,
              discoveryData.confidence,
              discoveryData.image_uri,
              discoveryData.audio_uri,
              discoveryData.location?.latitude,
              discoveryData.location?.longitude,
              discoveryData.location?.name,
              discoveryData.conservation_status,
              JSON.stringify(discoveryData.threats || []),
              JSON.stringify(discoveryData.recommendations || []),
              discoveryData.notes,
            ],
            (_, result) => {
              resolve(result.insertId);
            },
            (_, error) => {
              reject(error);
            }
          );
        }
      );
    });
  }

  /**
   * Get all user discoveries
   */
  async getDiscoveries(limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM discoveries 
           ORDER BY created_at DESC 
           LIMIT ? OFFSET ?`,
          [limit, offset],
          (_, { rows }) => {
            const discoveries = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              discoveries.push({
                ...row,
                threats: JSON.parse(row.threats || '[]'),
                recommendations: JSON.parse(row.recommendations || '[]'),
                location: row.location_lat && row.location_lng ? {
                  latitude: row.location_lat,
                  longitude: row.location_lng,
                  name: row.location_name,
                } : null,
              });
            }
            resolve(discoveries);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  /**
   * Get species information by ID
   */
  async getSpeciesById(speciesId) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM species WHERE id = ?',
          [speciesId],
          (_, { rows }) => {
            if (rows.length > 0) {
              const species = rows.item(0);
              resolve({
                ...species,
                threats: JSON.parse(species.threats || '[]'),
                conservation_actions: JSON.parse(species.conservation_actions || '[]'),
              });
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  /**
   * Save audio analysis result
   */
  async saveAudioAnalysis(analysisData) {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            `INSERT INTO audio_analysis 
             (audio_uri, duration, detected_sounds, biodiversity_score, environmental_health, 
              detected_species, location_lat, location_lng, location_name, recommendations) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              analysisData.audio_uri,
              analysisData.duration,
              JSON.stringify(analysisData.detected_sounds || []),
              analysisData.biodiversity_score,
              analysisData.environmental_health,
              JSON.stringify(analysisData.detected_species || []),
              analysisData.location?.latitude,
              analysisData.location?.longitude,
              analysisData.location?.name,
              JSON.stringify(analysisData.recommendations || []),
            ],
            (_, result) => resolve(result.insertId),
            (_, error) => reject(error)
          );
        }
      );
    });
  }

  /**
   * Save ecosystem assessment
   */
  async saveEcosystemAssessment(assessmentData) {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            `INSERT INTO ecosystem_assessments 
             (image_uri, audio_uri, overall_health, biodiversity_index, threats, strengths, 
              recommendations, location_lat, location_lng, location_name) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              assessmentData.image_uri,
              assessmentData.audio_uri,
              assessmentData.overall_health,
              assessmentData.biodiversity_index,
              JSON.stringify(assessmentData.threats || []),
              JSON.stringify(assessmentData.strengths || []),
              JSON.stringify(assessmentData.recommendations || []),
              assessmentData.location?.latitude,
              assessmentData.location?.longitude,
              assessmentData.location?.name,
            ],
            (_, result) => resolve(result.insertId),
            (_, error) => reject(error)
          );
        }
      );
    });
  }

  /**
   * Get user preference
   */
  async getUserPreference(key) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT value FROM user_preferences WHERE key = ?',
          [key],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0).value);
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  /**
   * Set user preference
   */
  async setUserPreference(key, value) {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            'INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)',
            [key, value],
            () => resolve(),
            (_, error) => reject(error)
          );
        }
      );
    });
  }

  /**
   * Get discovery statistics
   */
  async getDiscoveryStats() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        // Get total discoveries
        tx.executeSql(
          'SELECT COUNT(*) as total FROM discoveries',
          [],
          (_, { rows }) => {
            const total = rows.item(0).total;
            
            // Get discoveries by category
            tx.executeSql(
              'SELECT category, COUNT(*) as count FROM discoveries GROUP BY category',
              [],
              (_, { rows: categoryRows }) => {
                const byCategory = {};
                for (let i = 0; i < categoryRows.length; i++) {
                  const row = categoryRows.item(i);
                  byCategory[row.category] = row.count;
                }
                
                // Get recent discoveries (last 7 days)
                tx.executeSql(
                  "SELECT COUNT(*) as recent FROM discoveries WHERE created_at >= date('now', '-7 days')",
                  [],
                  (_, { rows: recentRows }) => {
                    const recent = recentRows.item(0).recent;
                    
                    resolve({
                      total,
                      byCategory,
                      recent,
                    });
                  },
                  (_, error) => reject(error)
                );
              },
              (_, error) => reject(error)
            );
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  /**
   * Search species by name or category
   */
  async searchSpecies(query) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM species 
           WHERE name LIKE ? OR scientific_name LIKE ? OR category LIKE ? 
           ORDER BY name`,
          [`%${query}%`, `%${query}%`, `%${query}%`],
          (_, { rows }) => {
            const species = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              species.push({
                ...row,
                threats: JSON.parse(row.threats || '[]'),
                conservation_actions: JSON.parse(row.conservation_actions || '[]'),
              });
            }
            resolve(species);
          },
          (_, error) => reject(error)
        );
      });
    });
  }
}

// Export singleton instance
export default new DatabaseService();