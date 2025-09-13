import AsyncStorage from '@react-native-async-storage/async-storage';

// Store data
export const storeData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    console.log('Data saved successfully');
  } catch (e) {
    console.error('Error saving data:', e);
  }
};

// Get data
export const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error reading data:', e);
    return null;
  }
};

// Remove data
export const removeData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log('Data removed successfully');
  } catch (e) {
    console.error('Error removing data:', e);
  }
};

// Clear all data
export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
    console.log('All data cleared');
  } catch (e) {
    console.error('Error clearing data:', e);
  }
};