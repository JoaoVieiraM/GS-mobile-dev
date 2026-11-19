/** Alertas que vêm da IA: "bomba desligada devido à previsão de chuva", etc. */
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { Alerta } from '../../src/domain/models';
import { useRecursoAssincrono } from '../../src/hooks/useRecursoAssincrono';
import { listarAlertas } from '../../src/services/alertaService';
import { Badge } from '../../src/ui/components/Badge';
import { Card } from '../../src/ui/components/Card';
import { Carregando, Erro, Vazio } from '../../src/ui/components/EstadoLista';
import { corDaSeveridade, cores, espaco, fonte } from '../../src/ui/theme';

const ROTULO_SEVERIDADE: Record<Alerta['severidade'], string> = {
  CRITICO: 'Urgente',
  ATENCAO: 'Atenção',
  INFO: 'Tudo certo',
};

const semAlertas = (a: Alerta[]): boolean => a.length === 0;

export default function Alertas() {
  const { estado, recarregar } = useRecursoAssincrono(listarAlertas, semAlertas);
  useFocusEffect(useCallback(() => recarregar(), [recarregar]));

  switch (estado.tipo) {
    case 'carregando':
      return <Carregando mensagem="Conferindo os avisos da Gota…" />;
    case 'erro':
      return <Erro mensagem={estado.mensagem} onTentarDeNovo={recarregar} />;
    case 'vazio':
      return <Vazio titulo="Nenhum aviso" mensagem="Quando você cadastrar zonas, os avisos de irrigação aparecem aqui." />;
    case 'pronto':
      return (
        <FlatList
          data={estado.dados}
          keyExtractor={(a) => a.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <Card
              rotuloAcessivel={`${item.titulo}. ${item.zonaNome}`}
              onPress={() => router.push({ pathname: '/zonas/[id]', params: { id: item.zonaId } })}
            >
              <Badge texto={ROTULO_SEVERIDADE[item.severidade]} cor={corDaSeveridade[item.severidade]} />
              <Text style={estilos.titulo}>{item.titulo}</Text>
              <Text style={estilos.zona}>{item.zonaNome}</Text>
              <Text style={estilos.msg}>{item.mensagem}</Text>
            </Card>
          )}
        />
      );
  }
}

const estilos = StyleSheet.create({
  lista: { padding: espaco.md },
  titulo: { fontSize: fonte.media, fontWeight: '800', color: cores.texto },
  zona: { fontSize: fonte.normal, fontWeight: '700', color: cores.primaria },
  msg: { fontSize: fonte.normal, color: cores.textoSuave, lineHeight: 24 },
});
