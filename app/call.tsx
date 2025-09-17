import { VideoStream } from '@/components/VideoStream';
import { Camera } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MediaStream, RTCView, mediaDevices } from 'react-native-webrtc';

export default function CallScreen() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

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

  const toggleMute = () => {
    if (!localStream) return;
    localStream
      .getAudioTracks()
      .forEach((track: any) => (track.enabled = !track.enabled));
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    localStream
      .getVideoTracks()
      .forEach((track: any) => (track.enabled = !track.enabled));
    setIsVideoOn(!isVideoOn);
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
      if (localStream) {
        localStream.release();
      }
    };
  }, []);

  const startStream = async () => {
    try {
      const newStream = await mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setLocalStream(newStream);
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
      {localStream ? (
        <VideoStream streamURL={localStream.toURL()} isSelf/>
      ) : (
        <Text>Loading stream...</Text>
      )}

      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleMute} style={styles.button}>
          <Text style={styles.buttonText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleVideo} style={styles.button}>
          <Text style={styles.buttonText}>
            {isVideoOn ? 'Video Off' : 'Video On'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]}>
          <Text style={styles.buttonText}>End</Text>
        </TouchableOpacity>
      </View>
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
  // container: { flex: 1, backgroundColor: 'black' },
  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    padding: 15,
    borderRadius: 50,
    backgroundColor: '#333',
  },
  buttonText: { color: 'white', fontSize: 16 },
});
