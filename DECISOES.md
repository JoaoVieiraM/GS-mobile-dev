# Decisões de projeto — Gota Inteligente (Mobile)

## 1. Expo Router e rotas tipadas

Usamos **Expo Router** porque a navegação é baseada em arquivos: a pasta `app/` já é o mapa do app, o que facilita para qualquer integrante achar uma tela. Ligamos `experiments.typedRoutes` no `app.json`; com isso, `router.push('/zonas/nova')` e `router.push({ pathname: '/zonas/[id]', params: { id } })` são verificados pelo compilador — uma rota errada ou um parâmetro faltando vira erro de `tsc`, não um bug na demo.

Organização: uma `Stack` raiz (identificação × área logada), um grupo `(app)` com **abas** (Zonas, Alertas, Perfil) e, dentro de Zonas, outra `Stack` (lista → nova → detalhe). O `index.tsx` raiz e o layout das abas consultam a identidade e redirecionam, então quem já se identificou nunca vê o onboarding de novo.

## 2. Localização como recurso nativo

A decisão da IA depende da **previsão de chuva por ponto**, então a zona de irrigação precisa de coordenada. Por isso escolhemos `expo-location`: não é um enfeite, é dado de entrada da recomendação.

A permissão tem três estados tratados em `src/hooks/useLocalizacao.ts`, cada um com texto e caminho próprios na tela de cadastro:

- **Não solicitada:** explicamos por que pedimos e o botão dispara o pedido do sistema.
- **Concedida:** o botão lê o GPS e preenche latitude/longitude.
- **Negada:** explicamos que está tudo bem e liberamos a **digitação manual**. Se o sistema não deixa perguntar de novo, trocamos o botão por "Abrir configurações".

A coordenada é **opcional** na validação: negar a permissão nunca trava o cadastro. Sem coordenada, a zona fica com "Sem recomendação" e o app diz o que falta. Falha de GPS (desligado, sem sinal) também cai no caminho manual.

## 3. Serviço com duas implementações

O backend da disciplina de SOA pode não estar no ar na hora da demonstração, e o app precisa funcionar no Expo Go em qualquer rede. Por isso `zonaService.ts` define uma interface `RepositorioZonas` e duas implementações:

- **`repositorioLocal`** (padrão): AsyncStorage + latência simulada de ~900 ms, para o estado "carregando" ser visível. Na primeira abertura grava o `seed` simulado.
- **`repositorioHttp`**: chama a API da equipe (URL em `app.json > extra.apiUrl`) pelo wrapper `http.ts`.

As telas só chamam `listarZonas`, `buscarZona` e `criarZona`; quem escolhe a implementação é a fachada, lendo a configuração salva (alternável no Perfil). Toda resposta é uma union discriminada `ResultadoServico<T>` (`{ ok: true, dados } | { ok: false, erro }`) — nenhuma exceção solta chega à tela. JSON de rede e de armazenamento chegam como `unknown` e passam por **decodificadores** com narrowing antes de virar tipo de domínio. O botão "Simular falha" fica na fachada, então funciona com as duas fontes.

## 4. Validação pura separada da interface

`src/validation/` não importa React nem AsyncStorage. `validarZona(entrada)` recebe exatamente o que foi digitado (strings) e devolve `Resultado<NovaZona, CampoZona>`: ou o objeto já convertido e tipado, ou um mapa de erros **por campo**. A tela só faz `if (!r.ok) setErros(r.erros)`. Regras: nome com 3 a 40 letras, cultura dentro do union `CulturaAgricola`, área numérica e positiva (aceita vírgula), umidade ideal entre 0 e 100, latitude −90…90 e longitude −180…180 quando informadas. Isso deixa a regra testável sem emulador e reaproveitável por outra tela ou pela API.

## 5. Conexão com as outras entregas da equipe

- **IoT (ESP32/Wokwi):** `LeituraSensor` tem `origem: 'SENSOR_ESP32' | 'MANUAL'` e `umidadeSoloPercentual` — o mesmo dado que o ESP32 publica. No modo HTTP, a API entrega a última leitura do sensor; no modo local, ela é simulada.
- **IA/ML (Python):** `motorRecomendacao.ts` é uma **função pura que espelha a regra do modelo**: solo seco + chuva ≥ 70% em até 6 h → `AGUARDAR_CHUVA` (bomba desligada); solo seco sem chuva → `IRRIGAR_AGORA`; solo acima do ideal → `NAO_IRRIGAR`; sem dados → `SEM_RECOMENDACAO`. Ela também calcula o **indicador de impacto** (litros e kWh economizados em relação à rega "no olhômetro"). Os alertas da aba Alertas saem dessa mesma decisão.
- **C# WinForms:** o painel do Sindicato/Prefeitura consome as mesmas zonas e o mesmo `StatusZona` (`SOLO_OK`, `ATENCAO`, `ESTRESSE_HIDRICO`) pela API — o app e o painel falam a mesma língua.

## 6. TypeScript

`strict` + `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`. Domínio modelado com **unions de string literal** (sem `enum`, sem `string` solta), `Record<Union, ...>` para rótulos e cores (o compilador avisa se faltar um caso) e `switch` exaustivo nos estados da lista. Zero `any`, zero `@ts-ignore`; onde a tentação seria `any` (resposta de rede, `catch`), usamos `unknown` + narrowing. `npm run check` (`tsc --noEmit`) sai limpo.

## 7. O que fica para o próximo passo

- Notificações push quando a IA desligar a bomba (`expo-notifications`), hoje os alertas são vistos na aba.
- Leitura em tempo real do ESP32 via MQTT/WebSocket em vez de buscar a última leitura.
- Previsão de chuva de um serviço meteorológico real no lugar da simulação.
- Edição e exclusão de zonas, e histórico de economia por safra.
- Modo offline com fila de sincronização quando a fonte HTTP voltar.
- Testes automatizados das funções puras (validação e motor de recomendação).
