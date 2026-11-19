# Roteiro do vídeo demo (até 2 minutos)

**Preparação antes de gravar:** já ter se identificado uma vez no app; fechar o app por completo; no Perfil, deixar "Simular falha" desligado e as zonas de exemplo restauradas; no celular, **revogar** a permissão de localização do Expo Go (para o pedido aparecer na gravação).

| Tempo | Na tela | Fala (sugestão) |
|---|---|---|
| 0:00–0:10 | Abrir o app do zero → cai direto em "Minhas zonas" com "Olá, [nome]!" | "Essa é a Gota Inteligente, o app do agricultor familiar. Eu já me identifiquei antes: fechei e reabri, e o app lembrou de mim." |
| 0:10–0:20 | Mostrar o spinner "Buscando suas zonas…" e depois a lista pronta | "A lista tem estado de carregando… e aqui as zonas prontas, com a umidade que vem do sensor ESP32." |
| 0:20–0:35 | Perfil → ligar "Simular falha" → voltar à lista: tela de erro → desligar → "Tentar de novo" | "Se o servidor cair, o app mostra um erro claro e deixa tentar de novo." |
| 0:35–0:45 | Perfil → "Apagar zonas" → lista vazia com "Cadastrar zona" | "E quando não tem nada cadastrado, o estado vazio já guia o próximo passo." |
| 0:45–1:00 | "Cadastrar zona" → tocar "Salvar zona" com campos vazios / área "0" / umidade "150" → erros em vermelho | "O formulário valida tudo: nome, cultura, área positiva, umidade de 0 a 100." |
| 1:00–1:20 | Preencher corretamente → "Usar minha localização" → **pedido de permissão do sistema** → Permitir → coordenadas preenchidas | "Aqui está o recurso nativo: a localização. A previsão de chuva é por ponto, então a zona precisa do lugar. Se o agricultor negar, ele digita as coordenadas à mão e nada trava." |
| 1:20–1:40 | Salvar → abre o detalhe com a recomendação e "💧 X litros e ⚡ Y kWh economizados" | "No detalhe vem a recomendação, a mesma lógica do nosso modelo de IA: solo seco mas com chuva chegando? Bomba desligada. E o indicador de impacto: litros e kWh economizados." |
| 1:40–1:52 | Aba Alertas → "Bomba desligada: vem chuva aí" | "Os alertas da IA chegam aqui, em linguagem simples." |
| 1:52–2:00 | Voltar à lista | "A Gota Inteligente ajuda o pequeno produtor a regar na hora certa, economizando água e energia. ODS 2 e 13." |

**Plano B para a permissão:** se o pedido não aparecer (permissão já concedida), mostrar negando em outro aparelho ou explicar o caminho manual com os campos de latitude/longitude.
