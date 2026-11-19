/** Validação pura da identificação do produtor. Sem React, sem armazenamento. */
import { falha, ErrosDeCampo, Resultado, sucesso } from './resultado';

export interface EntradaIdentidade {
  nome: string;
  municipio: string;
  bairroOuComunidade: string;
}

export type CampoIdentidade = keyof EntradaIdentidade;

export type IdentidadeValida = EntradaIdentidade;

const SO_LETRAS = /^[\p{L}\s'.-]+$/u;

export function validarIdentidade(e: EntradaIdentidade): Resultado<IdentidadeValida, CampoIdentidade> {
  const erros: ErrosDeCampo<CampoIdentidade> = {};
  const nome = e.nome.trim().replace(/\s+/g, ' ');
  const municipio = e.municipio.trim();
  const bairro = e.bairroOuComunidade.trim();

  if (nome.length < 2) erros.nome = 'Escreva como você quer ser chamado (pelo menos 2 letras).';
  else if (!SO_LETRAS.test(nome)) erros.nome = 'Use apenas letras no nome.';

  if (municipio.length < 2) erros.municipio = 'Informe o município.';
  if (bairro.length < 2) erros.bairroOuComunidade = 'Informe o bairro, sítio ou comunidade.';

  if (Object.keys(erros).length > 0) return falha(erros);
  return sucesso({ nome, municipio, bairroOuComunidade: bairro });
}
