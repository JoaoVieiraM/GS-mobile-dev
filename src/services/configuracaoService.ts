/**
 * Configuração de demonstração: de onde vêm os dados (local ou API HTTP)
 * e se a lista deve simular falha. Valores padrão vêm do app.json (expo.extra).
 */
import Constants from 'expo-constants';
import { FonteDados } from '../domain/models';
import { ler, salvar } from './armazenamento';
import { decodificarBooleano, decodificarTexto } from './decodificadores';

function extra(chave: string): unknown {
  const ex: Record<string, unknown> | undefined = Constants.expoConfig?.extra;
  return ex?.[chave];
}

function ehFonte(v: unknown): v is FonteDados {
  return v === 'local' || v === 'http';
}

/** URL base da API da equipe (disciplina de SOA). Configure em app.json > expo.extra.apiUrl. */
export function urlDaApi(): string {
  const url = extra('apiUrl');
  return typeof url === 'string' ? url.replace(/\/+$/, '') : 'http://localhost:8080/api';
}

function fontePadrao(): FonteDados {
  const f = extra('fonteDados');
  return ehFonte(f) ? f : 'local';
}

export async function obterFonteDados(): Promise<FonteDados> {
  const r = await ler('@gota/fonteDados', decodificarTexto);
  if (r.ok && ehFonte(r.dados)) return r.dados;
  return fontePadrao();
}

export async function definirFonteDados(fonte: FonteDados): Promise<void> {
  await salvar('@gota/fonteDados', fonte);
}

export async function obterSimularFalha(): Promise<boolean> {
  const r = await ler('@gota/simularFalha', decodificarBooleano);
  return r.ok && r.dados === true;
}

export async function definirSimularFalha(ativo: boolean): Promise<void> {
  await salvar('@gota/simularFalha', ativo);
}
