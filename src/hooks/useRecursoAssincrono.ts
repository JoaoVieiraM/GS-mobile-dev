/**
 * Máquina de estados de uma lista/recurso assíncrono.
 * Quatro estados distintos, cada um com UI própria: carregando, erro, vazio e pronto.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ResultadoServico } from '../services/resultadoServico';

export type EstadoRecurso<T> =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'vazio' }
  | { tipo: 'pronto'; dados: T };

export interface RecursoAssincrono<T> {
  estado: EstadoRecurso<T>;
  recarregar: () => void;
}

export function useRecursoAssincrono<T>(
  carregar: () => Promise<ResultadoServico<T>>,
  estaVazio: (dados: T) => boolean,
): RecursoAssincrono<T> {
  const [estado, setEstado] = useState<EstadoRecurso<T>>({ tipo: 'carregando' });
  const [versao, setVersao] = useState(0);
  const carregarRef = useRef(carregar);
  const vazioRef = useRef(estaVazio);
  carregarRef.current = carregar;
  vazioRef.current = estaVazio;

  useEffect(() => {
    let ativo = true;
    setEstado({ tipo: 'carregando' });
    carregarRef.current().then((r) => {
      if (!ativo) return;
      if (!r.ok) setEstado({ tipo: 'erro', mensagem: r.erro.mensagem });
      else if (vazioRef.current(r.dados)) setEstado({ tipo: 'vazio' });
      else setEstado({ tipo: 'pronto', dados: r.dados });
    });
    return () => {
      ativo = false;
    };
  }, [versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);
  return { estado, recarregar };
}
