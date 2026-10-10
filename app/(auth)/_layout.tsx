import { Redirect, Stack } from 'expo-router';
import { useApp } from '../../src/store/AppContext';

export default function AuthLayout() {
  const { user } = useApp();
  if (user) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
