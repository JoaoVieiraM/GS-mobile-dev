# 💧 Gota Inteligente: App do Agricultor

Entrega da disciplina **Mobile Development & IoT**, Global Solution FIAP 2026.2 (CitizenTech).

## Ficha da CitizenTech

| | |
|---|---|
| **Nome da CitizenTech** | Gota Inteligente |
| **Cidade e bairro** | Ibiúna (SP), Bairro do Paruru, zona rural de agricultura familiar (cenário de demonstração) |
| **Cidadão beneficiado** | O agricultor familiar |
| **Problema em uma frase** | O pequeno produtor desperdiça água e energia regando "no olhômetro", ou perde a plantação numa seca repentina. |
| **Como funciona** | Um sensor de umidade de solo de baixo custo (ESP32) mede a terra; um modelo de IA cruza essa leitura com a previsão de chuva do ponto e decide se vale ligar a bomba; o agricultor recebe o aviso no celular e o Sindicato Rural/Prefeitura acompanha o estresse hídrico da região. |
| **O que cada parte faz** | **IoT (ESP32/Wokwi):** sensor de umidade do solo, o coração da solução. **IA/ML (Python):** decide, por exemplo, "solo seco, mas 90% de chance de chuva em 2 h, então não ligar a bomba". **C# WinForms:** painel do Sindicato Rural/Prefeitura com o nível de estresse hídrico das fazendas. **Mobile (este app):** porta de entrada do agricultor: cadastra zonas de irrigação, recebe os alertas da IA e vê a recomendação de cada zona. |
| **Link do repositório** | _(preencher com o link do repositório da equipe)_ |
| **Indicador de impacto** | Litros de água e kWh economizados por ciclo de irrigação (calculados e exibidos no detalhe de cada zona). |
| **ODS conectados** | **ODS 2**: Fome zero e agricultura sustentável · **ODS 13**: Ação contra a mudança global do clima · **ODS 9**: Indústria, inovação e infraestrutura (tecnologia de baixo custo levada ao campo) |

> ⚠️ **Todos os dados do app são simulados.** Não há dados pessoais reais. As leituras de sensor e a previsão de chuva são geradas localmente para demonstração.

## Integrantes

| Nome | RM |
|---|---|
| Henrique Maciel Rodrigues | RM559628 |
| Igor Pereira Nociti | RM560225 |
| João Pedro Vieira de Morais | RM560527 |
| Luigi Bonuccelli | RM560950 |
| Pedro Paulo Sabino Botelho | RM559578 |

## O que o app faz

- **Identificação** do produtor, salva no aparelho (AsyncStorage). Ao fechar e reabrir, o app cai direto na home.
- **Minhas zonas** (lista): estados de **carregando**, **erro**, **vazio** e **pronto**, cada um com tela própria.
- **Nova zona** (formulário validado): nome, cultura, área em hectares, umidade ideal e localização.
- **Localização (recurso nativo, `expo-location`)**: botão "Usar minha localização" com os estados de permissão *não solicitada*, *concedida* e *negada* tratados. Se negar, o agricultor digita latitude/longitude à mão, e o cadastro nunca trava.
- **Detalhe da zona**: umidade da terra, previsão de chuva e a **recomendação** (regar agora, esperar a chuva, não precisa regar) com litros e kWh economizados.
- **Alertas**: avisos gerados pelo motor de recomendação, espelho local da decisão da IA (ex.: "Bomba desligada: vem chuva aí").
- **Perfil**: dados do produtor e controles de demonstração.

## Como rodar

Pré-requisitos: Node.js 20+ e o app **Expo Go** (SDK 58) no celular.

```bash
npm install
npx expo start
```

Leia o QR code com o Expo Go (Android) ou com a câmera (iOS). Celular e computador precisam estar na mesma rede (ou use `npx expo start --tunnel`).

Verificação de tipos (deve sair sem nenhum erro):

```bash
npm run check      # = tsc --noEmit
```

## Configuração da API e fonte de dados

O app tem duas fontes de dados atrás da mesma interface (`src/services/zonaService.ts`):

- **Local (padrão):** AsyncStorage com latência simulada. Funciona sempre, sem servidor.
- **HTTP:** API REST da equipe (disciplina de SOA). Endpoints esperados: `GET /zonas`, `GET /zonas/:id`, `POST /zonas`.

A URL da API e a fonte padrão ficam em `app.json`:

```json
"extra": {
  "apiUrl": "http://192.168.0.10:8080/api",
  "fonteDados": "local"
}
```

Para alternar em tempo de execução: aba **Perfil → "De onde vêm os dados"** → *Neste celular* ou *Servidor da equipe*. A escolha fica salva.

## Como demonstrar os estados da lista

Tudo pela aba **Perfil → Demonstração**:

- **Erro:** ligue "Simular falha ao carregar as zonas" e volte para *Minhas zonas*. Botão "Tentar de novo" aparece. (Escolher *Servidor da equipe* com a API desligada também mostra o erro real de rede.)
- **Vazio:** toque em "Apagar zonas (mostrar lista vazia)".
- **Carregando:** aparece sempre ao abrir a lista (latência simulada de ~1 s).
- **Pronto:** "Restaurar zonas de exemplo".

## Estrutura

```
app/                      rotas (expo-router, tipadas)
  _layout.tsx             stack raiz + provedor de identidade
  index.tsx               decide: identificação ou home
  identificacao.tsx       onboarding
  (app)/_layout.tsx       abas
  (app)/zonas/            lista, nova, [id]
  (app)/alertas.tsx
  (app)/perfil.tsx
src/
  domain/models.ts        entidades e unions de string literal
  validation/             validação pura (sem React)
  services/               única camada com I/O (HTTP, AsyncStorage) + motor de recomendação
  hooks/                  estado da lista, identidade, localização
  ui/                     tema e componentes
```

Decisões de projeto: veja [`DECISOES.md`](DECISOES.md). Roteiro do vídeo: [`ROTEIRO_VIDEO.md`](ROTEIRO_VIDEO.md).
