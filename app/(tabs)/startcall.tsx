import { View, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function StartCallScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Button
        title='Start Call'
        onPress={() => router.push('/call')}
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
