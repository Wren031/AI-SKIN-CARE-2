import { TabVisibilityProvider } from '@/src/context/TabVisibilityContext';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TabVisibilityProvider>
        <Stack screenOptions={{ headerShown: false }}>

          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="index" />

        </Stack>  
      </TabVisibilityProvider>
    </SafeAreaProvider>
  );
}
