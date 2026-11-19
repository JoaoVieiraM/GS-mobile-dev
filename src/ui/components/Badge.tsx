import { StyleSheet, Text, View } from 'react-native';
import { espaco, fonte, ParCores } from '../theme';

interface Props {
  texto: string;
  cor: ParCores;
}

export function Badge({ texto, cor }: Props) {
  return (
    <View style={[estilos.badge, { backgroundColor: cor.fundo, borderColor: cor.texto }]}>
      <Text style={[estilos.texto, { color: cor.texto }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.xs,
  },
  texto: { fontSize: fonte.pequena, fontWeight: '800' },
});
