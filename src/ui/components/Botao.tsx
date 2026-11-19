import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { cores, espaco, fonte, raio } from '../theme';

export type VarianteBotao = 'primario' | 'secundario' | 'perigo';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: VarianteBotao;
  carregando?: boolean;
  desabilitado?: boolean;
}

export function Botao({ titulo, onPress, variante = 'primario', carregando = false, desabilitado = false }: Props) {
  const inativo = desabilitado || carregando;
  const corTexto = variante === 'secundario' ? cores.primaria : cores.primariaTexto;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      onPress={onPress}
      disabled={inativo}
      style={({ pressed }) => [
        estilos.base,
        estilos[variante],
        inativo && estilos.inativo,
        pressed && estilos.pressionado,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        <Text style={[estilos.texto, { color: corTexto }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: raio,
    paddingHorizontal: espaco.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: espaco.xs,
  },
  primario: { backgroundColor: cores.primaria },
  secundario: { backgroundColor: cores.superficie, borderWidth: 2, borderColor: cores.primaria },
  perigo: { backgroundColor: cores.perigo },
  inativo: { opacity: 0.55 },
  pressionado: { opacity: 0.8 },
  texto: { fontSize: fonte.media, fontWeight: '700' },
});
