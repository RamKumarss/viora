import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/services/useAuth';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { userName, isLoading, login, logout } = useAuth();
  const [loginName, setLoginName] = useState('');

  const handleLogin = async () => {
    if (!loginName.trim()) {
      alert('Please enter your name');
      return;
    }
    await login(loginName);
    setLoginName('');
  };

  if (!loaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!userName) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={styles.loginContainer}>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>Welcome to Viora</Text>
            <Text style={styles.loginSubtitle}>
              Please enter your name to continue
            </Text>

            <TextInput
              style={styles.input}
              placeholder='Enter your name'
              value={loginName}
              onChangeText={setLoginName}
              autoCapitalize='words'
              autoCorrect={false}
              maxLength={50}
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
          <StatusBar style='auto' />
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ paddingTop: 40, flex: 1 }}>
        <Stack>
          <Stack.Screen
            name='(tabs)'
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name='+not-found' />
        </Stack>
      </View>
      <StatusBar style='auto' />
    </ThemeProvider>
  );
}

// Use the same styles as above
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  loginSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
