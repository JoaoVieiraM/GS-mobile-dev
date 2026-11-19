/**
 * Contexto de identidade do produtor. Carrega do AsyncStorage ao abrir o app,
 * por isso quem já se identificou cai direto na home.
 */
import { createContext, createElement, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Produtor } from '../domain/models';
import { carregarProdutor, esquecerProdutor, salvarProdutor } from '../services/identidadeService';
import { ResultadoServico } from '../services/resultadoServico';
import { IdentidadeValida } from '../validation/identidadeValidation';

export type EstadoIdentidade =
  | { tipo: 'carregando' }
  | { tipo: 'anonimo' }
  | { tipo: 'identificado'; produtor: Produtor };

interface ContextoIdentidade {
  estado: EstadoIdentidade;
  identificar: (dados: IdentidadeValida) => Promise<ResultadoServico<Produtor>>;
  sair: () => Promise<void>;
}

const Contexto = createContext<ContextoIdentidade | null>(null);

export function ProvedorIdentidade({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoIdentidade>({ tipo: 'carregando' });

  useEffect(() => {
    carregarProdutor().then((r) => {
      setEstado(r.ok && r.dados !== null ? { tipo: 'identificado', produtor: r.dados } : { tipo: 'anonimo' });
    });
  }, []);

  const identificar = useCallback(async (dados: IdentidadeValida) => {
    const r = await salvarProdutor(dados);
    if (r.ok) setEstado({ tipo: 'identificado', produtor: r.dados });
    return r;
  }, []);

  const sair = useCallback(async () => {
    await esquecerProdutor();
    setEstado({ tipo: 'anonimo' });
  }, []);

  const valor = useMemo(() => ({ estado, identificar, sair }), [estado, identificar, sair]);
  return createElement(Contexto.Provider, { value: valor }, children);
}

export function useIdentidade(): ContextoIdentidade {
  const ctx = useContext(Contexto);
  if (ctx === null) throw new Error('useIdentidade precisa estar dentro de <ProvedorIdentidade>.');
  return ctx;
}
