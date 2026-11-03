// Interface do chat: mensagens, confirmação de tema, explicação e leitura em voz alta.
(function () {
  const conversa = document.getElementById("conteudo");
  const formulario = document.getElementById("formulario");
  const campo = document.getElementById("pergunta");
  const chips = document.getElementById("chips");
  const { escapar, formatarResposta, partesResposta } = window.Formatar;
  const { Comum } = window;
  const icone = Comum.icone;

  // o modelo (~1 MB) carrega depois de a tela aparecer; as respostas esperam por ele
  let Assistente, MODELO;
  const carregarScript = (src) => new Promise((ok, falha) => {
    const s = Object.assign(document.createElement("script"), { src, onload: ok, onerror: falha });
    document.body.appendChild(s);
  });
  let carregamento = null;
  function modeloPronto() {
    if (!carregamento) {
      carregamento = carregarScript("js/modelo.js")
        .then(() => carregarScript("js/assistente.js"))
        .then(() => ({ Assistente, MODELO } = window));
    }
    return carregamento;
  }
  // começa logo depois de a tela aparecer (sem disputar a rede com ela), ou antes, se a pessoa começar a digitar
  const quandoLivre = window.requestIdleCallback || ((f) => setTimeout(f, 300));
  window.addEventListener("load", () => setTimeout(() => quandoLivre(modeloPronto, { timeout: 2000 }), 2500), { once: true });
  document.getElementById("pergunta").addEventListener("input", modeloPronto, { once: true });

  // [ícone, rótulo, pergunta]
  const SUGESTOES = [
    ["whatsapp", "WhatsApp", "Um amigo mudou de número e pediu um Pix"],
    ["phishing", "Link de prêmio", "Recebi um link dizendo que ganhei uma skin grátis"],
    ["senha", "Senha", "Acho que hackearam meu Instagram"],
    ["falso_suporte", "Falso suporte", "Alguém disse que é do suporte do jogo e pediu um código"],
    ["pix", "Pix", "Paguei por Pix e o vendedor sumiu"],
    ["boato", "Fake news", "Estão mandando uma notícia no grupo da sala sem fonte"],
    ["wifi", "Wi-Fi", "Posso usar o app do banco no Wi-Fi do shopping?"],
    ["privacidade", "Privacidade", "Um app pediu acesso à câmera sem precisar"],
  ];

  // Perguntas de continuação: levam a outros temas já revisados da base
  const CONTINUAR = {
    whatsapp: [["E se eu já fiz o Pix?", "pix"], ["E se pediram um código?", "falso_suporte"]],
    pix: [["Como saber se o link da loja é falso?", "phishing"], ["E se foi um parente pedindo?", "whatsapp"]],
    phishing: [["E se eu já digitei minha senha?", "senha"], ["E se for só uma notícia estranha?", "boato"]],
    senha: [["Alguém pediu meu código", "falso_suporte"], ["Recebi um link pedindo login", "phishing"]],
    falso_suporte: [["E se eu já passei a senha?", "senha"], ["E se for um link, não uma ligação?", "phishing"]],
    wifi: [["E se eu já entrei na minha conta?", "senha"], ["Quais apps podem ver meus dados?", "privacidade"]],
    boato: [["A notícia tinha um link", "phishing"], ["Como proteger o que eu posto?", "privacidade"]],
    privacidade: [["Como deixar minha conta mais segura?", "senha"], ["Estou usando Wi-Fi público", "wifi"]],
  };

  // cartões da tela de boas-vindas: [ícone, título, pergunta de exemplo]
  const CARTOES_INICIO = [
    ["whatsapp", "Alguém pediu dinheiro", "minha mãe mandou msg de outro número pedindo dinheiro"],
    ["phishing", "Recebi um link estranho", "chegou um link dizendo que ganhei uma skin grátis"],
    ["falso_suporte", "Pediram um código", "alguém disse que é do suporte do jogo e pediu um código"],
    ["pix", "Paguei e não recebi", "paguei por Pix e o vendedor sumiu"],
  ];
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- montagem das mensagens ----------
  function rolarParaFim() {
    conversa.scrollTop = conversa.scrollHeight;
  }

  const carimboHora = () => `<span class="hora">${Comum.hora()}</span>`;

  // a tela de boas-vindas some na primeira mensagem
  function sairDaTelaInicial() {
    const inicial = conversa.querySelector(".boas-vindas");
    if (inicial) inicial.remove();
    document.querySelector(".sugestoes").hidden = false;
  }

  function adicionarUsuario(texto) {
    sairDaTelaInicial();
    const bolha = document.createElement("div");
    bolha.className = "mensagem usuario";
    bolha.textContent = texto;
    bolha.insertAdjacentHTML("beforeend", carimboHora());
    conversa.appendChild(bolha);
    rolarParaFim();
  }

  // Efeito "digitando": o texto da resposta aparece palavra por palavra
  function escreverAosPoucos(bolha) {
    if (reduzirMovimento) return;
    const caminhante = document.createTreeWalker(bolha, NodeFilter.SHOW_TEXT, {
      acceptNode: (no) => (no.parentElement.closest(".acoes, .continuar, .ver-mais, .hora, .etiqueta") || !no.textContent.trim()
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nos = [];
    while (caminhante.nextNode()) nos.push(caminhante.currentNode);
    const pedacos = nos.map((no) => {
      const palavras = no.textContent.split(/(\s+)/);
      no.textContent = "";
      // passos e a caixa de Atenção ficam escondidos até a primeira palavra deles chegar
      const bloco = no.parentElement.closest("li, p, .atencao, .exemplo") || no.parentElement;
      bloco.classList.add("por-escrever");
      return { no, palavras, bloco };
    });
    const total = pedacos.reduce((s, p) => s + p.palavras.length, 0);
    const porPasso = Math.max(1, Math.ceil(total / 60)); // termina em ~60 passos (~1 s), qualquer que seja o tamanho
    bolha.classList.add("escrevendo");
    let i = 0, j = 0;
    const passo = () => {
      for (let k = 0; k < porPasso && i < pedacos.length; k++) {
        pedacos[i].bloco.classList.remove("por-escrever");
        pedacos[i].no.textContent += pedacos[i].palavras[j++];
        if (j >= pedacos[i].palavras.length) { i++; j = 0; }
      }
      rolarParaFim();
      if (i < pedacos.length) setTimeout(passo, 16);
      else bolha.classList.remove("escrevendo");
    };
    passo();
  }

  function comAvatar(bolha) {
    const linha = document.createElement("div");
    linha.className = "linha-assistente";
    linha.innerHTML = `<span class="avatar">${Comum.LOGO}</span>`;
    linha.appendChild(bolha);
    return linha;
  }

  // Corpo da resposta: o essencial à mostra (passos + Atenção) e o resto em "ver mais"
  function corpoResposta(r) {
    if (!r.nomeTema) return formatarResposta(r.resposta);
    const p = partesResposta(r.resposta);
    let html = `<span class="etiqueta">${icone(r.tema)}${escapar(r.nomeTema)}</span>
      <p class="titulo">${escapar(p.titulo)}</p>
      <ol>${p.passos.map((passo) => `<li>${escapar(passo)}</li>`).join("")}</ol>`;
    if (r.alerta) html += `<div class="atencao"><strong>Atenção:</strong> ${escapar(r.alerta)}</div>`;
    let mais = "";
    if (p.exemplo) mais += `<div class="exemplo"><strong>Exemplo:</strong> ${escapar(p.exemplo)}</div>`;
    mais += p.extras.map((linha) => `<p>${escapar(linha)}</p>`).join("");
    if (r.referencia) {
      const url = escapar(r.referencia);
      mais += `<p class="referencia">Referência para consulta: <a href="${url}" target="_blank" rel="noopener">${url.replace(/^https?:\/\//, "")}</a></p>`;
    }
    if (mais) html += `<details class="ver-mais"><summary>Ver exemplo e mais dicas</summary>${mais}</details>`;
    return html;
  }

  function textoParaFala(r) {
    return [r.nomeTema, r.resposta, r.alerta && "Atenção: " + r.alerta].filter(Boolean).join(". ");
  }

  // Botões abaixo da resposta: ouvir, por que essa resposta, avaliação
  function criarAcoes(r, pergunta) {
    const acoes = document.createElement("div");
    acoes.className = "acoes";
    if (Comum.temVoz) {
      acoes.innerHTML += `<button type="button" data-acao="ouvir" aria-pressed="false">${icone("ouvir")}<span>Ouvir</span></button>`;
    }
    if (pergunta) {
      acoes.innerHTML += `<button type="button" data-acao="porque" aria-expanded="false" title="Por que essa resposta?">
        ${icone("porque")}<span>Por quê?</span></button>`;
    }
    acoes.innerHTML +=
      '<span class="separador"></span><span class="avaliar">Ajudou? ' +
      `<button type="button" class="so-icone" data-acao="sim" aria-label="Sim, ajudou" title="Ajudou">${icone("gostei")}</button>` +
      `<button type="button" class="so-icone" data-acao="nao" aria-label="Não ajudou" title="Não ajudou">${icone("gostei", "transform:rotate(180deg)")}</button></span>`;

    acoes.addEventListener("click", (e) => {
      const botao = e.target.closest("button");
      if (!botao) return;
      const acao = botao.dataset.acao;
      if (acao === "ouvir") {
        Comum.alternarFala(textoParaFala(r), botao);
        Comum.conquistar("ouviu");
      }
      if (acao === "porque") alternarExplicacao(botao, r, pergunta);
      if (acao === "sim" || acao === "nao") {
        // só agradece: nada é salvo nem enviado
        acoes.querySelector(".avaliar").textContent = acao === "sim" ? "Valeu! 💜"
          : "Valeu por avisar! Tente perguntar de outro jeito ou fale com um adulto de confiança.";
      }
    });
    return acoes;
  }

  function alternarExplicacao(botao, r, pergunta) {
    const bolha = botao.closest(".mensagem");
    const aberta = bolha.querySelector(".explicacao");
    if (aberta) {
      aberta.remove();
      botao.setAttribute("aria-expanded", "false");
      return;
    }
    Comum.conquistar("por-que");
    const palavras = Assistente.explicar(pergunta, 4, r.tema);
    const caixa = document.createElement("div");
    caixa.className = "explicacao";
    const pct = Math.round(r.confianca * 100);
    caixa.innerHTML = `
      <strong>Como eu escolhi o tema "${escapar(r.nomeTema)}"</strong>
      ${palavras.length ? `<div>Palavras da sua pergunta que mais pesaram:</div>
        <div class="palavras">${palavras.map((p) => `<span>${escapar(p)}</span>`).join("")}</div>` : ""}
      <div>Confiança do modelo no primeiro palpite: <strong>${pct}%</strong> entre os 8 temas</div>
      <div class="medidor" aria-hidden="true"><div style="width:${pct}%"></div></div>
      <small>Eu leio o texto sem acentos e troco gírias por termos da base (ex.: "zap" → "whatsapp").
      É um classificador treinado com exemplos, não uma pessoa: na dúvida, confirme com um adulto de confiança.</small>`;
    botao.closest(".acoes").before(caixa);
    botao.setAttribute("aria-expanded", "true");
  }

  function criarContinuar(tema) {
    const caixa = document.createElement("div");
    caixa.className = "continuar";
    (CONTINUAR[tema] || []).forEach(([texto, destino]) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = texto;
      chip.addEventListener("click", () => {
        adicionarUsuario(texto);
        responderComAtraso(() => mostrarResposta(Assistente.respostaDoTema(destino, 1), null));
      });
      caixa.appendChild(chip);
    });
    if (CONTINUAR[tema]) {
      caixa.insertAdjacentHTML("beforeend", `<a class="chip" href="simulador.html">${icone("simulador")}Treinar no simulador</a>`);
    }
    return caixa;
  }

  // Bolha completa do assistente para um resultado r
  function bolhaAssistente(r, pergunta) {
    const bolha = document.createElement("div");
    bolha.className = "mensagem assistente" + (r.tema === "dado_sensivel" ? " sensivel" : "");
    bolha.innerHTML = corpoResposta(r);
    if (r.nomeTema) {
      bolha.appendChild(criarContinuar(r.tema));
      bolha.appendChild(criarAcoes(r, pergunta));
    }
    return bolha;
  }

  function mostrarResposta(r, pergunta) {
    const bolha = bolhaAssistente(r, pergunta);
    bolha.insertAdjacentHTML("beforeend", carimboHora());
    conversa.appendChild(comAvatar(bolha));
    escreverAosPoucos(bolha);
    rolarParaFim();
  }

  // Confirmação quando o assistente está em dúvida entre dois temas
  function mostrarDuvida(r, pergunta) {
    const bolha = document.createElement("div");
    bolha.className = "mensagem assistente duvida";
    const [a, b] = r.duvida;
    bolha.innerHTML = `<p class="titulo">${icone("porque")} Não tenho certeza se entendi.</p>
      <p>Sua pergunta é sobre qual destes assuntos?</p>
      <div class="opcoes-duvida"></div>`;
    [a, b].forEach((tema) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.innerHTML = icone(tema) + escapar(MODELO.nomesTemas[tema]);
      chip.addEventListener("click", () => {
        bolha.querySelector(".opcoes-duvida").innerHTML = `<span class="selo neutro">Você escolheu: ${escapar(MODELO.nomesTemas[tema])}</span>`;
        mostrarResposta(Assistente.respostaDoTema(tema, r.confianca), pergunta);
      });
      bolha.querySelector(".opcoes-duvida").appendChild(chip);
    });
    conversa.appendChild(comAvatar(bolha));
    rolarParaFim();
  }

  function mostrarDigitando() {
    const bolha = document.createElement("div");
    bolha.className = "mensagem assistente digitando";
    bolha.setAttribute("aria-label", "Assistente digitando");
    bolha.innerHTML = "<span></span><span></span><span></span>";
    const linha = comAvatar(bolha);
    conversa.appendChild(linha);
    rolarParaFim();
    return linha;
  }

  function responderComAtraso(acao) {
    const digitando = mostrarDigitando();
    Promise.all([modeloPronto(), new Promise((ok) => setTimeout(ok, 550))]).then(() => {
      digitando.remove();
      acao();
    }, () => {
      digitando.textContent = "Não foi possível carregar o assistente. Recarregue a página (Ctrl+F5).";
    });
  }

  function enviar(pergunta) {
    pergunta = pergunta.trim();
    if (!pergunta) return;
    Comum.pararFala();
    Comum.conquistar("primeira-pergunta");
    // o aviso de privacidade some depois da primeira pergunta, para sobrar espaço para a conversa
    document.getElementById("aviso-chat").classList.add("recolhido");
    adicionarUsuario(pergunta);
    campo.value = "";
    responderComAtraso(() => {
      const r = Assistente.responder(pergunta);
      if (r.duvida) mostrarDuvida(r, pergunta);
      else mostrarResposta(r, pergunta);
    });
  }

  // Tela de boas-vindas no lugar da primeira mensagem
  function iniciar() {
    Comum.pararFala();
    conversa.innerHTML = `
      <section class="boas-vindas" aria-labelledby="titulo-boas-vindas">
        <div class="boas-vindas-logo" aria-hidden="true">${Comum.LOGO}</div>
        <h1 id="titulo-boas-vindas">Sobre o que você quer falar?</h1>
        <p>Conte o que aconteceu, do seu jeito. Eu te ajudo a descobrir se é golpe e o que fazer agora.</p>
        <div class="cartoes-inicio">
          ${CARTOES_INICIO.map(([ic, titulo, exemplo]) => `
            <button type="button" class="cartao-inicio" data-pergunta="${escapar(exemplo)}">
              <span class="cartao-inicio-icone">${icone(ic)}</span>
              <strong>${escapar(titulo)}</strong>
              <span>"${escapar(exemplo)}"</span>
            </button>`).join("")}
        </div>
      </section>`;
    conversa.querySelectorAll(".cartao-inicio").forEach((b) => b.addEventListener("click", () => enviar(b.dataset.pergunta)));
    document.querySelector(".sugestoes").hidden = true; // os cartões já fazem esse papel
  }

  SUGESTOES.forEach(([ic, rotulo, pergunta]) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.innerHTML = icone(ic) + escapar(rotulo);
    chip.title = pergunta;
    chip.addEventListener("click", () => enviar(pergunta));
    chips.appendChild(chip);
  });

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    enviar(campo.value);
  });
  document.getElementById("limpar").addEventListener("click", iniciar);

  iniciar();
  // outras páginas podem abrir o chat já com uma pergunta: chat.html?p=...
  const inicial = new URLSearchParams(location.search).get("p");
  if (inicial) enviar(inicial.slice(0, 300));
  else campo.focus();
})();
