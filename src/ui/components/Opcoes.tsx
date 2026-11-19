/** Grupo de opções em "chips" grandes, fácil de tocar (usado para escolher a cultura). */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espaco, fonte } from '../theme';

interface Props<T extends string> {
  rotulo: string;
  opcoes: readonly T[];
  rotuloDe: (opcao: T) => string;
  selecionada: T | null;
  onSelecionar: (opcao: T) => void;
  erro?: string | undefined;
}

export function Opcoes<T extends string>({ rotulo, opcoes, rotuloDe, selecionada, onSelecionar, erro }: Props<T>) {
  return (
    <View style={estilos.bloco}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <View style={estilos.linha} accessibilityRole="radiogroup">
        {opcoes.map((op) => {
          const ativa = op === selecionada;
          return (
            <Pressable
              key={op}
              accessibilityRole="radio"
              accessibilityState={{ selected: ativa }}
              onPress={() => onSelecionar(op)}
              style={[estilos.chip, ativa && estilos.chipAtivo]}
            >
              <Text style={[estilos.chipTexto, ativa && estilos.chipTextoAtivo]}>{rotuloDe(op)}</Text>
            </Pressable>
          );
        })}
      </View>
      {erro !== undefined ? <Text style={estilos.erro}>{erro}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  bloco: { marginBottom: espaco.md },
  rotulo: { fontSize: fonte.normal, fontWeight: '700', color: cores.texto, marginBottom: espaco.sm },
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  chip: {
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: espaco.md,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  chipAtivo: { borderColor: cores.primaria, backgroundColor: cores.primaria },
  chipTexto: { fontSize: fonte.normal, color: cores.texto, fontWeight: '600' },
  chipTextoAtivo: { color: cores.primariaTexto },
  erro: { color: cores.perigo, fontSize: fonte.pequena, marginTop: espaco.xs, fontWeight: '600' },
});
