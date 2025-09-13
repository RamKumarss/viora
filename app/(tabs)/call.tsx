import { Camera } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Linking,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { MediaStream, RTCView, mediaDevices } from 'react-native-webrtc';

export default function CallScreen() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const openAppSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('Cannot open settings:', error);
    }
  };

  const showPermissionAlert = () => {
    Alert.alert(
      'Permissions Required',
      'Camera and microphone permissions are required for video calls. Please enable them in app settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openAppSettings },
      ]
    );
  };

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Request camera permissions using Expo Camera
        const { status } = await Camera.requestCameraPermissionsAsync();
        const audioStatus = await Camera.requestMicrophonePermissionsAsync();
        if (status === 'granted' && audioStatus.status === 'granted') {
          setHasPermission(true);
          startStream();
        } else {
          setHasPermission(false);
          setPermissionDenied(true);
          showPermissionAlert();
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
        setHasPermission(false);
      }
    };

    requestPermissions();

    return () => {
      if (stream) {
        stream.release();
      }
    };
  }, []);

  const startStream = async () => {
    try {
      const newStream = await mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setStream(newStream);
      setPermissionDenied(false);
    } catch (error) {
      console.error('Error starting stream:', error);
      setPermissionDenied(true);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <Button title='Open Settings' onPress={openAppSettings} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {stream ? (
        <RTCView
          streamURL={stream.toURL()}
          style={styles.video}
          objectFit='cover'
        />
      ) : (
        <Text>Loading stream...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
