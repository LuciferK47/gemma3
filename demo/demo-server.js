/**
 * EcoGuard Demo Server
 * Simulates real-world Gemma 3n integration for hackathon demonstration
 * This showcases how the app would work with actual Gemma 3n deployment
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for species identification'), false);
      }
    } else if (file.fieldname === 'audio') {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed for sound analysis'), false);
      }
    } else {
      cb(null, true);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

console.log('🌍 EcoGuard Demo Server');
console.log('Built with Gemma 3n for Environmental Conservation');
console.log('='.repeat(50));
console.log('🤖 Gemma 3n Integration Points:');
console.log('   - Species Identification: /api/identify-species');
console.log('   - Audio Analysis: /api/analyze-audio');
console.log('   - Conservation Plans: /api/conservation-recommendations');
console.log('   - Ecosystem Assessment: /api/ecosystem-assessment');
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

// Species identification endpoint - supports both file upload and JSON
app.post('/api/identify-species', upload.single('image'), async (req, res) => {
  try {
    let imageData, location, timestamp;
    
    if (req.file) {
      // File upload from new UI
      imageData = req.file.buffer;
      location = req.body.location ? JSON.parse(req.body.location) : { name: 'Demo Location' };
      timestamp = req.body.timestamp || new Date().toISOString();
      
      console.log(`🔍 Processing uploaded image: ${req.file.originalname} (${req.file.size} bytes)`);
    } else {
      // JSON request from legacy API
      const body = req.body;
      imageData = body.imageData;
      location = body.location;
      timestamp = body.timestamp;
    }
    
    // Simulate Gemma 3n processing time
    // In production, this would call: GemmaService.identifySpecies(imageData, location)
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

// Audio analysis endpoint - supports both file upload and JSON
app.post('/api/analyze-audio', upload.single('audio'), async (req, res) => {
  try {
    let audioData, duration, location, timestamp;
    
    if (req.file) {
      // File upload from new UI
      audioData = req.file.buffer;
      duration = req.body.duration ? parseInt(req.body.duration) : 30;
      location = req.body.location ? JSON.parse(req.body.location) : { name: 'Demo Location' };
      timestamp = req.body.timestamp || new Date().toISOString();
      
      console.log(`🎵 Processing uploaded audio: ${req.file.originalname} (${req.file.size} bytes)`);
    } else {
      // JSON request from legacy API
      const body = req.body;
      audioData = body.audioData;
      duration = body.duration;
      location = body.location;
      timestamp = body.timestamp;
    }
    
    // Simulate Gemma 3n audio processing
    // In production, this would call: GemmaService.analyzeAudio(audioData, duration, location)
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
    
    console.log(`🌱 Generating conservation plan for location: ${location?.name || 'Unknown'}`);
    
    // Simulate Gemma 3n processing for personalized recommendations
    // In production, this would call: GemmaService.generateConservationRecommendations(species, location)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Enhanced location-based recommendations
    const locationName = location?.name || 'your area';
    const isCoastal = locationName.toLowerCase().includes('goa') || locationName.toLowerCase().includes('coast');
    const isUrban = locationName.toLowerCase().includes('city') || locationName.toLowerCase().includes('urban');
    const isTropical = locationName.toLowerCase().includes('goa') || locationName.toLowerCase().includes('india');
    
    let recommendations = [
      {
        action: 'Plant Native Species',
        description: isTropical 
          ? `Plant native tropical species like coconut palms, cashew trees, and indigenous flowering plants to support local biodiversity in ${locationName}`
          : `Plant native ${species?.category === 'bird' ? 'flowering plants and trees' : 'plants'} to support local wildlife habitat`,
        impact: 'High',
        difficulty: 'Easy',
        timeframe: 'Spring/Monsoon planting seasons'
      },
      {
        action: isCoastal ? 'Coastal Conservation' : 'Habitat Protection',
        description: isCoastal 
          ? 'Protect coastal mangrove ecosystems and participate in beach cleanup initiatives to preserve marine biodiversity'
          : 'Create buffer zones around natural habitats and minimize human disturbance to wildlife areas',
        impact: 'Very High',
        difficulty: 'Medium',
        timeframe: 'Ongoing'
      },
      {
        action: 'Water Conservation',
        description: isTropical
          ? 'Implement rainwater harvesting during monsoon season and create water sources for wildlife during dry periods'
          : 'Install rain gardens and reduce water consumption to support local aquatic ecosystems',
        impact: 'High',
        difficulty: 'Medium',
        timeframe: '3-6 months'
      },
      {
        action: isUrban ? 'Urban Green Spaces' : 'Wildlife Corridors',
        description: isUrban
          ? 'Advocate for more urban green spaces and create rooftop gardens to provide habitat in city environments'
          : 'Connect fragmented habitats by planting native species along property lines and creating wildlife corridors',
        impact: 'Very High',
        difficulty: 'Medium',
        timeframe: '1-2 years'
      },
      {
        action: 'Community Engagement',
        description: `Join local conservation groups in ${locationName} and participate in citizen science programs to monitor biodiversity`,
        impact: 'Medium',
        difficulty: 'Easy',
        timeframe: 'Immediate'
      },
      {
        action: 'Sustainable Practices',
        description: 'Reduce plastic use, choose sustainable products, and support eco-friendly businesses to minimize environmental impact',
        impact: 'High',
        difficulty: 'Easy',
        timeframe: 'Immediate'
      }
    ];
    
    // Add location-specific tips
    let personalizedTips = [
      `Based on your location in ${locationName}, these recommendations are tailored to your local ecosystem`,
      'Small individual actions create significant collective impact for conservation',
      'Consider seasonal timing for maximum effectiveness of your conservation efforts'
    ];
    
    if (isCoastal) {
      personalizedTips.push('Coastal areas are biodiversity hotspots - your conservation efforts can protect unique marine and terrestrial species');
    }
    
    if (isTropical) {
      personalizedTips.push('Tropical regions have high biodiversity - focus on protecting endemic species and traditional ecological knowledge');
    }
    
    if (isUrban) {
      personalizedTips.push('Urban conservation is crucial - cities can be stepping stones for wildlife migration and adaptation');
    }
    
    res.json({
      success: true,
      recommendations: recommendations,
      personalizedTips: personalizedTips,
      locationAnalysis: {
        type: isCoastal ? 'coastal' : isUrban ? 'urban' : 'terrestrial',
        climateZone: isTropical ? 'tropical' : 'temperate',
        priorityActions: isCoastal ? ['mangrove protection', 'marine conservation'] : 
                        isUrban ? ['green infrastructure', 'urban biodiversity'] : 
                        ['habitat connectivity', 'native species restoration']
      }
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
    totalIdentifications: 1428,
    speciesDiscovered: 89,
    conservationActionsCompleted: 156,
    ecosystemsAssessed: 23,
    co2Offset: '2.3 tons',
    biodiversityImpact: '15% improvement in local area',
    communityEngagement: '342 users in your region',
    hoursAnalyzed: 312
  };
  
  res.json(stats);
});

// Serve demo web interface - redirect to static file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🌱 EcoGuard Demo Server running on http://localhost:${PORT}`);
  console.log(`🚀 Ready for Gemma 3n Hackathon demonstration!`);
  console.log(`📱 Mobile app should connect to: http://localhost:${PORT}/api`);
});

module.exports = app;