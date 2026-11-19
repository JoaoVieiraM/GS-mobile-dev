/** Identificação do produtor, persistida no aparelho (lembrada ao reabrir o app). */
import { Produtor } from '../domain/models';
import { IdentidadeValida } from '../validation/identidadeValidation';
import { ler, remover, salvar } from './armazenamento';
import { decodificarProdutor } from './decodificadores';
import { ResultadoServico } from './resultadoServico';

export function carregarProdutor(): Promise<ResultadoServico<Produtor | null>> {
  return ler('@gota/produtor', decodificarProdutor);
}

export function salvarProdutor(dados: IdentidadeValida): Promise<ResultadoServico<Produtor>> {
  const produtor: Produtor = { ...dados, identificadoEm: new Date().toISOString() };
  return salvar('@gota/produtor', produtor);
}

export function esquecerProdutor(): Promise<ResultadoServico<null>> {
  return remover('@gota/produtor');
}
