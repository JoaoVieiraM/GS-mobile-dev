/** DETALHE da zona com a recomendação do motor (espelho da IA). */
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ROTULO_CULTURA, ROTULO_STATUS, statusDaZona, ZonaIrrigacao } from '../../../src/domain/models';
import { useRecursoAssincrono } from '../../../src/hooks/useRecursoAssincrono';
import { recomendar, ROTULO_DECISAO } from '../../../src/services/motorRecomendacao';
import { buscarZona } from '../../../src/services/zonaService';
import { Badge } from '../../../src/ui/components/Badge';
import { Card } from '../../../src/ui/components/Card';
import { Carregando, Erro } from '../../../src/ui/components/EstadoLista';
import { corDaDecisao, corDoStatus, cores, espaco, fonte } from '../../../src/ui/theme';

const nuncaVazio = (): boolean => false;

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.linha}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

function Detalhe({ zona }: { zona: ZonaIrrigacao }) {
  const status = statusDaZona(zona);
  const rec = recomendar({
    umidadeSolo: zona.ultimaLeitura?.umidadeSoloPercentual ?? null,
    umidadeMinimaIdeal: zona.umidadeMinimaIdeal,
    previsao: zona.previsao,
    areaHectares: zona.areaHectares,
  });
  const corRec = corDaDecisao[rec.decisao];

  return (
    <ScrollView contentContainerStyle={estilos.conteudo}>
      <Stack.Screen options={{ title: zona.nome }} />

      <View style={[estilos.recomendacao, { backgroundColor: corRec.fundo, borderColor: corRec.texto }]}>
        <Text style={[estilos.recTitulo, { color: corRec.texto }]}>{ROTULO_DECISAO[rec.decisao]}</Text>
        <Text style={estilos.recTexto}>{rec.justificativa}</Text>
        {rec.litrosEconomizados > 0 ? (
          <Text style={[estilos.economia, { color: corRec.texto }]}>
            💧 {rec.litrosEconomizados.toLocaleString('pt-BR')} litros e ⚡ {rec.kwhEconomizados.toLocaleString('pt-BR')}{' '}
            kWh economizados neste ciclo
          </Text>
        ) : null}
      </View>

      <Card>
        <View style={estilos.cab}>
          <Text style={estilos.secao}>Terra</Text>
          <Badge texto={ROTULO_STATUS[status]} cor={corDoStatus[status]} />
        </View>
        <Linha
          rotulo="Umidade agora"
          valor={zona.ultimaLeitura === null ? 'Sem leitura' : `${zona.ultimaLeitura.umidadeSoloPercentual}%`}
        />
        <Linha rotulo="Umidade ideal" valor={`${zona.umidadeMinimaIdeal}%`} />
        <Linha
          rotulo="Quem mediu"
          valor={
            zona.ultimaLeitura === null
              ? '—'
              : zona.ultimaLeitura.origem === 'SENSOR_ESP32'
                ? 'Sensor no campo'
                : 'Anotado à mão'
          }
        />
        {zona.ultimaLeitura !== null ? (
          <Linha rotulo="Quando" valor={new Date(zona.ultimaLeitura.lidaEm).toLocaleString('pt-BR')} />
        ) : null}
      </Card>

      <Card>
        <Text style={estilos.secao}>Previsão de chuva</Text>
        {zona.previsao === null ? (
          <Text style={estilos.rotulo}>Sem previsão: falta marcar onde fica a zona.</Text>
        ) : (
          <>
            <Linha rotulo="Chance de chover" valor={`${zona.previsao.probabilidadePercentual}%`} />
            <Linha
              rotulo="Em quanto tempo"
              valor={zona.previsao.horasAteChuva === null ? 'Sem chuva à vista' : `${zona.previsao.horasAteChuva} h`}
            />
            <Linha rotulo="Quantidade" valor={`${zona.previsao.milimetrosEsperados} mm`} />
          </>
        )}
      </Card>

      <Card>
        <Text style={estilos.secao}>Sobre a zona</Text>
        <Linha rotulo="Cultura" valor={ROTULO_CULTURA[zona.cultura]} />
        <Linha rotulo="Tamanho" valor={`${zona.areaHectares.toLocaleString('pt-BR')} ha`} />
        <Linha
          rotulo="Local"
          valor={
            zona.coordenada === null
              ? 'Não informado'
              : `${zona.coordenada.latitude.toFixed(4)}, ${zona.coordenada.longitude.toFixed(4)}`
          }
        />
      </Card>
    </ScrollView>
  );
}

export default function DetalheZona() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const carregar = useCallback(() => buscarZona(typeof id === 'string' ? id : ''), [id]);
  const { estado, recarregar } = useRecursoAssincrono(carregar, nuncaVazio);

  switch (estado.tipo) {
    case 'carregando':
      return <Carregando mensagem="Abrindo a zona…" />;
    case 'erro':
      return <Erro mensagem={estado.mensagem} onTentarDeNovo={recarregar} />;
    case 'vazio':
      return <Erro mensagem="Zona não encontrada." onTentarDeNovo={recarregar} />;
    case 'pronto':
      return <Detalhe zona={estado.dados} />;
  }
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.md, paddingBottom: espaco.xl },
  recomendacao: { borderWidth: 2, borderRadius: 16, padding: espaco.md, marginBottom: espaco.md, gap: espaco.sm },
  recTitulo: { fontSize: fonte.titulo, fontWeight: '900' },
  recTexto: { fontSize: fonte.media, color: cores.texto, lineHeight: 28 },
  economia: { fontSize: fonte.normal, fontWeight: '800' },
  cab: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  secao: { fontSize: fonte.media, fontWeight: '800', color: cores.texto },
  linha: { flexDirection: 'row', justifyContent: 'space-between', gap: espaco.md, paddingVertical: 2 },
  rotulo: { fontSize: fonte.normal, color: cores.textoSuave, flexShrink: 1 },
  valor: { fontSize: fonte.normal, color: cores.texto, fontWeight: '700', textAlign: 'right', flexShrink: 1 },
});
