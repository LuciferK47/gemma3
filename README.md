# EcoGuard - AI-Powered Environmental Conservation Assistant

## 🌟 New Features - Modern Web UI

EcoGuard now features a beautiful, modern web interface with:

- **🎨 Sophisticated Design**: Dark theme with 3D animations and interactive elements
- **📱 Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **🚀 Real-time Processing**: Live file upload with drag-and-drop support
- **🎵 Audio Analysis**: Upload audio files for ecosystem health assessment
- **🌍 Location-based Recommendations**: Personalized conservation plans based on your location
- **📊 Live Statistics**: Real-time project metrics and impact tracking
- **✨ Interactive Animations**: Three.js 3D background and smooth scroll animations

### Quick Start
```bash
npm run demo  # Start the web demo server
# Visit http://localhost:3000 to see the new UI
```

---

##  Google Gemma 3n Hackathon Submission

> **Democratizing environmental conservation through on-device AI**  
> Built with Google's Gemma 3n for privacy-first, offline-capable species identification and ecosystem assessment.

---

##  **DEMO LINKS**

| Resource | Link | Status |
|----------|------|--------|
| **Video Demo** | [TO BE ADDED] | ⚠️ In Production |
| **Live Demo** | http://localhost:3000 | ✅ Working Locally |
| **Technical Writeup** | [TECHNICAL_WRITEUP.md](./TECHNICAL_WRITEUP.md) | ✅ Complete |
| **Submission Checklist** | [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md) | ✅ Complete |

---

## Project Overview

EcoGuard is an innovative environmental conservation application powered by Google's Gemma 3n model. It addresses the critical need for accessible, offline-capable tools that help conservationists, researchers, and citizens monitor and protect our environment.

###  **The Problem We're Solving**

- **Limited Expert Access**: Conservation expertise isn't available everywhere it's needed
- **Remote Location Challenges**: Most conservation work happens where internet is unreliable
- **Language Barriers**: Global conservation efforts face communication obstacles
- **Real-time Assessment Need**: Ecosystems require immediate, expert-level analysis
- **Privacy Concerns**: Sensitive species location data needs protection

### **Our Gemma 3n-Powered Solution**

EcoGuard leverages Gemma 3n's unique capabilities to provide:

#### **Core Features**
1. **Multimodal Species Identification**
   - Image recognition for plants, animals, and insects
   - Audio analysis for bird calls and environmental sounds
   - Real-time identification with confidence scores

2. **Offline-First Design**
   - Complete functionality without internet connection
   - Privacy-preserving local processing
   - Essential for remote fieldwork

3. **Multilingual Support**
   - Species information in multiple languages
   - Voice interactions in local languages
   - Breaking down conservation communication barriers

4. **Environmental Health Assessment**
   - Ecosystem condition analysis from visual and audio cues
   - Pollution detection and air quality assessment
   - Biodiversity tracking and reporting

5. **Conservation Action Recommendations**
   - Personalized conservation actions based on location and findings
   - Integration with local conservation initiatives
   - Educational content and best practices

---

## **Gemma 3n Integration**

### **Model Configuration**
- **Primary Model**: 4B parameters for high-accuracy identification
- **Submodel**: 2B parameters for battery-optimized processing
- **Mix'n'Match**: Dynamic performance adjustment based on device state
- **Multimodal Processing**: Image, audio, and text understanding
- **On-Device Inference**: Complete privacy and offline functionality

### **Technical Architecture**
```
Frontend (React Native)
├── Multimodal UI Components
├── Camera Integration (Expo Camera)
├── Audio Recording (Expo AV)
├── Offline Database (SQLite)
└── Location Services (Expo Location)

AI Engine (Gemma 3n Integration)
├── 4B Parameter Model (Primary)
├── 2B Submodel (Battery Optimization)
├── Multimodal Processing Pipeline
├── On-Device Inference Engine
└── Conservation Knowledge Base
```

---

##  **Quick Start**

### **Prerequisites**
- Node.js (v16 or higher)
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecoguard-gemma3n
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the demo server**
   ```bash
   npm run demo
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### **For Mobile Development**
```bash
# Install Expo CLI
npm install -g expo-cli

