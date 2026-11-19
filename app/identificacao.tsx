/** Onboarding: o produtor se identifica uma vez e o app lembra ao reabrir. */
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIdentidade } from '../src/hooks/useIdentidade';
import { Botao } from '../src/ui/components/Botao';
import { Campo } from '../src/ui/components/Campo';
import { cores, espaco, fonte } from '../src/ui/theme';
import { ErrosDeCampo } from '../src/validation/resultado';
import { CampoIdentidade, EntradaIdentidade, validarIdentidade } from '../src/validation/identidadeValidation';

export default function Identificacao() {
  const { estado, identificar } = useIdentidade();
  const [entrada, setEntrada] = useState<EntradaIdentidade>({ nome: '', municipio: '', bairroOuComunidade: '' });
  const [erros, setErros] = useState<ErrosDeCampo<CampoIdentidade>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  if (estado.tipo === 'identificado') return <Redirect href="/zonas" />;

  const alterar = (campo: CampoIdentidade) => (texto: string) => {
    setEntrada((e) => ({ ...e, [campo]: texto }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  async function entrar() {
    const r = validarIdentidade(entrada);
    if (!r.ok) {
      setErros(r.erros);
      return;
    }
    setSalvando(true);
    const salvo = await identificar(r.valor);
    setSalvando(false);
    if (salvo.ok) router.replace('/zonas');
    else setErroGeral(salvo.erro.mensagem);
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={estilos.tela}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <Text style={estilos.gota}>💧</Text>
          <Text style={estilos.titulo}>Gota Inteligente</Text>
          <Text style={estilos.subtitulo}>
            Seu ajudante de irrigação. Ele olha a umidade da terra e a previsão de chuva e avisa a hora certa de regar.
          </Text>

          <Campo rotulo="Seu nome" valor={entrada.nome} onChange={alterar('nome')} erro={erros.nome} placeholder="Ex.: Seu Zé" />
          <Campo
            rotulo="Município"
            valor={entrada.municipio}
            onChange={alterar('municipio')}
            erro={erros.municipio}
            placeholder="Ex.: Ibiúna"
          />
          <Campo
            rotulo="Bairro, sítio ou comunidade"
            valor={entrada.bairroOuComunidade}
            onChange={alterar('bairroOuComunidade')}
            erro={erros.bairroOuComunidade}
            placeholder="Ex.: Bairro do Paruru"
          />

          {erroGeral !== null ? <Text style={estilos.erro}>{erroGeral}</Text> : null}
          <Botao titulo="Entrar" onPress={entrar} carregando={salvando} />
          <Text style={estilos.nota}>Seus dados ficam só neste celular. Este app usa dados simulados.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, paddingTop: espaco.xl },
  gota: { fontSize: 56, textAlign: 'center' },
  titulo: { fontSize: fonte.titulo, fontWeight: '800', color: cores.primaria, textAlign: 'center' },
  subtitulo: {
    fontSize: fonte.normal,
    color: cores.textoSuave,
    textAlign: 'center',
    marginVertical: espaco.lg,
    lineHeight: 24,
  },
  erro: { color: cores.perigo, fontSize: fonte.normal, marginBottom: espaco.sm },
  nota: { fontSize: fonte.pequena, color: cores.textoSuave, textAlign: 'center', marginTop: espaco.md },
});
