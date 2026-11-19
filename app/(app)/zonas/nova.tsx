/** FORMULÁRIO validado que cria uma zona. A validação é pura (src/validation); a tela só mostra o resultado. */
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CULTURAS, CulturaAgricola, ehCultura, ROTULO_CULTURA } from '../../../src/domain/models';
import { useLocalizacao } from '../../../src/hooks/useLocalizacao';
import { criarZona } from '../../../src/services/zonaService';
import { Botao } from '../../../src/ui/components/Botao';
import { Campo } from '../../../src/ui/components/Campo';
import { Card } from '../../../src/ui/components/Card';
import { Opcoes } from '../../../src/ui/components/Opcoes';
import { cores, espaco, fonte } from '../../../src/ui/theme';
import { ErrosDeCampo } from '../../../src/validation/resultado';
import { CampoZona, EntradaZona, validarZona } from '../../../src/validation/zonaValidation';

const ENTRADA_INICIAL: EntradaZona = {
  nome: '',
  cultura: '',
  areaHectares: '',
  umidadeMinimaIdeal: '',
  latitude: '',
  longitude: '',
};

function SecaoLocalizacao({
  aoObter,
}: {
  aoObter: (lat: string, lon: string) => void;
}) {
  const { permissao, buscando, obterLocalizacao, abrirConfiguracoes } = useLocalizacao();
  const [aviso, setAviso] = useState<string | null>(null);

  async function usarMinhaLocalizacao() {
    setAviso(null);
    const r = await obterLocalizacao();
    if (r.ok) {
      aoObter(String(r.coordenada.latitude), String(r.coordenada.longitude));
      setAviso('Localização preenchida. Confira os números abaixo.');
    } else {
      setAviso(r.mensagem);
    }
  }

  let explicacao: string;
  switch (permissao.tipo) {
    case 'VERIFICANDO':
      explicacao = 'Verificando a permissão de localização…';
      break;
    case 'NAO_SOLICITADA':
      explicacao = 'Se você estiver na zona agora, o celular pode marcar o lugar. Vamos pedir sua permissão.';
      break;
    case 'CONCEDIDA':
      explicacao = 'Permissão dada. Toque no botão estando dentro da zona.';
      break;
    case 'NEGADA':
      explicacao = permissao.podePerguntarDeNovo
        ? 'Você não deu permissão de localização. Tudo bem: digite as coordenadas abaixo ou tente de novo.'
        : 'A localização está bloqueada para este app. Digite as coordenadas abaixo ou libere nas configurações do celular.';
      break;
  }

  const negadaDeVez = permissao.tipo === 'NEGADA' && !permissao.podePerguntarDeNovo;

  return (
    <Card>
      <Text style={estilos.secaoTitulo}>📍 Onde fica a zona? (opcional)</Text>
      <Text style={estilos.texto}>{explicacao}</Text>
      {negadaDeVez ? (
        <Botao titulo="Abrir configurações" variante="secundario" onPress={abrirConfiguracoes} />
      ) : (
        <Botao
          titulo="Usar minha localização"
          variante="secundario"
          onPress={usarMinhaLocalizacao}
          carregando={buscando}
          desabilitado={permissao.tipo === 'VERIFICANDO'}
        />
      )}
      {aviso !== null ? <Text style={estilos.aviso}>{aviso}</Text> : null}
      <Text style={estilos.texto}>Com o lugar marcado, a Gota consegue olhar a previsão de chuva dali.</Text>
    </Card>
  );
}

export default function NovaZona() {
  const [entrada, setEntrada] = useState<EntradaZona>(ENTRADA_INICIAL);
  const [erros, setErros] = useState<ErrosDeCampo<CampoZona>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const alterar = (campo: CampoZona) => (texto: string) => {
    setEntrada((e) => ({ ...e, [campo]: texto }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  async function salvar() {
    setErroGeral(null);
    const r = validarZona(entrada);
    if (!r.ok) {
      setErros(r.erros);
      setErroGeral('Confira os campos marcados em vermelho.');
      return;
    }
    setSalvando(true);
    const criada = await criarZona(r.valor);
    setSalvando(false);
    if (!criada.ok) {
      setErroGeral(criada.erro.mensagem);
      return;
    }
    router.replace({ pathname: '/zonas/[id]', params: { id: criada.dados.id } });
  }

  const culturaSelecionada: CulturaAgricola | null = ehCultura(entrada.cultura) ? entrada.cultura : null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Campo
          rotulo="Nome da zona"
          valor={entrada.nome}
          onChange={alterar('nome')}
          erro={erros.nome}
          placeholder="Ex.: Horta perto do açude"
        />
        <Opcoes
          rotulo="O que está plantado?"
          opcoes={CULTURAS}
          rotuloDe={(c) => ROTULO_CULTURA[c]}
          selecionada={culturaSelecionada}
          onSelecionar={alterar('cultura')}
          erro={erros.cultura}
        />
        <Campo
          rotulo="Tamanho (hectares)"
          valor={entrada.areaHectares}
          onChange={alterar('areaHectares')}
          erro={erros.areaHectares}
          placeholder="Ex.: 1,5"
          teclado="decimal-pad"
          dica="1 hectare é mais ou menos um campo de futebol."
        />
        <Campo
          rotulo="Umidade ideal da terra (%)"
          valor={entrada.umidadeMinimaIdeal}
          onChange={alterar('umidadeMinimaIdeal')}
          erro={erros.umidadeMinimaIdeal}
          placeholder="Ex.: 50"
          teclado="number-pad"
          dica="Abaixo desse número, a terra está pedindo água."
        />

        <SecaoLocalizacao
          aoObter={(lat, lon) => {
            setEntrada((e) => ({ ...e, latitude: lat, longitude: lon }));
            setErros((e) => ({ ...e, latitude: undefined, longitude: undefined }));
          }}
        />

        <View style={estilos.linha}>
          <View style={estilos.metade}>
            <Campo
              rotulo="Latitude"
              valor={entrada.latitude}
              onChange={alterar('latitude')}
              erro={erros.latitude}
              placeholder="-23,65"
              teclado="numbers-and-punctuation"
            />
          </View>
          <View style={estilos.metade}>
            <Campo
              rotulo="Longitude"
              valor={entrada.longitude}
              onChange={alterar('longitude')}
              erro={erros.longitude}
              placeholder="-47,22"
              teclado="numbers-and-punctuation"
            />
          </View>
        </View>

        {erroGeral !== null ? <Text style={estilos.erroGeral}>{erroGeral}</Text> : null}
        <Botao titulo="Salvar zona" onPress={salvar} carregando={salvando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, paddingBottom: espaco.xl },
  secaoTitulo: { fontSize: fonte.media, fontWeight: '800', color: cores.texto },
  texto: { fontSize: fonte.normal, color: cores.textoSuave, lineHeight: 24 },
  aviso: { fontSize: fonte.normal, color: cores.agua, fontWeight: '700' },
  linha: { flexDirection: 'row', gap: espaco.sm },
  metade: { flex: 1 },
  erroGeral: { color: cores.perigo, fontSize: fonte.normal, fontWeight: '700', marginBottom: espaco.sm },
});
