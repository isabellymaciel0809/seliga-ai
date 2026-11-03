# Fica Esperto AI: Assistente de Segurança Digital para Adolescentes

Projeto do bootcamp da SoulCode Academy, com apoio da Claro e da Favela Gaming. O enunciado pede **"um protótipo de chatbot que oriente usuários sobre golpes digitais, fraudes, privacidade e uso seguro da internet"**, entregue como **protótipo funcional**. O nosso é voltado para adolescentes, que é o público da base fornecida pela disciplina.

O assistente orienta sobre 8 temas: golpes no WhatsApp, Pix, links falsos (phishing), falso suporte, senhas, Wi-Fi público, privacidade e notícias falsas.

> Projeto educativo, sem integração com a Claro, a SoulCode, a Favela Gaming ou qualquer canal oficial. O site usa as cores da Claro e da SoulCode, e o logo da Claro aparece só no rodapé e na página Sobre, como identificação do apoio ao bootcamp.

---

## Para começar (2 minutos)

1. **Abra o site:** **https://isabellymaciel0809.github.io/fica-esperto-ai/** ou **https://fica-esperto-ai.vercel.app** (o mesmo site, nos dois endereços). Funciona no computador e no celular, sem instalar nada. Sem internet, dê dois cliques em `site/index.html` na pasta do projeto: funciona igual (só a fonte dos títulos muda).
2. **Teste o chat:** escreva na caixa da página inicial, ou abra o Chat, do jeito que um adolescente escreveria, como *"um cara no zap pediu o código que chegou no meu cel"*.
3. **Clique em "Por quê?"** abaixo da resposta: ele mostra as palavras que mais pesaram na escolha do tema.
4. **Veja a página 📊 Sobre:** resume problema, funcionamento e resultados.

**Na apresentação:** a animação de entrada aparece só uma vez por visita. Para mostrar de novo, abra **https://isabellymaciel0809.github.io/fica-esperto-ai/?abertura** (ou clique em "Ver a abertura de novo", no rodapé da página inicial). O botão "Pular" e a tecla Esc pulam a animação.

---

## O que tem no site

| Página | O que faz |
|---|---|
| 🏠 **Início** (`index.html`) | Abre com uma **animação de entrada** (partículas vermelhas e azuis formam o escudo). Depois, uma página escura no estilo "Apple": a frase que acende enquanto rola, um celular que mostra passo a passo como o assistente pensa (com o modelo calculando de verdade), os números que contam sozinhos e os atalhos para o resto do site |
| 💬 **Chat** (`chat.html`) | O assistente. Abre com uma tela de boas-vindas com sugestões, e as respostas aparecem "sendo digitadas", com horário. Tem confirmação do tema quando está em dúvida ("é sobre A ou B?"), botão **"Por que essa resposta?"** (mostra as palavras que mais pesaram), **🔊 Ouvir** e perguntas de continuação |
| 🎮 **Simulador** | 3 golpes encenados, cada um com a cara do app onde acontece (WhatsApp, chat de jogo e Instagram), com "digitando…", horário e "✓✓" de lido. A pessoa escolhe o que responder, vê os sinais de alerta no fim e ganha confete se escapar |
| 🚩 **Quiz** | "É golpe ou não?": 10 mensagens (6 golpes e 4 normais), cada uma com a aparência do canal real (SMS, e-mail, notificação, WhatsApp, grupo, chat de jogo, Wi-Fi, permissão do celular). No fim, dá para baixar ou compartilhar um card com o resultado |
| ✅ **Checklist** | 10 perguntas sobre hábitos de segurança, nota de 0 a 10 e plano do que melhorar |
| 📌 **Dicas** | Cards por tema que podem ser baixados como imagem para os stories |
| 📊 **Sobre** | Problema, como funciona, resultados com gráfico, hipóteses e limitações |
| 📝 **Avaliação** | Teste com adolescentes (veja abaixo) |

Todas as páginas usam o mesmo visual escuro e tecnológico da página inicial, com cartões de "vidro fosco" e brilho vermelho e azul no fundo. No topo, ficam os botões **A−/A+** (tamanho do texto), **☀/☾** (tema claro ou escuro; o site lembra a escolha) e **◐** (alto contraste). Ao trocar de página, o topo e o menu ficam parados e só o conteúdo muda, com uma transição suave (no Chrome e no Edge). No celular, o menu vira uma barra fixa embaixo da tela, como nos apps. Nenhuma conversa é salva nem enviada: tudo roda no navegador, sem servidor.

**Visual:** azul da SoulCode (`#0000FF`) nos botões, no assistente e nos gráficos, vermelho da Claro (`#DA291C`) nos alertas, amarelo da SoulCode (`#F9B040`) nos exemplos. O par azul e vermelho foi testado para daltonismo e para contraste de leitura. O logo é um escudo em degradê do vermelho da Claro para o azul da SoulCode, e os ícones da interface seguem todos o mesmo estilo de linha.

