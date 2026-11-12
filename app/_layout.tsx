import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '../src/store';
import { colors } from '../src/theme';

// Handle the root navigation and check the user's login status
function Root() {
  const { ready, user } = useApp();

  // Show a loading spinner while the app is restoring the saved session
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      {/* Set the appearance of the device status bar */}
      <StatusBar style="light" />

      {/* Define the main stack navigation and hide default headers */}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>

        {/* Register the main index screen */}
        <Stack.Screen name="index" />

        {/* Allow login and registration screens only when no user is logged in */}
        <Stack.Protected guard={!user}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack.Protected>

        {/* Allow customer screens only when the logged-in user has the customer role */}
        <Stack.Protected guard={user?.role === 'customer'}>
          <Stack.Screen name="(customer)" />
        </Stack.Protected>

        {/* Allow the jobs screen only when the logged-in user has the provider role */}
        <Stack.Protected guard={user?.role === 'provider'}>
          <Stack.Screen name="jobs" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

// Wrap the entire application with the required providers
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* Make shared application data and functions available throughout the app */}
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}