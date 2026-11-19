import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';
import { cores, espaco, fonte, raio } from '../theme';

interface Props {
  rotulo: string;
  valor: string;
  onChange: (texto: string) => void;
  erro?: string | undefined;
  dica?: string;
  placeholder?: string;
  teclado?: KeyboardTypeOptions;
}

export function Campo({ rotulo, valor, onChange, erro, dica, placeholder, teclado = 'default' }: Props) {
  const temErro = erro !== undefined;
  return (
    <View style={estilos.bloco}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        accessibilityLabel={rotulo}
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={cores.textoSuave}
        keyboardType={teclado}
        style={[estilos.entrada, temErro && estilos.entradaErro]}
      />
      {temErro ? (
        <Text style={estilos.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : dica !== undefined ? (
        <Text style={estilos.dica}>{dica}</Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  bloco: { marginBottom: espaco.md },
  rotulo: { fontSize: fonte.normal, fontWeight: '700', color: cores.texto, marginBottom: espaco.xs },
  entrada: {
    minHeight: 52,
    borderWidth: 2,
    borderColor: cores.borda,
    borderRadius: raio,
    paddingHorizontal: espaco.md,
    fontSize: fonte.media,
    color: cores.texto,
    backgroundColor: cores.superficie,
  },
  entradaErro: { borderColor: cores.perigo },
  erro: { color: cores.perigo, fontSize: fonte.pequena, marginTop: espaco.xs, fontWeight: '600' },
  dica: { color: cores.textoSuave, fontSize: fonte.pequena, marginTop: espaco.xs },
});
