/**
 * Modelo de domínio da Gota Inteligente.
 * Todos os "tipos fechados" são unions de string literal (nada de enum ou string solta).
 */

export const CULTURAS = ['MILHO', 'FEIJAO', 'HORTALICAS', 'CAFE', 'MANDIOCA', 'FRUTAS'] as const;
export type CulturaAgricola = (typeof CULTURAS)[number];

export type StatusZona = 'SOLO_OK' | 'ATENCAO' | 'ESTRESSE_HIDRICO' | 'SEM_LEITURA';

export type DecisaoIrrigacao = 'IRRIGAR_AGORA' | 'AGUARDAR_CHUVA' | 'NAO_IRRIGAR' | 'SEM_RECOMENDACAO';

export type SeveridadeAlerta = 'INFO' | 'ATENCAO' | 'CRITICO';

export type OrigemLeitura = 'SENSOR_ESP32' | 'MANUAL';

export type FonteDados = 'local' | 'http';

export interface Coordenada {
  latitude: number;
  longitude: number;
}

export interface Produtor {
  nome: string;
  municipio: string;
  bairroOuComunidade: string;
  identificadoEm: string; // ISO 8601
}

export interface LeituraSensor {
  umidadeSoloPercentual: number;
  origem: OrigemLeitura;
  lidaEm: string;
}

export interface PrevisaoChuva {
  probabilidadePercentual: number;
  horasAteChuva: number | null;
  milimetrosEsperados: number;
}

export interface Recomendacao {
  decisao: DecisaoIrrigacao;
  justificativa: string;
  litrosEconomizados: number;
  kwhEconomizados: number;
}

export interface ZonaIrrigacao {
  id: string;
  nome: string;
  cultura: CulturaAgricola;
  areaHectares: number;
  umidadeMinimaIdeal: number;
  coordenada: Coordenada | null;
  ultimaLeitura: LeituraSensor | null;
  previsao: PrevisaoChuva | null;
  criadaEm: string;
}

export interface Alerta {
  id: string;
  zonaId: string;
  zonaNome: string;
  severidade: SeveridadeAlerta;
  decisao: DecisaoIrrigacao;
  titulo: string;
  mensagem: string;
  criadoEm: string;
}

/** Dados do formulário já validados, prontos para virar uma zona. */
export interface NovaZona {
  nome: string;
  cultura: CulturaAgricola;
  areaHectares: number;
  umidadeMinimaIdeal: number;
  coordenada: Coordenada | null;
}

export const ROTULO_CULTURA: Record<CulturaAgricola, string> = {
  MILHO: 'Milho',
  FEIJAO: 'Feijão',
  HORTALICAS: 'Hortaliças',
  CAFE: 'Café',
  MANDIOCA: 'Mandioca',
  FRUTAS: 'Frutas',
};

export const ROTULO_STATUS: Record<StatusZona, string> = {
  SOLO_OK: 'Solo bom',
  ATENCAO: 'Atenção',
  ESTRESSE_HIDRICO: 'Solo seco',
  SEM_LEITURA: 'Sem leitura',
};

export function ehCultura(valor: string): valor is CulturaAgricola {
  return (CULTURAS as readonly string[]).includes(valor);
}

export function statusDaZona(zona: ZonaIrrigacao): StatusZona {
  if (zona.ultimaLeitura === null) return 'SEM_LEITURA';
  const umidade = zona.ultimaLeitura.umidadeSoloPercentual;
  if (umidade >= zona.umidadeMinimaIdeal) return 'SOLO_OK';
  if (umidade >= zona.umidadeMinimaIdeal - 10) return 'ATENCAO';
  return 'ESTRESSE_HIDRICO';
}
