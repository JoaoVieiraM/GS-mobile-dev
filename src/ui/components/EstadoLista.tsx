/** Telas dos estados de lista: carregando, erro e vazio — cada um com sua própria UI. */
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { cores, espaco, fonte } from '../theme';
import { Botao } from './Botao';

export function Carregando({ mensagem }: { mensagem: string }) {
  return (
    <View style={estilos.centro} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={cores.primaria} />
      <Text style={estilos.texto}>{mensagem}</Text>
    </View>
  );
}

export function Erro({ mensagem, onTentarDeNovo }: { mensagem: string; onTentarDeNovo: () => void }) {
  return (
    <View style={estilos.centro} accessibilityLiveRegion="assertive">
      <Text style={estilos.icone}>⚠️</Text>
      <Text style={[estilos.titulo, { color: cores.perigo }]}>Não deu para carregar</Text>
      <Text style={estilos.texto}>{mensagem}</Text>
      <Botao titulo="Tentar de novo" onPress={onTentarDeNovo} />
    </View>
  );
}

interface PropsVazio {
  titulo: string;
  mensagem: string;
  acao?: { titulo: string; onPress: () => void };
}

export function Vazio({ titulo, mensagem, acao }: PropsVazio) {
  return (
    <View style={estilos.centro}>
      <Text style={estilos.icone}>🌱</Text>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.texto}>{mensagem}</Text>
      {acao !== undefined ? <Botao titulo={acao.titulo} onPress={acao.onPress} /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: espaco.xl, gap: espaco.md },
  icone: { fontSize: 48 },
  titulo: { fontSize: fonte.grande, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  texto: { fontSize: fonte.normal, color: cores.textoSuave, textAlign: 'center', lineHeight: 24 },
});
