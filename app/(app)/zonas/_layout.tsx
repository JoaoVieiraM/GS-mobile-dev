import { Stack } from 'expo-router';
import { cores, fonte } from '../../../src/ui/theme';

export default function LayoutZonas() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: cores.primariaTexto,
        headerTitleStyle: { fontSize: fonte.media, fontWeight: '800' },
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Minhas zonas' }} />
      <Stack.Screen name="nova" options={{ title: 'Nova zona' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhe da zona' }} />
    </Stack>
  );
}
