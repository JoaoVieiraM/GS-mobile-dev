import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { cores, espaco, raio } from '../theme';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  rotuloAcessivel?: string;
}

export function Card({ children, onPress, rotuloAcessivel }: Props) {
  if (onPress === undefined) return <View style={estilos.card}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel}
      onPress={onPress}
      style={({ pressed }) => [estilos.card, pressed && estilos.pressionado]}
    >
      {children}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.md,
    marginBottom: espaco.md,
    gap: espaco.sm,
  },
  pressionado: { backgroundColor: cores.neutroClaro },
});
