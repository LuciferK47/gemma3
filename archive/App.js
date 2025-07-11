import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import AudioScreen from './src/screens/AudioScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import services
import GemmaService from './src/services/GemmaService';
import DatabaseService from './src/services/DatabaseService';

// Custom theme for EcoGuard
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2E7D32', // Forest Green
    accent: '#4CAF50', // Light Green
    background: '#F1F8E9', // Very Light Green
    surface: '#FFFFFF',
    text: '#1B5E20', // Dark Green
    placeholder: '#81C784',
  },
};

const Tab = createBottomTabNavigator();

export default function App() {
  const [isGemmaReady, setIsGemmaReady] = useState(false);
  const [isDbReady, setIsDbReady] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🌱 Initializing EcoGuard...');
      
      // Initialize database
      console.log('📊 Setting up database...');
      await DatabaseService.initialize();
      setIsDbReady(true);
      console.log('✅ Database ready');

      // Initialize Gemma 3n model
      console.log('🤖 Loading Gemma 3n model...');
      await GemmaService.initialize();
      setIsGemmaReady(true);
      console.log('✅ Gemma 3n ready');

      console.log('🎉 EcoGuard initialized successfully!');
    } catch (error) {
      console.error('❌ Initialization error:', error);
      setInitError(error.message);
      Alert.alert(
        'Initialization Error',
        `Failed to initialize EcoGuard: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  const getTabBarIcon = (routeName, focused, color, size) => {
    let iconName;

    switch (routeName) {
      case 'Home':
        iconName = 'home';
        break;
      case 'Camera':
        iconName = 'camera-alt';
        break;
      case 'Audio':
        iconName = 'mic';
        break;
      case 'History':
        iconName = 'history';
        break;
      case 'Settings':
        iconName = 'settings';
        break;
      default:
        iconName = 'help';
    }

    return <Icon name={iconName} size={size} color={color} />;
  };

  if (initError) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.errorContent}>
          <Icon name="error" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Initialization Failed</Text>
          <Text style={styles.errorMessage}>{initError}</Text>
          <Text style={styles.errorHelp}>
            Please check your device compatibility and try restarting the app.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isGemmaReady || !isDbReady) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.loadingContent}>
          <Icon name="eco" size={80} color={theme.colors.primary} />
          <Text style={styles.loadingTitle}>EcoGuard</Text>
          <Text style={styles.loadingSubtitle}>AI-Powered Environmental Conservation</Text>
          
          <View style={styles.loadingStatus}>
            <View style={styles.statusItem}>
              <Icon 
                name={isDbReady ? 'check-circle' : 'hourglass-empty'} 
                size={20} 
                color={isDbReady ? theme.colors.primary : theme.colors.placeholder} 
              />
              <Text style={[styles.statusText, { color: isDbReady ? theme.colors.primary : theme.colors.placeholder }]}>
                Database {isDbReady ? 'Ready' : 'Loading...'}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Icon 
                name={isGemmaReady ? 'check-circle' : 'hourglass-empty'} 
                size={20} 
                color={isGemmaReady ? theme.colors.primary : theme.colors.placeholder} 
              />
              <Text style={[styles.statusText, { color: isGemmaReady ? theme.colors.primary : theme.colors.placeholder }]}>
                Gemma 3n {isGemmaReady ? 'Ready' : 'Loading...'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.loadingNote}>
            Powered by Google Gemma 3n • Privacy-First • Offline-Ready
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) =>
              getTabBarIcon(route.name, focused, color, size),
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.placeholder,
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.primary,
              borderTopWidth: 1,
            },
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'EcoGuard' }}
          />
          <Tab.Screen 
            name="Camera" 
            component={CameraScreen}
            options={{ title: 'Species ID' }}
          />
          <Tab.Screen 
            name="Audio" 
            component={AudioScreen}
            options={{ title: 'Sound Analysis' }}
          />
          <Tab.Screen 
            name="History" 
            component={HistoryScreen}
            options={{ title: 'My Discoveries' }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingStatus: {
    marginTop: 30,
    alignItems: 'flex-start',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  loadingNote: {
    fontSize: 12,
    color: '#81C784',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginTop: 20,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorHelp: {
    fontSize: 14,
    color: '#81C784',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});