/**
 * AsyncStorage tipado. As chaves são uma union fechada e toda leitura passa
 * por um decodificador, então nada sai daqui sem tipo.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Decodificador } from './decodificadores';
import { erro, mensagemDeErro, ok, ResultadoServico } from './resultadoServico';

export type ChaveArmazenamento =
  | '@gota/produtor'
  | '@gota/zonas'
  | '@gota/fonteDados'
  | '@gota/simularFalha';

export async function ler<T>(chave: ChaveArmazenamento, decodificar: Decodificador<T>): Promise<ResultadoServico<T | null>> {
  try {
    const bruto = await AsyncStorage.getItem(chave);
    if (bruto === null) return ok(null);
    const json: unknown = JSON.parse(bruto);
    const valor = decodificar(json);
    if (valor === null) return erro('FORMATO', 'Os dados salvos no aparelho estão corrompidos.');
    return ok(valor);
  } catch (e: unknown) {
    return erro('ARMAZENAMENTO', `Não foi possível ler os dados do aparelho. (${mensagemDeErro(e)})`);
  }
}

export async function salvar<T>(chave: ChaveArmazenamento, valor: T): Promise<ResultadoServico<T>> {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(valor));
    return ok(valor);
  } catch (e: unknown) {
    return erro('ARMAZENAMENTO', `Não foi possível salvar no aparelho. (${mensagemDeErro(e)})`);
  }
}

export async function remover(chave: ChaveArmazenamento): Promise<ResultadoServico<null>> {
  try {
    await AsyncStorage.removeItem(chave);
    return ok(null);
  } catch (e: unknown) {
    return erro('ARMAZENAMENTO', `Não foi possível apagar os dados. (${mensagemDeErro(e)})`);
  }
}
