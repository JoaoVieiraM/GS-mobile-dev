/** Resultado discriminado de uma validação: ou deu certo com um valor, ou falhou com erros por campo. */
export type ErrosDeCampo<C extends string> = Partial<Record<C, string>>;

export type Resultado<T, C extends string = string> =
  | { ok: true; valor: T }
  | { ok: false; erros: ErrosDeCampo<C> };

export function sucesso<T>(valor: T): { ok: true; valor: T } {
  return { ok: true, valor };
}

export function falha<C extends string>(erros: ErrosDeCampo<C>): { ok: false; erros: ErrosDeCampo<C> } {
  return { ok: false, erros };
}

/** Converte texto digitado ("1,5" ou "1.5") em número. Devolve null se não for número. */
export function lerNumero(texto: string): number | null {
  const limpo = texto.trim().replace(',', '.');
  if (limpo === '') return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}
