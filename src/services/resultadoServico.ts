/**
 * Toda resposta de serviço é uma union discriminada: o chamador é obrigado
 * a tratar o caso de erro (não existe exceção solta subindo para a tela).
 */
export type TipoErroServico = 'REDE' | 'HTTP' | 'FORMATO' | 'NAO_ENCONTRADO' | 'SIMULADO' | 'ARMAZENAMENTO';

export interface ErroServico {
  tipo: TipoErroServico;
  mensagem: string;
}

export type ResultadoServico<T> = { ok: true; dados: T } | { ok: false; erro: ErroServico };

export function ok<T>(dados: T): ResultadoServico<T> {
  return { ok: true, dados };
}

export function erro<T>(tipo: TipoErroServico, mensagem: string): ResultadoServico<T> {
  return { ok: false, erro: { tipo, mensagem } };
}

/** Extrai uma mensagem de um valor desconhecido vindo de um catch. */
export function mensagemDeErro(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'Erro desconhecido';
}
