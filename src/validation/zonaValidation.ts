/**
 * Validação pura do formulário de zona. Sem React, sem AsyncStorage:
 * recebe o que foi digitado e devolve um Resultado<NovaZona>.
 */
import { Coordenada, ehCultura, NovaZona } from '../domain/models';
import { falha, ErrosDeCampo, lerNumero, Resultado, sucesso } from './resultado';

export const NOME_MIN = 3;
export const NOME_MAX = 40;

export interface EntradaZona {
  nome: string;
  cultura: string;
  areaHectares: string;
  umidadeMinimaIdeal: string;
  latitude: string;
  longitude: string;
}

export type CampoZona = keyof EntradaZona;
type CampoCoordenada = 'latitude' | 'longitude';

export function validarNome(nome: string): string | null {
  const n = nome.trim();
  if (n === '') return 'Dê um nome para a zona.';
  if (n.length < NOME_MIN) return `O nome precisa ter pelo menos ${NOME_MIN} letras.`;
  if (n.length > NOME_MAX) return `O nome pode ter no máximo ${NOME_MAX} letras.`;
  return null;
}

/** Coordenada é opcional: os dois campos vazios = sem coordenada. Se informada, precisa estar na faixa. */
export function validarCoordenada(
  latTexto: string,
  lonTexto: string,
): Resultado<Coordenada | null, CampoCoordenada> {
  if (latTexto.trim() === '' && lonTexto.trim() === '') return sucesso(null);

  const erros: ErrosDeCampo<CampoCoordenada> = {};
  const lat = lerNumero(latTexto);
  const lon = lerNumero(lonTexto);

  if (lat === null) erros.latitude = 'Informe a latitude (ex.: -22,90).';
  else if (lat < -90 || lat > 90) erros.latitude = 'A latitude vai de -90 a 90.';

  if (lon === null) erros.longitude = 'Informe a longitude (ex.: -47,06).';
  else if (lon < -180 || lon > 180) erros.longitude = 'A longitude vai de -180 a 180.';

  if (lat === null || lon === null || Object.keys(erros).length > 0) return falha(erros);
  return sucesso({ latitude: lat, longitude: lon });
}

export function validarZona(entrada: EntradaZona): Resultado<NovaZona, CampoZona> {
  const erros: ErrosDeCampo<CampoZona> = {};

  const erroNome = validarNome(entrada.nome);
  if (erroNome !== null) erros.nome = erroNome;

  const cultura = entrada.cultura;
  if (!ehCultura(cultura)) erros.cultura = 'Escolha o que está plantado na zona.';

  const area = lerNumero(entrada.areaHectares);
  if (area === null) erros.areaHectares = 'Informe a área em hectares, só números.';
  else if (area <= 0) erros.areaHectares = 'A área precisa ser maior que zero.';
  else if (area > 10000) erros.areaHectares = 'Área muito grande. Confira o valor.';

  const umidade = lerNumero(entrada.umidadeMinimaIdeal);
  if (umidade === null) erros.umidadeMinimaIdeal = 'Informe a umidade ideal, de 0 a 100.';
  else if (umidade < 0 || umidade > 100) erros.umidadeMinimaIdeal = 'A umidade vai de 0 a 100%.';

  const coord = validarCoordenada(entrada.latitude, entrada.longitude);
  if (!coord.ok) Object.assign(erros, coord.erros);

  if (Object.keys(erros).length > 0 || !ehCultura(cultura) || area === null || umidade === null || !coord.ok) {
    return falha(erros);
  }

  return sucesso({
    nome: entrada.nome.trim(),
    cultura,
    areaHectares: area,
    umidadeMinimaIdeal: umidade,
    coordenada: coord.valor,
  });
}
