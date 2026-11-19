/**
 * Serviço de zonas. Uma interface, duas implementações:
 *  - local: AsyncStorage + latência simulada (PADRÃO — funciona sempre no Expo Go);
 *  - http: API REST da equipe (disciplina de SOA), URL em app.json > expo.extra.apiUrl.
 * As telas só conhecem as funções exportadas no final deste arquivo.
 */
import { NovaZona, ZonaIrrigacao } from '../domain/models';
import { ler, salvar } from './armazenamento';
import { obterFonteDados, obterSimularFalha, urlDaApi } from './configuracaoService';
import { decodificarLista, decodificarZona } from './decodificadores';
import { requisitar } from './http';
import { erro, ok, ResultadoServico } from './resultadoServico';
import { simularLeitura, simularPrevisao, ZONAS_INICIAIS } from './seed';

export interface RepositorioZonas {
  listar(): Promise<ResultadoServico<ZonaIrrigacao[]>>;
  buscar(id: string): Promise<ResultadoServico<ZonaIrrigacao>>;
  criar(nova: NovaZona): Promise<ResultadoServico<ZonaIrrigacao>>;
}

const LATENCIA_MS = 900;
const esperar = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
const decodificarZonas = decodificarLista(decodificarZona);

function gerarId(): string {
  return `zona-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/* ---------- Implementação local (AsyncStorage) ---------- */

async function lerZonasLocais(): Promise<ResultadoServico<ZonaIrrigacao[]>> {
  const r = await ler('@gota/zonas', decodificarZonas);
  if (!r.ok) return r;
  if (r.dados === null) {
    // primeira abertura: grava os dados simulados
    const inicial = [...ZONAS_INICIAIS];
    await salvar('@gota/zonas', inicial);
    return ok(inicial);
  }
  return ok(r.dados);
}

export const repositorioLocal: RepositorioZonas = {
  async listar() {
    await esperar(LATENCIA_MS);
    return lerZonasLocais();
  },

  async buscar(id) {
    await esperar(LATENCIA_MS / 2);
    const r = await lerZonasLocais();
    if (!r.ok) return r;
    const zona = r.dados.find((z) => z.id === id);
    return zona === undefined ? erro('NAO_ENCONTRADO', 'Essa zona não existe mais.') : ok(zona);
  },

  async criar(nova) {
    await esperar(LATENCIA_MS);
    const r = await lerZonasLocais();
    if (!r.ok) return r;
    const id = gerarId();
    const zona: ZonaIrrigacao = {
      ...nova,
      id,
      ultimaLeitura: simularLeitura(id, nova.umidadeMinimaIdeal),
      previsao: simularPrevisao(id, nova.coordenada !== null),
      criadaEm: new Date().toISOString(),
    };
    const gravado = await salvar('@gota/zonas', [zona, ...r.dados]);
    return gravado.ok ? ok(zona) : gravado;
  },
};

/* ---------- Implementação HTTP (API da equipe) ---------- */

export const repositorioHttp: RepositorioZonas = {
  listar() {
    return requisitar(`${urlDaApi()}/zonas`, decodificarZonas);
  },
  buscar(id) {
    return requisitar(`${urlDaApi()}/zonas/${encodeURIComponent(id)}`, decodificarZona);
  },
  criar(nova) {
    return requisitar(`${urlDaApi()}/zonas`, decodificarZona, { metodo: 'POST', corpo: nova });
  },
};

/* ---------- Fachada usada pelas telas ---------- */

async function repositorio(): Promise<RepositorioZonas> {
  return (await obterFonteDados()) === 'http' ? repositorioHttp : repositorioLocal;
}

const FALHA_SIMULADA = 'Falha simulada para demonstração. Desligue em Perfil > "Simular falha".';

export async function listarZonas(): Promise<ResultadoServico<ZonaIrrigacao[]>> {
  if (await obterSimularFalha()) {
    await esperar(LATENCIA_MS);
    return erro('SIMULADO', FALHA_SIMULADA);
  }
  return (await repositorio()).listar();
}

export async function buscarZona(id: string): Promise<ResultadoServico<ZonaIrrigacao>> {
  return (await repositorio()).buscar(id);
}

export async function criarZona(nova: NovaZona): Promise<ResultadoServico<ZonaIrrigacao>> {
  return (await repositorio()).criar(nova);
}

/** Apaga as zonas do aparelho (o seed volta na próxima abertura). Útil para mostrar o estado vazio. */
export async function esvaziarZonasLocais(): Promise<ResultadoServico<ZonaIrrigacao[]>> {
  return salvar('@gota/zonas', []);
}

export async function restaurarZonasDeExemplo(): Promise<ResultadoServico<ZonaIrrigacao[]>> {
  return salvar('@gota/zonas', [...ZONAS_INICIAIS]);
}
