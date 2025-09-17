import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';

interface VideoStreamProps {
  streamURL: string;
  isSelf?: boolean;
}

export const VideoStream: React.FC<VideoStreamProps> = ({ streamURL, isSelf }) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => isSelf === true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: () => {
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    },
  });

  return (
    <Animated.View
      {...(isSelf ? panResponder.panHandlers : {})}
      style={[
        styles.videoContainer,
        isSelf ? [styles.selfVideo, { transform: pan.getTranslateTransform() }] : styles.otherVideo,
      ]}
    >
      <RTCView
        streamURL={streamURL}
        style={styles.video}
        objectFit="cover"
        mirror={isSelf}
      />
      
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  otherVideo: {
    flex: 1,
  },
  selfVideo: {
    width: 120,
    height: 180,
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 2,
  },
});