# Start the development server
npm start

# Run on device/simulator
npm run android  # For Android
npm run ios      # For iOS
```

---

## **Demo Scenarios**

### **1. Field Researcher in Amazon Rainforest**
- Identifies unknown plant species through camera
- Records and analyzes bird calls for biodiversity assessment
- Generates conservation report in Portuguese

### **2. Citizen Scientist in Urban Park**
- Identifies local flora and fauna
- Assesses air quality through visual indicators
- Receives personalized conservation actions

### **3. Conservation Team in Remote Africa**
- Tracks endangered species through images and sounds
- Monitors ecosystem health changes
- Coordinates conservation efforts in local languages

---

## **Impact & Vision**

EcoGuard democratizes environmental conservation by:
- **Making expert-level species identification accessible to everyone**
- **Enabling conservation work in the most remote locations**
- **Breaking down language barriers in global conservation efforts**
- **Empowering citizens to contribute to environmental protection**
- **Providing actionable insights for immediate conservation impact**

### **Success Metrics**
- Species identification accuracy: **>90%**
- Processing speed: **<3 seconds** on mobile devices
- Battery optimization: **40% improvement** over cloud alternatives
- Offline functionality: **100%** of core features available

---

## **Technical Highlights**

### **Innovative Features**
1. **Dynamic Model Switching** - Optimizes between 4B and 2B models based on battery and performance needs
2. **Cross-Modal Reasoning** - Combines visual and audio analysis for comprehensive ecosystem assessment
3. **Privacy-First Architecture** - All sensitive data processed locally on device
4. **Offline-First Design** - Complete functionality without internet connectivity

### **File Structure**
```
ecoguard-gemma3n/
├── src/
│   ├── services/
│   │   ├── GemmaService.js      # Gemma 3n AI integration
│   │   └── DatabaseService.js   # SQLite database management
│   ├── screens/
│   │   ├── HomeScreen.js        # Dashboard and overview
│   │   ├── CameraScreen.js      # Species identification
│   │   ├── AudioScreen.js       # Environmental sound analysis
│   │   ├── HistoryScreen.js     # Discovery history
│   │   └── SettingsScreen.js    # App configuration
│   └── components/              # Reusable UI components
├── demo/
│   ├── demo-server.js          # Hackathon demonstration server
│   └── public/                 # Web demo interface
├── docs/
│   ├── TECHNICAL_WRITEUP.md    # Detailed technical documentation
│   ├── SUBMISSION_CHECKLIST.md # Hackathon submission checklist
│   └── VIDEO_DEMO_SCRIPT.md    # Video production guide
└── package.json               # Dependencies and scripts
```


## **Deployment Options**

### **Local Development**
```bash
npm run demo  # Starts local demo server
```

### **Production Deployment**
```bash
# Heroku deployment
heroku create ecoguard-demo
git push heroku main

# Vercel deployment
vercel --prod

# Docker deployment
docker build -t ecoguard .
docker run -p 3000:3000 ecoguard
```

---

## **Documentation**

- **[Technical Writeup](./TECHNICAL_WRITEUP.md)** - Comprehensive technical documentation
- **[Submission Checklist](./SUBMISSION_CHECKLIST.md)** - Hackathon requirements tracking
- **[Video Demo Script](./VIDEO_DEMO_SCRIPT.md)** - Production guide for demo video

---

## **Contributing**

EcoGuard is built for the Google Gemma 3n Hackathon with the vision of creating a global conservation community. Future contributions welcome for:

- Additional species databases
- New language support
- Advanced AI features
- Conservation partnership integrations

---


## **Hackathon Submission**

**Team**: EcoGuard Conservation AI  
**Challenge**: Google Gemma 3n Hackathon  
**Category**: Environmental Sustainability & Conservation  
**Built with**: Gemma 3n, React Native, Node.js, Express

---

*EcoGuard: Democratizing AI-powered environmental conservation - because everyone deserves a chance to GROW.*
