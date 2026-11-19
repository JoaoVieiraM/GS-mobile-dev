/** Perfil: identificação salva + controles de demonstração (simular falha, fonte de dados, estado vazio). */
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { FonteDados } from '../../src/domain/models';
import { useIdentidade } from '../../src/hooks/useIdentidade';
import {
  definirFonteDados,
  definirSimularFalha,
  obterFonteDados,
  obterSimularFalha,
  urlDaApi,
} from '../../src/services/configuracaoService';
import { esvaziarZonasLocais, restaurarZonasDeExemplo } from '../../src/services/zonaService';
import { Botao } from '../../src/ui/components/Botao';
import { Card } from '../../src/ui/components/Card';
import { Opcoes } from '../../src/ui/components/Opcoes';
import { cores, espaco, fonte } from '../../src/ui/theme';

const FONTES: readonly FonteDados[] = ['local', 'http'];
const ROTULO_FONTE: Record<FonteDados, string> = { local: 'Neste celular', http: 'Servidor da equipe' };

export default function Perfil() {
  const { estado, sair } = useIdentidade();
  const [simularFalha, setSimularFalha] = useState(false);
  const [fonte, setFonte] = useState<FonteDados>('local');
  const [aviso, setAviso] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      obterSimularFalha().then(setSimularFalha);
      obterFonteDados().then(setFonte);
    }, []),
  );

  async function alternarFalha(valor: boolean) {
    setSimularFalha(valor);
    await definirSimularFalha(valor);
    setAviso(valor ? 'Pronto: a lista de zonas vai mostrar o estado de erro.' : 'Falha simulada desligada.');
  }

  async function trocarFonte(f: FonteDados) {
    setFonte(f);
    await definirFonteDados(f);
    setAviso(f === 'http' ? `Usando a API em ${urlDaApi()}` : 'Usando os dados salvos neste celular.');
  }

  async function esvaziar() {
    await esvaziarZonasLocais();
    setAviso('Zonas apagadas: a lista vai mostrar o estado vazio.');
  }

  async function restaurar() {
    await restaurarZonasDeExemplo();
    setAviso('Zonas de exemplo restauradas.');
  }

  async function trocarUsuario() {
    await sair();
    router.replace('/identificacao');
  }

  return (
    <ScrollView contentContainerStyle={estilos.conteudo}>
      <Card>
        <Text style={estilos.secao}>Você</Text>
        {estado.tipo === 'identificado' ? (
          <>
            <Text style={estilos.nome}>{estado.produtor.nome}</Text>
            <Text style={estilos.texto}>
              {estado.produtor.bairroOuComunidade} · {estado.produtor.municipio}
            </Text>
            <Text style={estilos.texto}>
              Identificado em {new Date(estado.produtor.identificadoEm).toLocaleDateString('pt-BR')}
            </Text>
          </>
        ) : null}
        <Botao titulo="Sair e trocar de produtor" variante="secundario" onPress={trocarUsuario} />
      </Card>

      <Card>
        <Text style={estilos.secao}>Demonstração</Text>
        <View style={estilos.linha}>
          <Text style={[estilos.texto, estilos.flex]}>Simular falha ao carregar as zonas</Text>
          <Switch
            accessibilityLabel="Simular falha"
            value={simularFalha}
            onValueChange={alternarFalha}
            trackColor={{ true: cores.perigo, false: cores.borda }}
          />
        </View>
        <Opcoes
          rotulo="De onde vêm os dados"
          opcoes={FONTES}
          rotuloDe={(f) => ROTULO_FONTE[f]}
          selecionada={fonte}
          onSelecionar={trocarFonte}
        />
        <Botao titulo="Apagar zonas (mostrar lista vazia)" variante="perigo" onPress={esvaziar} />
        <Botao titulo="Restaurar zonas de exemplo" variante="secundario" onPress={restaurar} />
        {aviso !== null ? <Text style={estilos.aviso}>{aviso}</Text> : null}
      </Card>

      <Text style={estilos.rodape}>
        Gota Inteligente · Global Solution FIAP 2026.2{'\n'}Todos os dados deste app são simulados.
      </Text>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.md, paddingBottom: espaco.xl },
  secao: { fontSize: fonte.media, fontWeight: '800', color: cores.texto },
  nome: { fontSize: fonte.grande, fontWeight: '800', color: cores.primaria },
  texto: { fontSize: fonte.normal, color: cores.textoSuave },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, marginBottom: espaco.sm },
  flex: { flex: 1 },
  aviso: { fontSize: fonte.normal, color: cores.agua, fontWeight: '700' },
  rodape: { textAlign: 'center', color: cores.textoSuave, fontSize: fonte.pequena, marginTop: espaco.md },
});