---

**Conquistas:** são 10 medalhas, como "Primeira dúvida", "Ouviu uma resposta em voz alta" e "Acertou 9 ou mais no quiz". Elas são desbloqueadas usando o site e aparecem na seção "Seu progresso" da página inicial. Ficam salvas só no aparelho, sem cadastro.

**Seção "Quem fez" (página Sobre):** ela fica escondida até alguém preencher os nomes do grupo. Abra `site/js/sobre.js`, procure a lista `EQUIPE` e escreva uma linha por pessoa, assim:

```js
const EQUIPE = [
  { nome: "Nome Sobrenome", papel: "Notebook e modelo" },
  { nome: "Outra Pessoa", papel: "Site e design" },
];
```

---

## Como o assistente funciona

O chatbot **não é um ChatGPT**: ele nunca inventa orientações. Ele só escolhe entre respostas escritas e revisadas antes, como recomenda o notebook de exemplo da professora.

1. **Proteção:** bloqueia mensagens com CPF, senha ou código.
2. **Normalização:** tira acentos e traduz gírias ("zap" → WhatsApp, "hackearam" → senha).
3. **Escopo:** percebe quando a pergunta não é sobre segurança digital.
4. **Classificação:** um modelo de IA (regressão logística) escolhe 1 entre os 8 temas.
5. **Confirmação:** se a confiança for baixa, pergunta "é sobre A ou B?".
6. **Resposta:** passos curtos, exemplo do dia a dia, "Atenção" e "Referência para consulta".

---

## Resultados

Acertos do assistente em perguntas que o modelo não viu no treino:

| Conjunto | Fica Esperto AI |
|---|---|
| Teste oficial da base (24 perguntas) | **21 de 24** |
| Teste oficial com a confirmação do tema | **24 de 24** |
| Perguntas sem resposta (fallback) no teste oficial | **0 de 24** |
| Perguntas informais novas: validação (40) | **40 de 40** |
| Perguntas informais novas: lote final (24) | **22 de 24** |
| **Teste cego** (40 perguntas novas, escritas antes da última mudança e usadas uma única vez) | **38 de 40** |
| Palavras por frase (quanto menor, mais fácil) | **7,8** |
| Facilidade de leitura (Flesch, 0 a 100) | **82,5 (muito fácil)** |

**O teste cego é a medida mais honesta.** Ele foi escrito antes da última mudança (a categoria "fora do escopo", que ensina o modelo a recusar perguntas sobre outros assuntos) e usado uma única vez. A mudança tem um custo: o lote final caiu de 24 para 22, porque duas perguntas válidas mas vagas passaram a ser recusadas. Somando os três lotes, o acerto foi de 96 para 100 de 104.

**Para os slides:** use o gráfico de acertos da página 📊 Sobre (dá para tirar um print) e a matriz de confusão em `grafico_confusao.png`, que mostra onde o assistente acerta e onde confunde os temas. O `grafico_acertos.png` e o `resumo_indicadores.csv` são gerados pelo notebook e ainda trazem o baseline, então não use esses dois nos slides.

---

## Arquivos

| Arquivo | O que é |
|---|---|
| `site/` | **O protótipo funcional** (HTML, CSS e JavaScript, sem back-end), publicado no GitHub Pages |
| `.github/workflows/pages.yml` | Publica a pasta `site/` no GitHub Pages a cada envio (push) para o GitHub |
| `vercel.json` | Faz a Vercel mostrar a pasta `site/` no endereço principal (a Vercel também publica a cada push) |
| `Assistente_Seguranca_Digital_Adolescentes.ipynb` | Nosso notebook, com a mesma estrutura do exemplo da professora (seções 0 a 10) |
| `Planejamento_Projeto_IA_Adolescentes.docx` | Documento do projeto: tema, hipóteses, metodologia, resultados e limitações |
| `Projeto_2_Seguranca_Digital_Adolescentes.csv` | Base da disciplina, original, sem alterações |
| `base_limpa.csv` | A mesma base, limpa e ordenada por tema (gerada pela seção 2 do notebook) |
| `Roteiro_Apresentacao.docx` / `.pdf` | **Roteiro da demonstração** de 5 minutos: lista do que conferir antes, falas, perguntas testadas para o chat, plano B e respostas para a banca |
| `exemplos_complementares.csv` | 210 frases de treino no jeito adolescente de escrever: 164 sobre os 8 temas e 46 sobre outros assuntos (categoria `fora_do_escopo`) |
| `perguntas_validacao.csv` | 104 perguntas novas para avaliar o assistente, em três lotes: validação, final e cego (nunca usadas no treino) |
| `Projeto_2_Seguranca_Digital_Exemplo_Funcional.ipynb` | Notebook de exemplo da professora. Não vai para o GitHub, por ser material da disciplina |
| `resultado_testes.csv`, `resumo_indicadores.csv` | Resultados gerados pelo notebook (caso a caso e resumo) |
| `grafico_acertos.png`, `grafico_confusao.png` | Gráficos gerados pelo notebook |

