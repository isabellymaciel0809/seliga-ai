// Quiz "É golpe ou não?": cada mensagem aparece com a cara do canal de verdade (SMS, e-mail, notificação...).
(function () {
  const { escapar } = window.Formatar;
  const { Comum } = window;
  const icone = Comum.icone;

  // canal define o desenho: sms, notificacao, whatsapp, email, grupo, jogo, wifi, permissao
  const MENSAGENS = [
    {
      canal: "sms", de: "+55 11 4***-8821", golpe: true,
      texto: "ENTREGAS: sua encomenda está retida. Pague a taxa de R$ 4,90 em rastreio-entrega-rapida.net para liberar.",
      explicacao: "O endereço do site não é o oficial, a taxa é pequena para você pagar sem pensar e você nem estava esperando encomenda.",
    },
    {
      canal: "notificacao", app: "Rede social", contexto: "logo depois de você tentar entrar na sua conta", golpe: false,
      texto: "Seu código de login é 482913. Não compartilhe esse código com ninguém.",
      explicacao: "Se foi você que pediu o código, a mensagem é normal. O perigo é passar o código para outra pessoa. Se chegar um código que você não pediu, alguém está tentando entrar: troque a senha.",
    },
    {
      canal: "whatsapp", de: "+55 11 9****-3307", nome: "Tia Rose (número novo)", golpe: true,
      texto: "Oi, é a tia Rose! Esse é meu número novo. Me empresta R$ 500 até sexta? É urgente 🙏",
      explicacao: "Número novo + pedido de dinheiro urgente é o golpe do falso parente. Ligue no número antigo da pessoa antes de qualquer coisa.",
    },
    {
      canal: "email", de: "promocoes@premios-brasil.com", assunto: "🎁 PARABÉNS! Você foi sorteado(a)", botao: "Resgatar meu prêmio", golpe: true,
      texto: "Você ganhou um celular novo! Clique no botão abaixo em até 1 hora para resgatar seu prêmio.",
      explicacao: "Prêmio de um sorteio que você não participou, prazo curto e link para clicar. É phishing para roubar seus dados.",
    },
    {
      canal: "grupo", grupo: "3º B · Turma 2026", autor: "Prof.ª Ana (contato salvo)", golpe: false,
      texto: "Pessoal, a prova foi adiada para quinta. Confiram o aviso no portal da escola.",
      explicacao: "Vem de alguém conhecido, não pede nada e ainda indica um canal oficial para você conferir.",
    },
    {
      canal: "jogo", de: "Equipe Oficial", golpe: true,
      texto: "Sua conta será banida por uso de trapaça. Para verificar, me passe seu login e senha agora.",
      explicacao: "Nenhum suporte de verdade pede sua senha. A ameaça de banimento serve para te assustar.",
    },
    {
      canal: "notificacao", app: "Seu banco", contexto: "logo depois de você pagar o lanche", golpe: false,
      texto: "Pix enviado: R$ 20,00 para Lanchonete Bom Sabor.",
      explicacao: "É só o comprovante de algo que você fez, dentro do app oficial, sem link e sem pedir nada.",
    },
    {
      canal: "grupo", grupo: "Família 💛", autor: "Tio Carlos", encaminhada: true, golpe: true,
      texto: "URGENTE!!! O WhatsApp vai ficar pago a partir de amanhã! Compartilhe com todos os seus contatos!",
      explicacao: "É boato: sem fonte, cheio de urgência e pedindo para espalhar. Antes de repassar, procure a notícia em sites confiáveis.",
    },
    {
      canal: "wifi", rede: "Shopping_WiFi_Gratis", campos: ["CPF", "Telefone", "Senha da rede social"], golpe: true,
      texto: "Para conectar, informe seus dados:",
      explicacao: "Wi-Fi nenhum precisa da senha das suas redes sociais. Confirme o nome da rede com o shopping e prefira o 4G.",
    },
    {
      canal: "permissao", app: "Mapas", golpe: false,
      texto: "Permitir que \"Mapas\" acesse sua localização?",
      opcoes: ["Durante o uso do app", "Somente desta vez", "Não permitir"],
      explicacao: "Um app de mapas precisa da localização para funcionar, e a opção \"durante o uso\" é a mais segura. Desconfie quando a permissão não tem relação com o app.",
    },
  ];

  const NOMES_CANAL = {
    sms: "SMS", notificacao: "Notificação", whatsapp: "WhatsApp", email: "E-mail",
    grupo: "Grupo", jogo: "Chat do jogo", wifi: "Rede Wi-Fi", permissao: "Permissão do celular",
  };

  // ---------- desenho de cada canal ----------
  function desenhar(m) {
    const e = escapar;
    switch (m.canal) {
      case "sms":
        return `<div class="mock mock-sms"><div class="mock-topo">${icone("chat")}<div><strong>${e(m.de)}</strong><small>Mensagem de texto · agora</small></div></div>
          <div class="mock-balao">${e(m.texto)}</div></div>`;
      case "notificacao":
        return `<div class="mock mock-notificacao"><div class="mock-app">${icone(m.app === "Seu banco" ? "pix" : "senha")}</div>
          <div><div class="mock-linha"><strong>${e(m.app)}</strong><small>agora</small></div><p>${e(m.texto)}</p></div></div>
          <p class="mock-contexto">${icone("porque")} Contexto: ${e(m.contexto)}</p>`;
      case "whatsapp":
        return `<div class="mock mock-whats"><div class="mock-topo"><span class="mock-foto">👩</span><div><strong>${e(m.nome)}</strong><small>${e(m.de)} · online</small></div></div>
          <div class="mock-conversa"><div class="mock-balao">${e(m.texto)}<span class="mock-hora">${Comum.hora()}</span></div></div></div>`;
      case "email":
        return `<div class="mock mock-email"><div class="mock-cabecalho"><span class="mock-foto">${icone("phishing")}</span>
          <div><strong>${e(m.de)}</strong><small>para mim · agora</small></div></div>
          <h3>${e(m.assunto)}</h3><p>${e(m.texto)}</p><span class="mock-botao-falso">${e(m.botao)}</span></div>`;
      case "grupo":
        return `<div class="mock mock-whats"><div class="mock-topo"><span class="mock-foto">👥</span><div><strong>${e(m.grupo)}</strong><small>grupo</small></div></div>
          <div class="mock-conversa"><div class="mock-balao">${m.encaminhada ? `<em class="mock-encaminhada">↪ Encaminhada com frequência</em>` : ""}
          <b class="mock-autor">${e(m.autor)}</b>${e(m.texto)}<span class="mock-hora">${Comum.hora()}</span></div></div></div>`;
      case "jogo":
        return `<div class="mock mock-jogo"><div class="mock-topo">${icone("simulador")}<div><strong>Mensagens diretas</strong><small>dentro do jogo</small></div></div>
          <div class="mock-conversa"><div class="mock-jogo-msg"><span class="mock-foto">🛡️</span><div>
          <strong>${e(m.de)} <span class="mock-selo">✔ OFICIAL</span></strong><p>${e(m.texto)}</p></div></div></div></div>`;
      case "wifi":
        return `<div class="mock mock-wifi"><div class="mock-wifi-topo">${icone("wifi")}<strong>${e(m.rede)}</strong><small>Rede aberta · sem senha</small></div>
          <p>${e(m.texto)}</p>${m.campos.map((c) => `<span class="mock-campo">${e(c)}</span>`).join("")}<span class="mock-botao-falso">Conectar</span></div>`;
      case "permissao":
        return `<div class="mock mock-permissao"><div class="mock-app">${icone("privacidade")}</div><h3>${e(m.texto)}</h3>
          <p>O app usa sua localização para mostrar rotas e lugares perto de você.</p>
          ${m.opcoes.map((o) => `<span class="mock-opcao">${e(o)}</span>`).join("")}</div>`;
      default:
        return `<div class="mock"><p>${e(m.texto)}</p></div>`;
    }
  }

  const lugar = document.getElementById("pergunta-quiz");
  const barra = document.getElementById("barra");
  let atual = 0;
  let acertos = 0;

  function mostrarPergunta() {
    const m = MENSAGENS[atual];
    barra.style.width = `${(atual / MENSAGENS.length) * 100}%`;
    lugar.innerHTML = `
      <p class="passo">Mensagem ${atual + 1} de ${MENSAGENS.length} · ${NOMES_CANAL[m.canal]}</p>
      <div class="mock-moldura">${desenhar(m)}</div>
      <div class="respostas-quiz">
        <button type="button" data-resposta="golpe">${icone("golpe")}É golpe</button>
        <button type="button" data-resposta="seguro">${icone("seguro")}Parece seguro</button>
      </div>
      <div id="resultado" aria-live="polite"></div>`;
    lugar.querySelector("button").focus();
  }

  function responder(botao) {
    const m = MENSAGENS[atual];
    const resposta = botao.dataset.resposta;
    const certo = (resposta === "golpe") === m.golpe;
    if (certo) acertos++;
    // destaca a escolha e a resposta certa
    lugar.querySelectorAll(".respostas-quiz button").forEach((b) => {
      b.disabled = true;
      const eraCerta = (b.dataset.resposta === "golpe") === m.golpe;
      if (b === botao) b.classList.add(certo ? "acertou" : "errou");
      else if (eraCerta) b.classList.add("era-certa");
    });
    const veredito = m.golpe ? "Era golpe." : "Era uma mensagem normal.";
    document.getElementById("resultado").innerHTML = `
      <div class="retorno ${certo ? "ok" : "ruim"}" style="margin-top:12px">
        <strong>${certo ? "✅ Acertou!" : "❌ Errou."} ${veredito}</strong><br>${escapar(m.explicacao)}
      </div>
      <div class="botoes">
        <button type="button" class="botao-principal" id="proxima">${atual + 1 < MENSAGENS.length ? "Próxima →" : "Ver resultado"}</button>
      </div>`;
    document.getElementById("proxima").focus();
  }

  // card do resultado para baixar ou compartilhar (1080 × 1350)
  function cardResultado(nivel) {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    // fundo branco com faixa vermelha no topo e no rodapé, placar em vermelho e texto preto
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1080, 1350);
    const faixa = ctx.createLinearGradient(0, 0, 1080, 0);
    faixa.addColorStop(0, "#da291c");
    faixa.addColorStop(1, "#9e1a10");
    ctx.fillStyle = faixa;
    ctx.fillRect(0, 0, 1080, 24);
    ctx.fillRect(0, 1150, 1080, 200);
    const fonte = '"Nunito", "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = "#111111";
    ctx.textAlign = "center";
    ctx.font = `800 52px ${fonte}`;
    ctx.fillText("Quiz: é golpe ou não?", 540, 220);
    ctx.font = `160px ${fonte}`;
    ctx.fillText(nivel[0], 540, 470);
    ctx.fillStyle = "#da291c";
    ctx.font = `900 260px ${fonte}`;
    ctx.fillText(`${acertos}/${MENSAGENS.length}`, 540, 790);
    ctx.fillStyle = "#111111";
    ctx.font = `800 64px ${fonte}`;
    ctx.fillText(nivel[1], 540, 920);
    ctx.fillStyle = "#4a4a52";
    ctx.font = `600 40px ${fonte}`;
    ctx.fillText("Você consegue reconhecer um golpe?", 540, 1010);
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 44px ${fonte}`;
    const largura = ctx.measureText("Se Liga AI").width;
    Comum.desenharEscudo(ctx, 540 - (largura + 64) / 2 - 6, 1220, 58);
    ctx.fillText("Se Liga AI", 540 + 32, 1265);
    return canvas;
  }

  function salvarCard(nivel, compartilhar) {
    cardResultado(nivel).toBlob(async (blob) => {
      if (!blob) return;
      const arquivo = new File([blob], "meu-resultado-se-liga.png", { type: "image/png" });
      if (compartilhar && navigator.canShare && navigator.canShare({ files: [arquivo] })) {
        try {
          await navigator.share({ files: [arquivo], text: `Tirei ${acertos}/${MENSAGENS.length} no quiz "É golpe ou não?" do Se Liga AI 🛡️` });
          return;
        } catch (erro) {
          if (erro.name === "AbortError") return;
        }
      }
      const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: arquivo.name });
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }, "image/png");
  }

  function mostrarResultado() {
    barra.style.width = "100%";
    const nivel = acertos >= 9 ? ["🏆", "Mestre(a) da segurança!", "Você reconhece golpe de longe. Que tal desafiar seus amigos?"]
      : acertos >= 6 ? ["👍", "Mandou bem!", "Você já percebe os principais sinais. Treine no simulador para ficar ainda melhor."]
        : ["💪", "Dá para melhorar!", "Golpes são feitos para enganar mesmo. Veja as dicas e tente de novo."];
    Comum.gravar("fe_quiz", String(acertos));
    Comum.conquistar("quiz-feito");
    if (acertos >= 9) {
      Comum.confete();
      Comum.conquistar("quiz-mestre");
    }
    lugar.innerHTML = `
      <div class="cartao resultado-quiz">
        <div class="resultado-emoji" aria-hidden="true">${nivel[0]}</div>
        <div class="placar">${acertos}/${MENSAGENS.length}</div>
        <h2>${nivel[1]}</h2>
        <p>${nivel[2]}</p>
        <div class="botoes" style="justify-content:center">
          <button type="button" class="botao-principal" id="baixar-resultado">${icone("baixar")}Baixar meu resultado</button>
          ${navigator.share ? `<button type="button" class="botao-secundario" id="compartilhar-resultado">${icone("compartilhar")}Desafiar amigos</button>` : ""}
        </div>
        <div class="botoes" style="justify-content:center">
          <button type="button" class="botao-secundario" id="refazer">${icone("recomecar")}Refazer</button>
          <a class="botao-secundario" href="simulador.html">${icone("simulador")}Ir para o simulador</a>
          <a class="botao-secundario" href="dicas.html">${icone("dicas")}Ver dicas</a>
        </div>
      </div>`;
    document.getElementById("baixar-resultado").addEventListener("click", () => salvarCard(nivel, false));
    const compartilhar = document.getElementById("compartilhar-resultado");
    if (compartilhar) compartilhar.addEventListener("click", () => salvarCard(nivel, true));
    document.getElementById("refazer").addEventListener("click", () => {
      atual = 0;
      acertos = 0;
      mostrarPergunta();
    });
  }

  lugar.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    if (b.dataset.resposta) responder(b);
    if (b.id === "proxima") {
      atual++;
      if (atual < MENSAGENS.length) mostrarPergunta();
      else mostrarResultado();
    }
  });

  window.QuizCard = { cardResultado }; // usado nos testes
  mostrarPergunta();
})();
