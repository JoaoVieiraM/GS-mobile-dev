/**
 * Alertas da IA. Cada zona passa pelo motor de recomendação (espelho do modelo
 * de IA/ML) e vira um alerta para o agricultor, ex.: "bomba desligada devido à
 * previsão de chuva".
 */
import { Alerta, DecisaoIrrigacao, SeveridadeAlerta, ZonaIrrigacao } from '../domain/models';
import { recomendar } from './motorRecomendacao';
import { ok, ResultadoServico } from './resultadoServico';
import { listarZonas } from './zonaService';

const SEVERIDADE: Record<DecisaoIrrigacao, SeveridadeAlerta> = {
  IRRIGAR_AGORA: 'CRITICO',
  AGUARDAR_CHUVA: 'ATENCAO',
  NAO_IRRIGAR: 'INFO',
  SEM_RECOMENDACAO: 'ATENCAO',
};

const TITULO: Record<DecisaoIrrigacao, string> = {
  IRRIGAR_AGORA: 'Solo seco: pode ligar a bomba',
  AGUARDAR_CHUVA: 'Bomba desligada: vem chuva aí',
  NAO_IRRIGAR: 'Solo bom: não precisa regar',
  SEM_RECOMENDACAO: 'Faltam dados para decidir',
};

const ORDEM: Record<SeveridadeAlerta, number> = { CRITICO: 0, ATENCAO: 1, INFO: 2 };

export function alertaDaZona(zona: ZonaIrrigacao): Alerta {
  const rec = recomendar({
    umidadeSolo: zona.ultimaLeitura?.umidadeSoloPercentual ?? null,
    umidadeMinimaIdeal: zona.umidadeMinimaIdeal,
    previsao: zona.previsao,
    areaHectares: zona.areaHectares,
  });
  return {
    id: `alerta-${zona.id}`,
    zonaId: zona.id,
    zonaNome: zona.nome,
    severidade: SEVERIDADE[rec.decisao],
    decisao: rec.decisao,
    titulo: TITULO[rec.decisao],
    mensagem: rec.justificativa,
    criadoEm: zona.ultimaLeitura?.lidaEm ?? zona.criadaEm,
  };
}

export async function listarAlertas(): Promise<ResultadoServico<Alerta[]>> {
  const zonas = await listarZonas();
  if (!zonas.ok) return zonas;
  const alertas = zonas.dados.map(alertaDaZona).sort((a, b) => ORDEM[a.severidade] - ORDEM[b.severidade]);
  return ok(alertas);
}
