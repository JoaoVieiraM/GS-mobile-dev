import { Redirect, Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useIdentidade } from '../../src/hooks/useIdentidade';
import { cores, fonte } from '../../src/ui/theme';

function Icone({ simbolo }: { simbolo: string }) {
  return <Text style={{ fontSize: 22 }}>{simbolo}</Text>;
}

export default function LayoutAbas() {
  const { estado } = useIdentidade();
  if (estado.tipo === 'anonimo') return <Redirect href="/identificacao" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: cores.primariaTexto,
        headerTitleStyle: { fontSize: fonte.media, fontWeight: '800' },
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarLabelStyle: { fontSize: 14, fontWeight: '700' },
        tabBarStyle: { minHeight: 64 },
      }}
    >
      <Tabs.Screen
        name="zonas"
        options={{ title: 'Minhas zonas', headerShown: false, tabBarIcon: () => <Icone simbolo="🌱" /> }}
      />
      <Tabs.Screen name="alertas" options={{ title: 'Alertas', tabBarIcon: () => <Icone simbolo="🔔" /> }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: () => <Icone simbolo="👤" /> }} />
    </Tabs>
  );
}
