# registro de prompts  
 

| # | Quem | Objetivo | Prompt | Resultado esperado |
|---|---|---|---|---|
| 1 | Joao Pedro Vieira de Morais | Separar regra de negócio da tela | "A validação do formulário de zona está dentro do componente. Extraia para `src/validation/zonaValidation.ts` como função pura que recebe as strings digitadas e devolve `Resultado<NovaZona, CampoZona>`. Não importe React nem AsyncStorage nesse módulo." | Validação testável sem emulador; a tela só consome `r.ok` e `r.erros`. |
| 2 | Joao Pedro Vieira de Morais | Tipar respostas de serviço | "Não quero `throw` subindo para a tela. Use este tipo em todos os serviços: `type ResultadoServico<T> = { ok: true; dados: T } \| { ok: false; erro: ErroServico }` e trate o `catch` com `unknown`." | Toda chamada de I/O obriga o chamador a tratar o erro. |
| 3 | Joao Pedro Vieira de Morais | Eliminar `any` na leitura de JSON | "O `JSON.parse` está retornando `any`. Atribua a `unknown` e crie decodificadores com narrowing por campo, devolvendo `null` quando o formato não bate." | Dados de rede e armazenamento só viram tipo de domínio depois de validados. |
| 4 | Joao Pedro Vieira de Morais | Inverter dependência da fonte de dados | "Defina a interface `RepositorioZonas` com `listar`, `buscar` e `criar`, e faça duas implementações: local com AsyncStorage e HTTP com a API da equipe. As telas não podem saber qual está ativa." | Troca de fonte sem mexer em nenhuma tela. |
| 5 | Joao Pedro Vieira de Morais | Clean code no estado da lista | "Troque os três booleanos `loading`, `error` e `empty` por uma union `EstadoRecurso<T>` e use `switch` exaustivo na tela. Estados impossíveis não podem ser representáveis." | Hook `useRecursoAssincrono` com quatro estados mutuamente exclusivos. |
| 6 | Joao Pedro Vieira de Morais | Nomes e responsabilidades | "Renomeie funções genéricas como `handle` e `getData` para nomes do domínio, como `salvarZona` e `listarZonas`, e deixe cada arquivo de `services/` com uma responsabilidade só." | Código que se lê como a linguagem do problema. |

 