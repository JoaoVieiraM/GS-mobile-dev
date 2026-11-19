/**
 * Motor de recomendação — espelho local da decisão do modelo de IA/ML da equipe.
 * Função pura: mesma entrada, mesma saída. Sem React, sem I/O.
 *
 * Regra:
 *  - sem leitura do sensor ou sem previsão → SEM_RECOMENDACAO
 *  - solo acima do mínimo ideal            → NAO_IRRIGAR (economiza a rega inteira)
 *  - solo seco + chuva provável e próxima  → AGUARDAR_CHUVA (bomba desligada)
 *  - solo seco sem chuva à vista           → IRRIGAR_AGORA (só a quantidade necessária)
 */
import { DecisaoIrrigacao, PrevisaoChuva, Recomendacao } from '../domain/models';

/** Lâmina que o produtor costuma aplicar "no olhômetro", em mm (1 mm em 1 m² = 1 litro). */
export const LAMINA_OLHOMETRO_MM = 6;
/** Consumo médio de uma bomba pequena: kWh por 1.000 litros bombeados. */
export const KWH_POR_MIL_LITROS = 0.45;
/** Chance mínima de chuva para segurar a bomba. */
export const PROBABILIDADE_MINIMA_CHUVA = 70;
/** Janela máxima (horas) para esperar a chuva. */
export const HORAS_MAXIMAS_ESPERA = 6;
/** Cada ponto percentual abaixo do ideal pede ~0,25 mm de água. */
const MM_POR_PONTO_DE_DEFICIT = 0.25;

export interface EntradaMotor {
  umidadeSolo: number | null;
  umidadeMinimaIdeal: number;
  previsao: PrevisaoChuva | null;
  areaHectares: number;
}

const M2_POR_HECTARE = 10_000;

function litros(mm: number, areaHectares: number): number {
  return Math.round(mm * areaHectares * M2_POR_HECTARE);
}

function kwh(l: number): number {
  return Math.round((l / 1000) * KWH_POR_MIL_LITROS * 10) / 10;
}

function resultado(decisao: DecisaoIrrigacao, justificativa: string, litrosEconomizados: number): Recomendacao {
  const l = Math.max(0, litrosEconomizados);
  return { decisao, justificativa, litrosEconomizados: l, kwhEconomizados: kwh(l) };
}

export function recomendar(e: EntradaMotor): Recomendacao {
  if (e.umidadeSolo === null) {
    return resultado('SEM_RECOMENDACAO', 'Ainda não chegou leitura do sensor de solo. Confira se o aparelho está ligado.', 0);
  }
  if (e.previsao === null) {
    return resultado('SEM_RECOMENDACAO', 'Não conseguimos a previsão do tempo para este lugar. Informe a localização da zona.', 0);
  }

  const umidade = Math.round(e.umidadeSolo);
  const regaOlhometro = litros(LAMINA_OLHOMETRO_MM, e.areaHectares);

  if (umidade >= e.umidadeMinimaIdeal) {
    return resultado(
      'NAO_IRRIGAR',
      `A terra está com ${umidade}% de umidade, acima do ideal de ${e.umidadeMinimaIdeal}%. Não precisa regar hoje.`,
      regaOlhometro,
    );
  }

  const deficit = e.umidadeMinimaIdeal - umidade;
  const necessario = litros(Math.min(deficit * MM_POR_PONTO_DE_DEFICIT, LAMINA_OLHOMETRO_MM * 2), e.areaHectares);
  const { probabilidadePercentual: chance, horasAteChuva: horas } = e.previsao;

  if (chance >= PROBABILIDADE_MINIMA_CHUVA && horas !== null && horas <= HORAS_MAXIMAS_ESPERA) {
    return resultado(
      'AGUARDAR_CHUVA',
      `A terra está seca (${umidade}%), mas tem ${chance}% de chance de chuva em ${horas} ${horas === 1 ? 'hora' : 'horas'}. ` +
        'Deixe a bomba desligada e economize água e energia.',
      necessario,
    );
  }

  return resultado(
    'IRRIGAR_AGORA',
    `A terra está seca (${umidade}%, o ideal é ${e.umidadeMinimaIdeal}%) e não há chuva forte à vista. ` +
      'Pode ligar a bomba, regando só o necessário.',
    regaOlhometro - necessario,
  );
}

export const ROTULO_DECISAO: Record<DecisaoIrrigacao, string> = {
  IRRIGAR_AGORA: 'Pode regar agora',
  AGUARDAR_CHUVA: 'Espere a chuva',
  NAO_IRRIGAR: 'Não precisa regar',
  SEM_RECOMENDACAO: 'Sem recomendação',
};
