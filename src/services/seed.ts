/**
 * Dados SIMULADOS para demonstração. Nenhum dado pessoal real.
 * As leituras imitam o que chegaria do ESP32 (disciplina de IoT) e a previsão
 * imita o que a IA usaria de um serviço meteorológico.
 */
import { LeituraSensor, PrevisaoChuva, ZonaIrrigacao } from '../domain/models';

function horasAtras(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

export const ZONAS_INICIAIS: readonly ZonaIrrigacao[] = [
  {
    id: 'zona-horta',
    nome: 'Horta da baixada',
    cultura: 'HORTALICAS',
    areaHectares: 0.5,
    umidadeMinimaIdeal: 60,
    coordenada: { latitude: -23.6512, longitude: -47.2264 },
    ultimaLeitura: { umidadeSoloPercentual: 38, origem: 'SENSOR_ESP32', lidaEm: horasAtras(0.3) },
    previsao: { probabilidadePercentual: 90, horasAteChuva: 2, milimetrosEsperados: 12 },
    criadaEm: horasAtras(240),
  },
  {
    id: 'zona-milho',
    nome: 'Roça de milho',
    cultura: 'MILHO',
    areaHectares: 2,
    umidadeMinimaIdeal: 45,
    coordenada: { latitude: -23.6549, longitude: -47.2311 },
    ultimaLeitura: { umidadeSoloPercentual: 28, origem: 'SENSOR_ESP32', lidaEm: horasAtras(0.5) },
    previsao: { probabilidadePercentual: 15, horasAteChuva: null, milimetrosEsperados: 0 },
    criadaEm: horasAtras(200),
  },
  {
    id: 'zona-feijao',
    nome: 'Feijão do morro',
    cultura: 'FEIJAO',
    areaHectares: 1.2,
    umidadeMinimaIdeal: 50,
    coordenada: null,
    ultimaLeitura: { umidadeSoloPercentual: 63, origem: 'MANUAL', lidaEm: horasAtras(3) },
    previsao: { probabilidadePercentual: 40, horasAteChuva: 10, milimetrosEsperados: 3 },
    criadaEm: horasAtras(100),
  },
];

/** Gerador determinístico a partir de um texto (para a mesma zona dar sempre a mesma simulação). */
function pseudoAleatorio(semente: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < semente.length; i++) {
    h ^= semente.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Simula a primeira leitura do sensor ESP32 de uma zona recém-cadastrada. */
export function simularLeitura(semente: string, umidadeMinima: number): LeituraSensor {
  const r = pseudoAleatorio(semente);
  const variacao = Math.round(r() * 40 - 25); // entre -25 e +15 em torno do ideal
  const umidade = Math.min(100, Math.max(5, umidadeMinima + variacao));
  return { umidadeSoloPercentual: umidade, origem: 'SENSOR_ESP32', lidaEm: new Date().toISOString() };
}

/** Simula a previsão de chuva para uma coordenada. Sem coordenada, não há previsão. */
export function simularPrevisao(semente: string, temCoordenada: boolean): PrevisaoChuva | null {
  if (!temCoordenada) return null;
  const r = pseudoAleatorio(semente + ':clima');
  const chance = Math.round(r() * 100);
  const vaiChover = chance >= 50;
  return {
    probabilidadePercentual: chance,
    horasAteChuva: vaiChover ? 1 + Math.floor(r() * 8) : null,
    milimetrosEsperados: vaiChover ? Math.round(r() * 20) : 0,
  };
}
