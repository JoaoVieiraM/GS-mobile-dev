/**
 * Decodificadores: transformam `unknown` (JSON da rede ou do armazenamento)
 * em tipos do domínio, com narrowing. Se o formato não bate, devolvem null.
 */
import {
  Alerta,
  Coordenada,
  DecisaoIrrigacao,
  ehCultura,
  LeituraSensor,
  OrigemLeitura,
  PrevisaoChuva,
  Produtor,
  SeveridadeAlerta,
  ZonaIrrigacao,
} from '../domain/models';

export type Decodificador<T> = (valor: unknown) => T | null;

type Objeto = Record<string, unknown>;

function ehObjeto(v: unknown): v is Objeto {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function texto(o: Objeto, k: string): string | null {
  const v = o[k];
  return typeof v === 'string' ? v : null;
}

function numero(o: Objeto, k: string): number | null {
  const v = o[k];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

const DECISOES: readonly DecisaoIrrigacao[] = ['IRRIGAR_AGORA', 'AGUARDAR_CHUVA', 'NAO_IRRIGAR', 'SEM_RECOMENDACAO'];
const SEVERIDADES: readonly SeveridadeAlerta[] = ['INFO', 'ATENCAO', 'CRITICO'];
const ORIGENS: readonly OrigemLeitura[] = ['SENSOR_ESP32', 'MANUAL'];

function daLista<T extends string>(lista: readonly T[], v: string | null): T | null {
  return lista.find((item) => item === v) ?? null;
}

export function decodificarLista<T>(decodificar: Decodificador<T>): Decodificador<T[]> {
  return (valor) => {
    if (!Array.isArray(valor)) return null;
    const saida: T[] = [];
    for (const item of valor) {
      const d = decodificar(item);
      if (d === null) return null;
      saida.push(d);
    }
    return saida;
  };
}

function decodificarCoordenada(v: unknown): Coordenada | null {
  if (!ehObjeto(v)) return null;
  const latitude = numero(v, 'latitude');
  const longitude = numero(v, 'longitude');
  return latitude === null || longitude === null ? null : { latitude, longitude };
}

function decodificarLeitura(v: unknown): LeituraSensor | null {
  if (!ehObjeto(v)) return null;
  const umidadeSoloPercentual = numero(v, 'umidadeSoloPercentual');
  const origem = daLista(ORIGENS, texto(v, 'origem'));
  const lidaEm = texto(v, 'lidaEm');
  if (umidadeSoloPercentual === null || origem === null || lidaEm === null) return null;
  return { umidadeSoloPercentual, origem, lidaEm };
}

function decodificarPrevisao(v: unknown): PrevisaoChuva | null {
  if (!ehObjeto(v)) return null;
  const probabilidadePercentual = numero(v, 'probabilidadePercentual');
  const milimetrosEsperados = numero(v, 'milimetrosEsperados');
  const horasAteChuva = numero(v, 'horasAteChuva');
  if (probabilidadePercentual === null || milimetrosEsperados === null) return null;
  return { probabilidadePercentual, milimetrosEsperados, horasAteChuva };
}

/** Campo opcional: null/ausente vira null; presente precisa decodificar. undefined = inválido. */
function opcional<T>(v: unknown, d: Decodificador<T>): T | null | undefined {
  if (v === null || v === undefined) return null;
  const r = d(v);
  return r === null ? undefined : r;
}

export const decodificarZona: Decodificador<ZonaIrrigacao> = (v) => {
  if (!ehObjeto(v)) return null;
  const id = texto(v, 'id');
  const nome = texto(v, 'nome');
  const culturaTexto = texto(v, 'cultura');
  const areaHectares = numero(v, 'areaHectares');
  const umidadeMinimaIdeal = numero(v, 'umidadeMinimaIdeal');
  const criadaEm = texto(v, 'criadaEm');
  const coordenada = opcional(v['coordenada'], decodificarCoordenada);
  const ultimaLeitura = opcional(v['ultimaLeitura'], decodificarLeitura);
  const previsao = opcional(v['previsao'], decodificarPrevisao);
  if (
    id === null ||
    nome === null ||
    culturaTexto === null ||
    !ehCultura(culturaTexto) ||
    areaHectares === null ||
    umidadeMinimaIdeal === null ||
    criadaEm === null ||
    coordenada === undefined ||
    ultimaLeitura === undefined ||
    previsao === undefined
  ) {
    return null;
  }
  return { id, nome, cultura: culturaTexto, areaHectares, umidadeMinimaIdeal, criadaEm, coordenada, ultimaLeitura, previsao };
};

export const decodificarAlerta: Decodificador<Alerta> = (v) => {
  if (!ehObjeto(v)) return null;
  const id = texto(v, 'id');
  const zonaId = texto(v, 'zonaId');
  const zonaNome = texto(v, 'zonaNome');
  const severidade = daLista(SEVERIDADES, texto(v, 'severidade'));
  const decisao = daLista(DECISOES, texto(v, 'decisao'));
  const titulo = texto(v, 'titulo');
  const mensagem = texto(v, 'mensagem');
  const criadoEm = texto(v, 'criadoEm');
  if (
    id === null ||
    zonaId === null ||
    zonaNome === null ||
    severidade === null ||
    decisao === null ||
    titulo === null ||
    mensagem === null ||
    criadoEm === null
  ) {
    return null;
  }
  return { id, zonaId, zonaNome, severidade, decisao, titulo, mensagem, criadoEm };
};

export const decodificarProdutor: Decodificador<Produtor> = (v) => {
  if (!ehObjeto(v)) return null;
  const nome = texto(v, 'nome');
  const municipio = texto(v, 'municipio');
  const bairroOuComunidade = texto(v, 'bairroOuComunidade');
  const identificadoEm = texto(v, 'identificadoEm');
  if (nome === null || municipio === null || bairroOuComunidade === null || identificadoEm === null) return null;
  return { nome, municipio, bairroOuComunidade, identificadoEm };
};

export const decodificarBooleano: Decodificador<boolean> = (v) => (typeof v === 'boolean' ? v : null);

export const decodificarTexto: Decodificador<string> = (v) => (typeof v === 'string' ? v : null);
