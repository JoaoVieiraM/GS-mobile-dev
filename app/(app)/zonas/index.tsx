/** LISTA de zonas com os quatro estados: carregando, erro, vazio e pronto. */
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ROTULO_CULTURA, ROTULO_STATUS, statusDaZona, ZonaIrrigacao } from '../../../src/domain/models';
import { useIdentidade } from '../../../src/hooks/useIdentidade';
import { useRecursoAssincrono } from '../../../src/hooks/useRecursoAssincrono';
import { listarZonas } from '../../../src/services/zonaService';
import { Badge } from '../../../src/ui/components/Badge';
import { Botao } from '../../../src/ui/components/Botao';
import { Card } from '../../../src/ui/components/Card';
import { Carregando, Erro, Vazio } from '../../../src/ui/components/EstadoLista';
import { corDoStatus, cores, espaco, fonte } from '../../../src/ui/theme';

const estaVazia = (zonas: ZonaIrrigacao[]): boolean => zonas.length === 0;

function ItemZona({ zona }: { zona: ZonaIrrigacao }) {
  const status = statusDaZona(zona);
  const umidade = zona.ultimaLeitura?.umidadeSoloPercentual;
  return (
    <Card
      rotuloAcessivel={`Abrir ${zona.nome}`}
      onPress={() => router.push({ pathname: '/zonas/[id]', params: { id: zona.id } })}
    >
      <View style={estilos.linha}>
        <Text style={estilos.nome}>{zona.nome}</Text>
        <Badge texto={ROTULO_STATUS[status]} cor={corDoStatus[status]} />
      </View>
      <Text style={estilos.info}>
        {ROTULO_CULTURA[zona.cultura]} · {zona.areaHectares.toLocaleString('pt-BR')} ha
      </Text>
      <Text style={estilos.info}>
        Umidade da terra: <Text style={estilos.destaque}>{umidade === undefined ? '—' : `${umidade}%`}</Text> (ideal{' '}
        {zona.umidadeMinimaIdeal}%)
      </Text>
    </Card>
  );
}

export default function ListaZonas() {
  const { estado: identidade } = useIdentidade();
  const { estado, recarregar } = useRecursoAssincrono(listarZonas, estaVazia);

  // recarrega sempre que a tela volta ao foco (ex.: depois de cadastrar uma zona)
  useFocusEffect(useCallback(() => recarregar(), [recarregar]));

  const nome = identidade.tipo === 'identificado' ? identidade.produtor.nome : '';
  const novaZona = () => router.push('/zonas/nova');

  switch (estado.tipo) {
    case 'carregando':
      return <Carregando mensagem="Buscando suas zonas de irrigação…" />;
    case 'erro':
      return <Erro mensagem={estado.mensagem} onTentarDeNovo={recarregar} />;
    case 'vazio':
      return (
        <Vazio
          titulo="Nenhuma zona cadastrada"
          mensagem="Cadastre o primeiro pedaço da sua roça para receber os avisos de quando regar."
          acao={{ titulo: 'Cadastrar zona', onPress: novaZona }}
        />
      );
    case 'pronto':
      return (
        <FlatList
          data={estado.dados}
          keyExtractor={(z) => z.id}
          contentContainerStyle={estilos.lista}
          ListHeaderComponent={
            <View style={estilos.cabecalho}>
              <Text style={estilos.ola}>Olá, {nome}!</Text>
              <Text style={estilos.info}>Toque numa zona para ver se é hora de regar.</Text>
              <Botao titulo="+ Cadastrar zona" onPress={novaZona} />
            </View>
          }
          renderItem={({ item }) => <ItemZona zona={item} />}
        />
      );
  }
}

const estilos = StyleSheet.create({
  lista: { padding: espaco.md },
  cabecalho: { marginBottom: espaco.md, gap: espaco.xs },
  ola: { fontSize: fonte.grande, fontWeight: '800', color: cores.texto },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: espaco.sm },
  nome: { fontSize: fonte.media, fontWeight: '800', color: cores.texto, flexShrink: 1 },
  info: { fontSize: fonte.normal, color: cores.textoSuave },
  destaque: { fontWeight: '800', color: cores.texto },
});