**Limpeza da base:** a base original tinha 1 tema vazio (`5_boato_09`) e o tema Wi-Fi escrito de 3 jeitos (`wifi`, `WIFI` e `  wifi  `). O notebook corrige isso, confere tudo com validações automáticas e salva a versão organizada em `base_limpa.csv`.

---

## O que falta fazer

| Tarefa | Situação |
|---|---|
| Slides da apresentação | Com a pessoa responsável (material acima, em "Para os slides") |
| Ensaiar a demonstração | Pronto para ensaiar: siga o `Roteiro_Apresentacao.pdf` |
| **Teste com adolescentes** | A fazer: é o que confirma as hipóteses H1 e H2 (veja abaixo) |
| Revisar os textos do simulador, do quiz, do checklist e das dicas | A fazer: todo mundo pode ler e sugerir ajustes |
| Preencher o resultado do teste com adolescentes no documento Word | Depois do teste |
| Publicar o site | Feito: https://isabellymaciel0809.github.io/fica-esperto-ai/ e https://fica-esperto-ai.vercel.app |
| QR code do site para os slides | A fazer |

### Como aplicar o teste com adolescentes

Use a página **📝 Avaliação**, presencialmente. Leva uns 5 minutos por pessoa:

1. **H2 (linguagem):** o participante vê 3 situações. Para cada uma, lê a resposta original da base e a nossa, em ordem aleatória e sem saber qual é qual, dá notas de 1 a 5 e escolhe a que ajudaria mais.
2. **H1 (acerto):** faz até 3 perguntas do jeito dele e diz se a resposta tinha a ver.

**Cuidados:**
- É anônimo: pede só a faixa de idade. Perguntas com CPF, senha ou código não são registradas.
- As respostas ficam **só no aparelho usado**, então use sempre o mesmo computador, o mesmo navegador e o mesmo endereço. Cada endereço (GitHub Pages, Vercel e o arquivo local) guarda as respostas separado, então escolha um só e use ele no teste todo (o recomendado é o GitHub Pages).
- No fim, em **Área do aplicador** (rodapé da página), baixe `avaliacao_comparacoes.csv` e `avaliacao_perguntas.csv` e coloque-os na pasta do notebook. A **seção 9** do notebook faz a análise.
- Se os participantes forem **menores de idade**, combinem antes com a professora e a escola como pedir a autorização.

---

## Se precisar mudar o assistente

Não edite `site/js/modelo.js` nem `site/js/metricas.js` à mão: os dois são gerados pelo notebook.

1. Mude o notebook (respostas, gírias, exemplos de treino) ou os CSVs.
2. Rode todas as células. A seção 6.2 gera o `modelo.js` e a seção 10 gera o `metricas.js`.
   - No Colab, faça o upload dos CSVs antes e, no fim, baixe os dois arquivos gerados (painel **Arquivos** → `site/js/`) para substituir os da pasta `site/js/`.
3. Recarregue o site local com **Ctrl+F5**.
4. Envie as mudanças para o GitHub (`git add`, `git commit` e `git push`). Os dois endereços publicados se atualizam sozinhos em 1 ou 2 minutos (o GitHub Pages aparece na aba **Actions** do repositório, e a Vercel no painel do projeto).

Os textos do simulador, do quiz, do checklist e das dicas ficam direto nos arquivos `site/js/simulador.js`, `quiz.js`, `checklist.js` e `dicas.js`, e podem ser editados à mão.

---

## Limitações

- Responde apenas aos 8 temas da base. A regra de escopo erra para os dois lados: algumas perguntas fora do assunto ainda recebem uma resposta de segurança, e algumas perguntas válidas mas vagas (como "como faço pra minha conta ficar mais protegida?") são recusadas.
- Os exemplos de treino e as perguntas de validação foram escritos pelo grupo, não por adolescentes. Os ajustes foram feitos olhando os erros dos lotes de validação e final, então esses resultados podem estar um pouco otimistas. O teste cego (38 de 40) não foi usado para ajustes, mas o teste com adolescentes é a confirmação real.
- Temas sensíveis, como cyberbullying e sextorsão, não estão na base e precisam de conteúdo revisado por especialistas.
- Não substitui orientação de um adulto de confiança, da escola, do banco ou de profissionais.
