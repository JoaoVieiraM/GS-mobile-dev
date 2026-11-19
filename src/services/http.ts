/**
 * Wrapper de fetch com resposta tipada. O corpo chega como `unknown` e só vira
 * tipo do domínio depois de passar pelo decodificador.
 */
import { Decodificador } from './decodificadores';
import { erro, mensagemDeErro, ok, ResultadoServico } from './resultadoServico';

export type MetodoHttp = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface OpcoesRequisicao {
  metodo?: MetodoHttp;
  corpo?: unknown;
  tempoLimiteMs?: number;
}

export async function requisitar<T>(
  url: string,
  decodificar: Decodificador<T>,
  opcoes: OpcoesRequisicao = {},
): Promise<ResultadoServico<T>> {
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), opcoes.tempoLimiteMs ?? 8000);

  try {
    const init: RequestInit = {
      method: opcoes.metodo ?? 'GET',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: controle.signal,
    };
    if (opcoes.corpo !== undefined) init.body = JSON.stringify(opcoes.corpo);

    const resposta = await fetch(url, init);

    if (resposta.status === 404) return erro('NAO_ENCONTRADO', 'Não encontramos esse item no servidor.');
    if (!resposta.ok) return erro('HTTP', `O servidor respondeu com erro (${resposta.status}).`);

    const json: unknown = await resposta.json();
    const dados = decodificar(json);
    if (dados === null) return erro('FORMATO', 'O servidor mandou dados num formato inesperado.');
    return ok(dados);
  } catch (e: unknown) {
    const msg = mensagemDeErro(e);
    return erro('REDE', `Sem conexão com o servidor. (${msg})`);
  } finally {
    clearTimeout(timer);
  }
}
