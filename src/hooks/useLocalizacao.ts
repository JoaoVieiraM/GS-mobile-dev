/**
 * Localização com a permissão tratada em todos os estados:
 *  - NAO_SOLICITADA: ainda não perguntamos → botão pede a permissão;
 *  - CONCEDIDA: lê o GPS;
 *  - NEGADA: explica e libera a digitação manual (e, se o sistema não deixa
 *    perguntar de novo, oferece abrir as configurações).
 * A permissão negada NUNCA trava o cadastro.
 */
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { Coordenada } from '../domain/models';
import { mensagemDeErro } from '../services/resultadoServico';

export type EstadoPermissao =
  | { tipo: 'VERIFICANDO' }
  | { tipo: 'NAO_SOLICITADA' }
  | { tipo: 'CONCEDIDA' }
  | { tipo: 'NEGADA'; podePerguntarDeNovo: boolean };

export type ResultadoLocalizacao =
  | { ok: true; coordenada: Coordenada }
  | { ok: false; motivo: 'PERMISSAO_NEGADA' | 'GPS_INDISPONIVEL'; mensagem: string };

function paraEstado(r: Location.LocationPermissionResponse): EstadoPermissao {
  if (r.granted) return { tipo: 'CONCEDIDA' };
  if (r.status === Location.PermissionStatus.UNDETERMINED) return { tipo: 'NAO_SOLICITADA' };
  return { tipo: 'NEGADA', podePerguntarDeNovo: r.canAskAgain };
}

export function useLocalizacao() {
  const [permissao, setPermissao] = useState<EstadoPermissao>({ tipo: 'VERIFICANDO' });
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    Location.getForegroundPermissionsAsync()
      .then((r) => setPermissao(paraEstado(r)))
      .catch(() => setPermissao({ tipo: 'NAO_SOLICITADA' }));
  }, []);

  const obterLocalizacao = useCallback(async (): Promise<ResultadoLocalizacao> => {
    setBuscando(true);
    try {
      let resposta = await Location.getForegroundPermissionsAsync();
      if (!resposta.granted && resposta.canAskAgain) {
        resposta = await Location.requestForegroundPermissionsAsync();
      }
      const estado = paraEstado(resposta);
      setPermissao(estado);
      if (estado.tipo !== 'CONCEDIDA') {
        return {
          ok: false,
          motivo: 'PERMISSAO_NEGADA',
          mensagem: 'Sem permissão de localização. Sem problema: digite a latitude e a longitude abaixo.',
        };
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coordenada: Coordenada = {
        latitude: Math.round(pos.coords.latitude * 1e5) / 1e5,
        longitude: Math.round(pos.coords.longitude * 1e5) / 1e5,
      };
      return { ok: true, coordenada };
    } catch (e: unknown) {
      return {
        ok: false,
        motivo: 'GPS_INDISPONIVEL',
        mensagem: `Não foi possível achar sua posição (GPS desligado?). Digite as coordenadas. (${mensagemDeErro(e)})`,
      };
    } finally {
      setBuscando(false);
    }
  }, []);

  const abrirConfiguracoes = useCallback(() => {
    Linking.openSettings().catch(() => undefined);
  }, []);

  return { permissao, buscando, obterLocalizacao, abrirConfiguracoes };
}
