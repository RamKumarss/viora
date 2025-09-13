import { View, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Button
        title='Chat with Others'
        onPress={() => router.push('/chat')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    padding: 16,
  },
});
