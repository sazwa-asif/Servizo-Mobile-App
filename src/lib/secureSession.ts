import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Define storage key and check if app is running on mobile
const KEY = 'servizo_session';
const native = Platform.OS === 'ios' || Platform.OS === 'android';

// Retrieve the saved user session
export async function loadSession(): Promise<string | null> {
  try {
    return native ? await SecureStore.getItemAsync(KEY) : await AsyncStorage.getItem(KEY);
  } catch {
    return null;
  }
}

// Save user session or remove it during logout
export async function saveSession(userId: string | null): Promise<void> {
  try {
    if (native) {
      if (userId) await SecureStore.setItemAsync(KEY, userId);
      else await SecureStore.deleteItemAsync(KEY);
    } else if (userId) {
      await AsyncStorage.setItem(KEY, userId);
    } else {
      await AsyncStorage.removeItem(KEY);
    }
  } catch {}
}