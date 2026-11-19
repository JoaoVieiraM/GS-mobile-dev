import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProvedorIdentidade } from '../src/hooks/useIdentidade';
import { cores } from '../src/ui/theme';

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider>
      <ProvedorIdentidade>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="identificacao" />
          <Stack.Screen name="(app)" />
        </Stack>
      </ProvedorIdentidade>
    </SafeAreaProvider>
  );
}
