// Simulador de golpes: conversas encenadas em que a pessoa escolhe o que responder.
(function () {
  const { escapar } = window.Formatar;
  const { Comum } = window;
  const CHAVE = "fe_simulador";

  // Cada nó tem mensagens do "golpista" e opções; uma opção leva a outro nó ou a um final.
  const CENARIOS = [
    {
      id: "parente",
      titulo: "Mãe com número novo",
      tema: "Golpe no WhatsApp",
      app: "whatsapp",
      contato: { nome: "Mãe ❤️ (número novo)", foto: "👩", info: "+55 11 9****-4821" },
      perguntaChat: "minha mãe mandou msg de outro número pedindo dinheiro",
      sinais: [
        "Número novo, mas com foto e jeito de falar de alguém conhecido.",
        "Pedido de dinheiro com urgência e uma desculpa para não ligar.",
        "Chave Pix no nome de outra pessoa.",
      ],
      inicio: "n1",
      nos: {
        n1: {
          msgs: ["Oi filho(a)! É a mãe 😘", "Troquei de número, pode salvar esse aqui. O outro deu problema."],
          opcoes: [
            { texto: "Oi mãe! Salvei aqui 😊", vai: "n2",
              retorno: ["dica", "Salvar o contato sem confirmar já é um risco. Golpistas usam a foto da pessoa para parecer de verdade."] },
            { texto: "Vou te ligar no número antigo pra confirmar.", vai: "escapou",
              retorno: ["ok", "Isso! Confirmar pelo número que você já tinha é o jeito mais seguro."] },
          ],
        },
        n2: {
          msgs: ["Filho(a), preciso de uma ajuda urgente 😥", "Tenho que pagar uma conta hoje e meu app do banco travou. Faz um Pix de R$ 350 pra mim? Te devolvo amanhã."],
          opcoes: [
            { texto: "Claro! Me manda a chave.", vai: "n3" },
            { texto: "Por que você não me liga?", vai: "n2b" },
            { texto: "Vou falar com você pessoalmente antes.", vai: "escapou",
              retorno: ["ok", "Perfeito. Pedido de dinheiro por mensagem sempre precisa de confirmação fora do chat."] },
          ],
        },
        n2b: {
          msgs: ["Tô numa reunião, não posso falar agora 🙏", "É rapidinho, por favor, senão vou pagar multa!"],
          opcoes: [
            { texto: "Tá bom, manda a chave.", vai: "n3" },
            { texto: "Sem ligação, sem Pix. Vou ligar no número antigo.", vai: "escapou",
              retorno: ["ok", "Mandou bem! A desculpa para não poder ligar é um dos sinais mais comuns do golpe."] },
          ],
        },
        n3: {
          msgs: ["A chave é 123.456.789-00, está no nome de Carlos Souza, é do rapaz da loja 😉"],
          opcoes: [
            { texto: "Fazer o Pix agora.", vai: "caiu" },
            { texto: "Espera... esse nome não é o seu. Vou confirmar antes.", vai: "escapou",
              retorno: ["ok", "Boa observação! Chave Pix no nome de outra pessoa é um alerta vermelho."] },
          ],
        },
      },
    },
    {
      id: "suporte",
      titulo: "Suporte do jogo",
      tema: "Falso suporte",
      app: "jogo",
      contato: { nome: "Suporte Oficial FreeGame ✔", foto: "🎮", info: "mensagem direta no jogo" },
      perguntaChat: "alguém disse que é do suporte do jogo e pediu um código",
      sinais: [
        "Ameaça de banir a conta para te deixar com medo.",
        "Pedido de código que chegou por SMS ou e-mail.",
        "Contato pelo privado: o suporte de verdade não começa a conversa assim.",
      ],
      inicio: "n1",
      nos: {
        n1: {
          msgs: ["⚠️ Detectamos atividade suspeita na sua conta.", "Ela será BANIDA em 24 horas se você não verificar sua identidade."],
          opcoes: [
            { texto: "O quê?! Como eu resolvo?", vai: "n2",
              retorno: ["dica", "Repare na pressão: golpistas usam medo e prazo curto para você não pensar."] },
            { texto: "Vou conferir no app oficial do jogo.", vai: "escapou",
              retorno: ["ok", "Isso aí! Procurar o suporte pelo canal oficial é sempre o caminho certo."] },
          ],
        },
        n2: {
          msgs: ["Vamos enviar um código de verificação para o seu celular.", "Assim que chegar, me passa aqui pra eu liberar sua conta."],
          opcoes: [
            { texto: "Chegou: 482913", vai: "caiu" },
            { texto: "Suporte de verdade não pede código. Não vou passar.", vai: "escapou",
              retorno: ["ok", "Exatamente! Esse código é a chave da sua conta: quem tem ele, entra no seu lugar."] },
          ],
        },
      },
    },
    {
      id: "loja",
      titulo: "Tênis barato na rede social",
      tema: "Pix e compras",
      app: "instagram",
      contato: { nome: "@tenis.baratos.oficial", foto: "👟", info: "conta criada há 2 semanas" },
      perguntaChat: "paguei por pix e o vendedor sumiu",
      sinais: [
        "Preço muito abaixo do normal.",
        "Pressa: \"só hoje\", \"em 10 minutos\".",
        "Só aceita Pix, sem site nem forma de pagamento com proteção.",
        "Perfil novo, sem avaliações de clientes.",
      ],
      inicio: "n1",
      nos: {
        n1: {
          msgs: ["Oi! Vi que você curtiu o tênis 😍", "Hoje ele sai de R$ 600 por R$ 149 🔥 Só restam 2 pares!"],
          opcoes: [
            { texto: "Quero! Como eu pago?", vai: "n2" },
            { texto: "Vou ver as avaliações e se a loja existe mesmo.", vai: "n1b",
              retorno: ["ok", "Ótimo hábito: pesquisar a loja antes de comprar evita muito golpe."] },
          ],
        },
        n1b: {
          msgs: ["Somos novos, ainda não temos avaliações 😅", "Mas pode confiar, já vendemos pra muita gente!"],
          opcoes: [
            { texto: "Então não vou comprar, obrigado.", vai: "escapou" },
            { texto: "Tá, vou arriscar. Como pago?", vai: "n2" },
          ],
        },
        n2: {
          msgs: ["Só aceitamos Pix 😉 Chave: tenisbaratos@email.com", "Paga em até 10 minutos senão perde a promoção ⏰"],
          opcoes: [
            { texto: "Pagar rápido pra não perder.", vai: "caiu" },
            { texto: "Prefiro pagar num site com proteção ao comprador.", vai: "n3" },
          ],
        },
        n3: {
          msgs: ["Não temos site, só Pix mesmo.", "Se não pagar agora vou vender pra outra pessoa."],
          opcoes: [
            { texto: "Então deixa pra lá.", vai: "escapou",
              retorno: ["ok", "Isso! Loja que só aceita Pix e apressa a compra é um grande sinal de golpe."] },
            { texto: "Tá bom, vou pagar.", vai: "caiu" },
          ],
        },
      },
    },
  ];

  const FINAIS = {
    escapou: ["ok", "🎉 Você escapou do golpe!"],
    caiu: ["ruim", "😬 Você caiu no golpe."],
  };

  const $ = (id) => document.getElementById(id);
  let cenario = null;
  let carregando = false;

  function resultados() {
    try {
      return JSON.parse(Comum.ler(CHAVE, "{}")) || {};
    } catch (e) {
      return {};
    }
  }

  function mostrarLista() {
    Comum.pararFala();
    const feitos = resultados();
    $("cenarios").innerHTML = CENARIOS.map((c) => {
      const r = feitos[c.id];
      const selo = r === "escapou" ? `<span class="selo ok">${Comum.icone("seguro")}Você escapou</span>`
        : r === "caiu" ? `<span class="selo ruim">${Comum.icone("golpe")}Você caiu, tente de novo</span>`
          : '<span class="selo neutro">Ainda não jogado</span>';
      return `<article class="cartao card-dica">
        <div class="icone-emoji" aria-hidden="true">${c.contato.foto}</div>
        <h2>${escapar(c.titulo)}</h2>
        <div>Tema: <strong>${escapar(c.tema)}</strong></div>
        <div>${selo}</div>
        <div class="botoes"><button class="botao-principal" type="button" data-id="${c.id}">Começar</button></div>
      </article>`;
    }).join("");
    $("lista").hidden = false;
    $("jogo").hidden = true;
  }

  function bolha(classe, html) {
    const div = document.createElement("div");
    div.className = classe;
    div.innerHTML = html;
    $("tela").appendChild(div);
    div.scrollIntoView({ block: "nearest", behavior: "smooth" });
    return div;
  }

  const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));

  // aparência de cada app: status no topo e os "✓✓" de lido nas mensagens enviadas
  const STATUS = { whatsapp: "online", jogo: "online no servidor", instagram: "Ativo agora" };
  const TICKS = '<svg class="ticks" viewBox="0 0 18 12" aria-label="lida"><path d="M1 6.5 4.5 10 11 2.5M7 8.5 8.5 10 16.5 1.5"/></svg>';
  const meta = (enviada) => `<span class="meta">${Comum.hora()}${enviada ? TICKS : ""}</span>`;
  const status = (texto) => ($("info-contato").textContent = texto);

  async function irPara(destino) {
    $("opcoes").innerHTML = "";
    if (destino === "escapou" || destino === "caiu") return finalizar(destino);
    const no = cenario.nos[destino];
    carregando = true;
    for (const msg of no.msgs) {
      status("digitando…");
      const digitando = bolha("mensagem assistente digitando", "<span></span><span></span><span></span>");
      await esperar(650);
      digitando.remove();
      bolha("mensagem assistente", `<p>${escapar(msg)}</p>${meta(false)}`);
    }
    status(STATUS[cenario.app]);
    carregando = false;
    no.opcoes.forEach((op) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = op.texto;
      b.addEventListener("click", () => escolher(op));
      $("opcoes").appendChild(b);
    });
    $("opcoes").querySelector("button").focus();
  }

  function escolher(op) {
    if (carregando) return;
    bolha("mensagem usuario", `<p>${escapar(op.texto)}</p>${meta(true)}`);
    if (op.retorno) bolha(`retorno ${op.retorno[0]}`, `💡 ${escapar(op.retorno[1])}`);
    irPara(op.vai);
  }

  function finalizar(resultado) {
    const feitos = resultados();
    feitos[cenario.id] = resultado;
    Comum.gravar(CHAVE, JSON.stringify(feitos));
    const [tipo, titulo] = FINAIS[resultado];
    if (resultado === "escapou") {
      Comum.confete();
      Comum.conquistar("escapou-1");
      if (CENARIOS.every((c) => feitos[c.id] === "escapou")) Comum.conquistar("escapou-todos");
    }
    const explicacao = resultado === "caiu"
      ? "Na vida real, o dinheiro ou a conta iriam para o golpista. Veja os sinais que apareceram:"
      : "Você percebeu o golpe a tempo. Estes eram os sinais da conversa:";
    bolha(`retorno ${tipo}`, `<strong>${titulo}</strong><br>${explicacao}
      <ul>${cenario.sinais.map((s) => `<li>${escapar(s)}</li>`).join("")}</ul>`);
    $("opcoes").innerHTML = `
      <button type="button" id="de-novo" class="botao-principal">${Comum.icone("recomecar")}Jogar de novo</button>
      <a class="botao-secundario" href="chat.html?p=${encodeURIComponent(cenario.perguntaChat)}">${Comum.icone("chat")}Ver a orientação no chat</a>`;
    $("de-novo").addEventListener("click", () => comecar(cenario.id));
  }

  function comecar(id) {
    cenario = CENARIOS.find((c) => c.id === id);
    $("lista").hidden = true;
    $("jogo").hidden = false;
    $("titulo-jogo").textContent = cenario.titulo;
    $("foto").textContent = cenario.contato.foto;
    $("contato").textContent = cenario.contato.nome;
    $("celular").dataset.app = cenario.app;
    $("contato").title = cenario.contato.info;
    status(STATUS[cenario.app]);
    $("tela").innerHTML = "";
    window.scrollTo(0, 0);
    irPara(cenario.inicio);
  }

  $("cenarios").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-id]");
    if (b) comecar(b.dataset.id);
  });
  $("voltar").addEventListener("click", mostrarLista);

  mostrarLista();
})();
