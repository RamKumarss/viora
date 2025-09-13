import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { USER_STORAGE_KEY } from '@/constant';
import { getData } from '@/services/storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  Swipeable,
} from 'react-native-gesture-handler';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { Socket, io } from 'socket.io-client';

type Message = {
  id: string;
  text: string;
  sender: string;
  replyTo?: string;
};

const initialMessages: Message[] = [
  { id: '1', text: 'Whats up buddy?', sender: 'other' },
  { id: '2', text: 'Whats up buddy?', sender: 'other' },
  { id: '3', text: 'Whats up buddy?', sender: 'other' },
  { id: '4', text: 'Whats up buddy?', sender: 'other' },
  { id: '5', text: 'Whats up buddy?', sender: 'other' },
  { id: '6', text: 'Whats up buddy?', sender: 'other' },
  { id: '7', text: 'Whats up buddy?', sender: 'other' },
  { id: '8', text: 'Whats up buddy?', sender: 'other' },
  { id: '9', text: 'Whats up buddy?', sender: 'other' },
];

export const options = {
  headerShown: true,
  tabBarStyle: { display: 'none' },
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const userNameRef = useRef('');
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<KeyboardAwareFlatList>(null);

  useEffect(() => {
    getUserName();
    socketConnection();

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height + 20);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      socketRef.current?.disconnect();
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const getUserName = async () => {
    try {
      userNameRef.current = await getData(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Error in fetch user name - chat.js', error);
    }
  };

  const socketConnection = () => {
    const SERVER_URL = 'https://video-chat-backend-1-0ha6.onrender.com/';
    socketRef.current = io(SERVER_URL);

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to server:', socketRef.current?.id);
    });

    socketRef.current.on('chatMessage', (msg: any) => {
      msg.sender === userNameRef.current
        ? (msg.sender = 'me')
        : (msg.sender = 'other');
      setMessages((prev: any) => [...prev, msg]);
    });
  };

  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: userNameRef.current,
      replyTo: replyingTo?.id,
    };
    socketRef.current.emit('chatMessage', newMessage);
    setInput('');
    setReplyingTo(null);
    Keyboard.dismiss();
  };

  const renderReplyPreview = () => {
    if (!replyingTo) return null;
    return (
      <View style={styles.replyPreview}>
        <Text style={styles.replyLabel}>Replying to:</Text>
        <Text style={styles.replyText} numberOfLines={1}>
          {replyingTo.text}
        </Text>
        <TouchableOpacity onPress={() => setReplyingTo(null)}>
          <Text style={styles.cancelReply}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    message: Message
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 50],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.leftAction}>
        <Animated.Text style={[styles.replyIcon, { transform: [{ scale }] }]}>
          ↩️
        </Animated.Text>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const repliedMessage = item.replyTo
      ? messages.find((m) => m.id === item.replyTo)
      : null;

    const bubble = (
      <View
        style={[
          styles.messageBubble,
          item.sender === 'me'
            ? styles.myMessageBubble
            : styles.otherMessageBubble,
        ]}
      >
        {repliedMessage && (
          <View style={styles.replyContainer}>
            <Text style={styles.replyLabel}>Reply:</Text>
            <Text style={styles.replyText} numberOfLines={1}>
              {repliedMessage.text}
            </Text>
          </View>
        )}
        <ThemedText style={styles.messageText}>{item.text}</ThemedText>
      </View>
    );

    if (item.sender === 'other') {
      return (
        <View>
          <Swipeable
            renderLeftActions={(progress, dragX) =>
              renderLeftActions(progress, dragX, item)
            }
            onSwipeableOpen={() => setReplyingTo(item)}
            friction={2}
            overshootFriction={8}
          >
            <View
              style={[styles.messageContainer, styles.otherMessageContainer]}
            >
              {bubble}
            </View>
          </Swipeable>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, styles.myMessageContainer]}>
        {bubble}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemedView style={styles.container}>
          {/* Chat messages */}
          <KeyboardAwareFlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            keyboardShouldPersistTaps='handled'
            extraScrollHeight={Platform.OS === 'ios' ? 60 : 0}
            enableOnAndroid={true}
            automaticallyAdjustContentInsets={false}
            extraHeight={Platform.OS === 'android' ? 100 : 0}
          />

          {/* Reply preview (above input) */}
          {renderReplyPreview()}

          {/* Input Container with keyboard padding for Android */}
          <View
            style={[
              styles.inputWrapper,
              Platform.OS === 'android' && { paddingBottom: keyboardHeight },
            ]}
          >
            <View style={styles.inputContainer}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder='Type a message...'
                style={styles.input}
                onFocus={() => {
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                  }, 300);
                }}
                returnKeyType='send' // shows "Send" button in keyboard
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Text style={styles.sendText}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ThemedView>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messageList: {
    padding: 12,
    flexGrow: 1,
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '90%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: '#7b93e8',
    borderTopRightRadius: 0,
  },
  otherMessageBubble: {
    backgroundColor: '#e5e5ea',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },

  replyContainer: {
    borderLeftWidth: 3,
    borderLeftColor: '#888',
    paddingLeft: 6,
    marginBottom: 4,
  },
  replyLabel: {
    fontSize: 12,
    color: '#666',
  },
  replyText: {
    fontSize: 14,
    color: '#444',
  },

  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ddd',
    padding: 6,
    marginHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  cancelReply: {
    marginLeft: 'auto',
    color: 'red',
    fontWeight: 'bold',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    margin: 8,
    borderRadius: 24,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  sendButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendText: {
    fontSize: 20,
    color: '#0a7ea4',
  },

  leftAction: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 15,
  },
  replyIcon: {
    fontSize: 22,
  },

  // inputWrapper: {
  //   borderTopWidth: 1,
  //   borderTopColor: '#ccc',
  //   backgroundColor: '#fff',
  // },
});
