/** Porta de entrada: decide entre a identificação e a home, conforme o que está salvo no aparelho. */
import { Redirect } from 'expo-router';
import { useIdentidade } from '../src/hooks/useIdentidade';
import { Carregando } from '../src/ui/components/EstadoLista';

export default function Inicio() {
  const { estado } = useIdentidade();
  if (estado.tipo === 'carregando') return <Carregando mensagem="Abrindo a Gota Inteligente…" />;
  if (estado.tipo === 'anonimo') return <Redirect href="/identificacao" />;
  return <Redirect href="/zonas" />;
}
