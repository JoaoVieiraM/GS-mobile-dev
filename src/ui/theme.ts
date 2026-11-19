/** Tema pensado para o campo: letra grande, alto contraste, leitura no sol. */
import { DecisaoIrrigacao, SeveridadeAlerta, StatusZona } from '../domain/models';

export const cores = {
  fundo: '#F4F7F2',
  superficie: '#FFFFFF',
  texto: '#1B2A1F',
  textoSuave: '#46564A',
  borda: '#C9D4C7',
  primaria: '#1F6F3F',
  primariaTexto: '#FFFFFF',
  agua: '#0B5C8E',
  aguaClara: '#E1F0FA',
  perigo: '#A12622',
  perigoClaro: '#FBE7E6',
  alerta: '#8A5A00',
  alertaClaro: '#FFF3D6',
  sucesso: '#1F6F3F',
  sucessoClaro: '#E2F3E7',
  neutro: '#4C5A50',
  neutroClaro: '#ECEFEA',
} as const;

export const espaco = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const fonte = { pequena: 15, normal: 17, media: 20, grande: 24, titulo: 28 } as const;

export const raio = 14;

export interface ParCores {
  fundo: string;
  texto: string;
}

export const corDoStatus: Record<StatusZona, ParCores> = {
  SOLO_OK: { fundo: cores.sucessoClaro, texto: cores.sucesso },
  ATENCAO: { fundo: cores.alertaClaro, texto: cores.alerta },
  ESTRESSE_HIDRICO: { fundo: cores.perigoClaro, texto: cores.perigo },
  SEM_LEITURA: { fundo: cores.neutroClaro, texto: cores.neutro },
};

export const corDaDecisao: Record<DecisaoIrrigacao, ParCores> = {
  IRRIGAR_AGORA: { fundo: cores.perigoClaro, texto: cores.perigo },
  AGUARDAR_CHUVA: { fundo: cores.aguaClara, texto: cores.agua },
  NAO_IRRIGAR: { fundo: cores.sucessoClaro, texto: cores.sucesso },
  SEM_RECOMENDACAO: { fundo: cores.neutroClaro, texto: cores.neutro },
};

export const corDaSeveridade: Record<SeveridadeAlerta, ParCores> = {
  CRITICO: { fundo: cores.perigoClaro, texto: cores.perigo },
  ATENCAO: { fundo: cores.alertaClaro, texto: cores.alerta },
  INFO: { fundo: cores.sucessoClaro, texto: cores.sucesso },
};
