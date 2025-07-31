/**
 * EcoGuard Demo Server
 * Simulates real-world Gemma 3n integration for hackathon demonstration
 * This showcases how the app would work with actual Gemma 3n deployment
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

console.log('🌍 EcoGuard Demo Server');
console.log('Built with Gemma 3n for Environmental Conservation');
console.log('='.repeat(50));

// Mock Gemma 3n responses for demo
const mockSpeciesDatabase = {
  'oak_tree': {
    id: 'oak_tree',
    name: 'Oak Tree',
    scientificName: 'Quercus',
    category: 'tree',
    description: 'Majestic deciduous tree, cornerstone of forest ecosystems. Supports over 500 species of wildlife.',
    conservationStatus: 'Least Concern',
    threats: ['Deforestation', 'Climate change', 'Oak wilt disease', 'Urban development'],
    habitat: 'Temperate forests, woodlands, parks',
    conservationActions: [
      'Plant native oak species in your area',
      'Support forest conservation organizations',
      'Monitor local oak trees for disease signs',
      'Create wildlife corridors connecting oak forests'
    ],
    funFacts: [
      'Oak trees can live for over 1000 years',
      'A single oak can support over 500 species of caterpillars',
      'Acorns are a crucial food source for wildlife'
    ]
  },
  'american_robin': {
    id: 'american_robin',
    name: 'American Robin',
    scientificName: 'Turdus migratorius',
    category: 'bird',
    description: 'Iconic songbird and harbinger of spring. Excellent indicator of ecosystem health.',
    conservationStatus: 'Least Concern',
    threats: ['Pesticide use', 'Habitat fragmentation', 'Window collisions', 'Climate change'],
    habitat: 'Gardens, parks, forests, urban areas',
    conservationActions: [
      'Create bird-friendly gardens with native plants',
      'Install window decals to prevent collisions',
      'Reduce or eliminate pesticide use',
      'Provide clean water sources'
    ],
    funFacts: [
      'Robins can see magnetic fields to navigate',
      'They eat 14 feet of earthworms per day',
      'Male robins arrive at breeding grounds before females'
    ]
  },
  'monarch_butterfly': {
    id: 'monarch_butterfly',
    name: 'Monarch Butterfly',
    scientificName: 'Danaus plexippus',
    category: 'insect',
    description: 'Extraordinary migratory butterfly, traveling up to 3000 miles. Critical pollinator species.',
    conservationStatus: 'Endangered',
    threats: ['Habitat destruction', 'Pesticide use', 'Climate change', 'Deforestation in wintering grounds'],
    habitat: 'Milkweed habitats, migration corridors, overwintering sites',
    conservationActions: [
      'Plant native milkweed species',
      'Create pollinator gardens with diverse flowering plants',
      'Support monarch migration corridor conservation',
      'Avoid pesticide use during monarch season'
    ],
    funFacts: [
      'No single monarch completes the full migration cycle',
      'They use the sun and magnetic fields for navigation',
      'Monarchs can glide for miles without flapping their wings'
    ]
  }
};

const mockAudioAnalysis = {
  'forest_morning': {
    sounds: ['Bird calls', 'Wind through leaves', 'Distant water flow', 'Insect activity'],
    biodiversityScore: 0.85,
    environmentalHealth: 'Excellent',
    detectedSpecies: ['American Robin', 'Blue Jay', 'Chickadee', 'Woodpecker'],
    recommendations: [
      'This area shows excellent biodiversity - continue current conservation practices',
      'Consider establishing this as a protected habitat corridor',
      'Monitor for invasive species during seasonal changes',
      'Document seasonal changes in species composition'
    ],
    insights: [
      'High bird activity indicates healthy insect populations',
      'Diverse vocalizations suggest established territories',
      'Water source proximity enhances habitat quality'
    ]
  },
  'urban_park': {
    sounds: ['Limited bird calls', 'Traffic noise', 'Human activity', 'Wind'],
    biodiversityScore: 0.45,
    environmentalHealth: 'Fair',
    detectedSpecies: ['House Sparrow', 'Pigeon', 'Crow'],
    recommendations: [
      'Plant native flowering plants to attract more species',
      'Create quiet zones away from traffic noise',
      'Install bird houses and water features',
      'Reduce light pollution to support nocturnal species'
    ],
    insights: [
      'Urban noise may be masking natural sounds',
      'Limited species diversity suggests habitat stress',
      'Opportunity for urban conservation improvements'
    ]
  }
};

// API Routes

// Species identification endpoint
app.post('/api/identify-species', async (req, res) => {
  try {
    const { imageData, location, timestamp } = req.body;
    
    // Simulate Gemma 3n processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock species identification based on random selection
    const speciesIds = Object.keys(mockSpeciesDatabase);
    const randomSpecies = speciesIds[Math.floor(Math.random() * speciesIds.length)];
    const species = mockSpeciesDatabase[randomSpecies];
    
    const confidence = 0.75 + Math.random() * 0.2; // 75-95% confidence
    
    const response = {
      success: true,
      species: species,
      confidence: confidence,
      analysisTime: '2.3s',
      modelUsed: 'Gemma 3n 4B',
      location: location,
      timestamp: timestamp,
      recommendations: species.conservationActions,
      additionalInfo: {
        funFacts: species.funFacts,
        relatedSpecies: speciesIds.filter(id => id !== randomSpecies).slice(0, 2)
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Species identification error:', error);
    res.status(500).json({
      success: false,
      error: 'Species identification failed',
      message: error.message
    });
  }
});

// Audio analysis endpoint
app.post('/api/analyze-audio', async (req, res) => {
  try {
    const { audioData, duration, location, timestamp } = req.body;
    
    // Simulate Gemma 3n audio processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock analysis based on environment type
    const analysisType = Math.random() > 0.5 ? 'forest_morning' : 'urban_park';
    const analysis = mockAudioAnalysis[analysisType];
    
    const response = {
      success: true,
      analysis: {
        ...analysis,
        duration: duration,
        location: location,
        timestamp: timestamp,
        analysisTime: '3.1s',
        modelUsed: 'Gemma 3n 4B Audio',
        confidence: 0.82 + Math.random() * 0.15
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Audio analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Audio analysis failed',
      message: error.message
    });
  }
});

// Conservation recommendations endpoint
app.post('/api/conservation-recommendations', async (req, res) => {
  try {
    const { species, location, userPreferences } = req.body;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const recommendations = [
      {
        action: 'Plant Native Species',
        description: `Plant native ${species.category === 'bird' ? 'flowering plants and trees' : 'plants'} to support ${species.name} habitat`,
        impact: 'High',
        difficulty: 'Easy',
        timeframe: 'Spring/Fall planting seasons'
      },
      {
        action: 'Reduce Chemical Use',
        description: 'Minimize pesticide and herbicide use in your garden and community',
        impact: 'High',
        difficulty: 'Easy',
        timeframe: 'Immediate'
      },
      {
        action: 'Create Wildlife Corridors',
        description: 'Connect fragmented habitats by planting native species along property lines',
        impact: 'Very High',
        difficulty: 'Medium',
        timeframe: '1-2 years'
      },
      {
        action: 'Citizen Science Participation',
        description: `Join local monitoring programs for ${species.name} populations`,
        impact: 'Medium',
        difficulty: 'Easy',
        timeframe: 'Ongoing'
      }
    ];
    
    res.json({
      success: true,
      recommendations: recommendations,
      personalizedTips: [
        `Based on your location in ${location?.name || 'your area'}, focus on native species adaptation`,
        `${species.name} populations benefit most from habitat connectivity`,
        'Your individual actions contribute to larger conservation networks'
      ]
    });
    
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      message: error.message
    });
  }
});

// Ecosystem health assessment
app.post('/api/ecosystem-assessment', async (req, res) => {
  try {
    const { imageData, audioData, location } = req.body;
    
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const healthScore = 0.6 + Math.random() * 0.3; // 60-90%
    const biodiversityIndex = 0.5 + Math.random() * 0.4; // 50-90%
    
    const assessment = {
      overallHealth: healthScore,
      biodiversityIndex: biodiversityIndex,
      indicators: {
        airQuality: 0.7 + Math.random() * 0.2,
        waterQuality: 0.8 + Math.random() * 0.15,
        soilHealth: 0.65 + Math.random() * 0.25,
        noiseLevel: 0.6 + Math.random() * 0.3
      },
      threats: [
        'Urban development pressure',
        'Air pollution from nearby roads',
        'Invasive species presence',
        'Climate change impacts'
      ],
      strengths: [
        'Diverse native plant species',
        'Active wildlife populations',
        'Natural water sources',
        'Community conservation awareness'
      ],
      recommendations: [
        'Establish buffer zones around sensitive areas',
        'Implement invasive species management',
        'Enhance air quality monitoring',
        'Engage local community in conservation efforts'
      ]
    };
    
    res.json({
      success: true,
      assessment: assessment,
      analysisTime: '4.2s',
      modelUsed: 'Gemma 3n 4B Multimodal',
      location: location
    });
    
  } catch (error) {
    console.error('Ecosystem assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'Ecosystem assessment failed',
      message: error.message
    });
  }
});

// Demo dashboard endpoint
app.get('/api/demo-stats', (req, res) => {
  const stats = {
    totalIdentifications: 1247,
    speciesDiscovered: 89,
    conservationActionsCompleted: 156,
    ecosystemsAssessed: 23,
    co2Offset: '2.3 tons',
    biodiversityImpact: '15% improvement in local area',
    communityEngagement: '342 users in your region'
  };
  
  res.json(stats);
});

// Serve demo web interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>EcoGuard Demo - Gemma 3n Hackathon</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0; padding: 20px; background: #F1F8E9; color: #1B5E20;
            }
            .container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 2.5em; font-weight: bold; color: #2E7D32; margin-bottom: 10px; }
            .tagline { font-size: 1.2em; color: #81C784; }
            .card { 
                background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .feature { display: flex; align-items: center; margin-bottom: 16px; }
            .feature-icon { font-size: 24px; margin-right: 12px; }
            .demo-button {
                background: #2E7D32; color: white; border: none; padding: 12px 24px;
                border-radius: 8px; font-size: 16px; cursor: pointer; margin: 8px;
            }
            .demo-button:hover { background: #1B5E20; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
            .stat { text-align: center; }
            .stat-number { font-size: 2em; font-weight: bold; color: #2E7D32; }
            .stat-label { color: #81C784; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🌱 EcoGuard</div>
                <div class="tagline">AI-Powered Environmental Conservation</div>
                <p>Built with Google Gemma 3n for the Hackathon</p>
            </div>
            
            <div class="card">
                <h2>🚀 Live Demo Server</h2>
                <p>This server simulates the Gemma 3n integration for EcoGuard. In production, this would connect directly to the Gemma 3n model for real-time species identification and environmental analysis.</p>
                
                <div class="feature">
                    <span class="feature-icon">📱</span>
                    <div>
                        <strong>Mobile App Integration</strong><br>
                        React Native app connects to this API for AI processing
                    </div>
                </div>
                
                <div class="feature">
                    <span class="feature-icon">🤖</span>
                    <div>
                        <strong>Gemma 3n Multimodal AI</strong><br>
                        Image and audio processing for species identification
                    </div>
                </div>
                
                <div class="feature">
                    <span class="feature-icon">🌍</span>
                    <div>
                        <strong>Conservation Impact</strong><br>
                        Personalized recommendations for environmental action
                    </div>
                </div>
                
                <div class="feature">
                    <span class="feature-icon">🔒</span>
                    <div>
                        <strong>Privacy-First Design</strong><br>
                        All processing can be done offline on-device
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h2>📊 Demo Statistics</h2>
                <div class="stats" id="stats">
                    <div class="stat">
                        <div class="stat-number">1,247</div>
                        <div class="stat-label">Species Identified</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">89</div>
                        <div class="stat-label">Unique Species</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">156</div>
                        <div class="stat-label">Conservation Actions</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">2.3T</div>
                        <div class="stat-label">CO₂ Offset</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h2>🧪 API Testing</h2>
                <p>Test the Gemma 3n integration endpoints:</p>
                <button class="demo-button" onclick="testSpeciesAPI()">Test Species Identification</button>
                <button class="demo-button" onclick="testAudioAPI()">Test Audio Analysis</button>
                <button class="demo-button" onclick="testEcosystemAPI()">Test Ecosystem Assessment</button>
                <div id="results" style="margin-top: 20px; padding: 16px; background: #E8F5E8; border-radius: 8px; display: none;">
                    <h3>API Response:</h3>
                    <pre id="response-data" style="white-space: pre-wrap; font-size: 12px;"></pre>
                </div>
            </div>
            
            <div class="card">
                <h2>🎯 Hackathon Impact</h2>
                <p><strong>EcoGuard represents a unique approach to environmental conservation:</strong></p>
                <ul>
                    <li><strong>Democratizes Expert Knowledge:</strong> Makes species identification accessible to everyone</li>
                    <li><strong>Offline-First Design:</strong> Works in remote areas without internet connectivity</li>
                    <li><strong>Actionable Insights:</strong> Provides personalized conservation recommendations</li>
                    <li><strong>Community Building:</strong> Connects users with local conservation efforts</li>
                    <li><strong>Real-World Impact:</strong> Tracks and measures conservation outcomes</li>
                </ul>
            </div>
        </div>
        
        <script>
            async function testAPI(endpoint, data) {
                const results = document.getElementById('results');
                const responseData = document.getElementById('response-data');
                
                results.style.display = 'block';
                responseData.textContent = 'Loading...';
                
                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    responseData.textContent = JSON.stringify(result, null, 2);
                } catch (error) {
                    responseData.textContent = 'Error: ' + error.message;
                }
            }
            
            function testSpeciesAPI() {
                testAPI('/api/identify-species', {
                    imageData: 'base64_image_data_here',
                    location: { name: 'Demo Location', latitude: 40.7128, longitude: -74.0060 },
                    timestamp: new Date().toISOString()
                });
            }
            
            function testAudioAPI() {
                testAPI('/api/analyze-audio', {
                    audioData: 'base64_audio_data_here',
                    duration: 30,
                    location: { name: 'Demo Location', latitude: 40.7128, longitude: -74.0060 },
                    timestamp: new Date().toISOString()
                });
            }
            
            function testEcosystemAPI() {
                testAPI('/api/ecosystem-assessment', {
                    imageData: 'base64_image_data_here',
                    audioData: 'base64_audio_data_here',
                    location: { name: 'Demo Location', latitude: 40.7128, longitude: -74.0060 }
                });
            }
        </script>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🌱 EcoGuard Demo Server running on http://localhost:${PORT}`);
  console.log(`🚀 Ready for Gemma 3n Hackathon demonstration!`);
  console.log(`📱 Mobile app should connect to: http://localhost:${PORT}/api`);
});

module.exports = app;