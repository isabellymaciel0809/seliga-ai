// Página inicial: pergunta rápida, seções que surgem ao rolar, frase que acende,
// celular que conta como o assistente pensa (passos 4 a 6 com o modelo de verdade) e números que contam sozinhos.
(function () {
  const { Comum, METRICAS: M, Formatar } = window;
  let Assistente = null; // carregado depois que a página aparece (ver "carregar o modelo" abaixo)
  const { escapar, partesResposta } = Formatar;
  const icone = Comum.icone;
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);

  // ---------- capa ----------
  $("capa-escudo").innerHTML = `<div class="anel anel-1"></div><div class="anel anel-2"></div>${Comum.LOGO}`;
  // escudo flutuando e anéis girando só animam enquanto a capa está na tela
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => $("capa-escudo").classList.toggle("pausado", !e.isIntersecting))
      .observe($("capa-escudo"));
  }
  $("pergunta-rapida").addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = $("pergunta-inicio").value.trim();
    if (texto) location.href = "chat.html?p=" + encodeURIComponent(texto.slice(0, 300));
  });

  // as seções que surgem ao rolar (.revelar) são controladas pelo comum.js; a capa, pelo CSS

  // ---------- frase que acende palavra por palavra ----------
  const frase = $("frase");
  const texto = $("frase-texto");
  [...texto.childNodes].forEach((no) => {
    if (no.nodeType === Node.TEXT_NODE) {
      const partes = no.textContent.split(/(\s+)/).filter(Boolean);
      const fragmento = document.createDocumentFragment();
      partes.forEach((p) => {
        if (/^\s+$/.test(p)) fragmento.append(" ");
        else fragmento.append(Object.assign(document.createElement("span"), { className: "palavra", textContent: p }));
      });
      no.replaceWith(fragmento);
    } else {
      no.classList.add("palavra");
    }
  });
  const palavras = [...texto.querySelectorAll(".palavra")];

  function acenderFrase() {
    const caixa = frase.getBoundingClientRect();
    const percurso = caixa.height - window.innerHeight;
    const progresso = Math.min(1, Math.max(0, -caixa.top / (percurso || 1)));
    const acesas = Math.round(progresso * 1.15 * palavras.length);
    palavras.forEach((p, i) => p.classList.toggle("acesa", i < acesas));
  }

  // ---------- celular que conta a história ----------
  const balao = (quem, html, extra = "") => `<div class="balao ${quem} ${extra}">${html}</div>`;
  const cabecalho = `<div class="tela-topo"><span class="tela-logo">${Comum.LOGO}</span>Fica Esperto AI</div>`;

  function telaProtecao() {
    const pergunta = "meu cpf é 123.456.789-00";
    const r = Assistente.responder(pergunta);
    const [titulo, resto] = r.resposta.split("\n");
    return balao("eu", escapar(pergunta)) +
      balao("ia", `<strong>${escapar(titulo)}</strong><br>${escapar(resto || "")}`, "alerta") +
      `<div class="selo-tela perigo">${icone("cadeado")} Dado pessoal bloqueado</div>`;
  }

  function telaGirias() {
    const pergunta = "um cara no zap pediu o código q chegou no meu cel";
    const marcarOriginal = escapar(pergunta).replace(/\bzap\b/, "<mark>zap</mark>").replace("q chegou", "<mark>q chegou</mark>");
    const normalizado = escapar(Assistente.normalizar(pergunta))
      .replace("whatsapp", "<mark>whatsapp</mark>").replace("codigo de verificacao", "<mark>codigo de verificacao</mark>");
    return balao("eu", marcarOriginal) +
      `<div class="cartao-tela"><small>O assistente entende como:</small><p>${normalizado}</p></div>` +
      `<div class="selo-tela">${icone("seguro")} Sem acentos e com gírias traduzidas</div>`;
  }

  function telaEscopo() {
    const pergunta = "qual o resultado do jogo?";
    const r = Assistente.responder(pergunta);
    return balao("eu", escapar(pergunta)) +
      balao("ia", escapar(r.resposta.split("\n")[0])) +
      `<div class="selo-tela">${icone("porque")} ${r.tema === "fora_do_escopo" ? "Fora do escopo: não inventa resposta" : "Respondeu"}</div>`;
  }

  function telaClassificacao() {
    const pergunta = "chegou um link no zap dizendo que ganhei um prêmio";
    const top = Assistente.ranking(pergunta).slice(0, 4);
    return balao("eu", escapar(pergunta)) +
      `<div class="cartao-tela"><small>Chance de cada tema, calculada agora pelo modelo:</small>
        ${top.map((t, i) => `<div class="prob${i === 0 ? " primeiro" : ""}">
          <span>${icone(t.tema)}${escapar(t.nome)}</span><b>${Math.round(t.probabilidade * 100)}%</b>
          <i style="--largura:${Math.max(2, t.probabilidade * 100)}%"></i></div>`).join("")}
      </div>`;
  }

  function telaConfirmacao() {
    const pergunta = "uma pessoa se passou por um amigo no aplicativo";
    const r = Assistente.responder(pergunta);
    const temas = r.duvida || [r.tema];
    return balao("eu", escapar(pergunta)) +
      balao("ia", `<strong>Não tenho certeza se entendi.</strong><br>Sua pergunta é sobre qual destes assuntos?
        <span class="opcoes-tela">${temas.map((t) => `<span>${icone(t)}${escapar(window.MODELO.nomesTemas[t])}</span>`).join("")}</span>`);
  }

  function telaResposta() {
    const pergunta = "Paguei por Pix e o vendedor sumiu";
    const r = Assistente.responder(pergunta);
    const p = partesResposta(r.resposta);
    return balao("eu", escapar(pergunta)) +
      balao("ia", `<span class="etiqueta">${icone(r.tema)}${escapar(r.nomeTema)}</span>
        <strong>${escapar(p.titulo)}</strong>
        <ol>${p.passos.map((x) => `<li>${escapar(x)}</li>`).join("")}</ol>
        <div class="atencao"><strong>Atenção:</strong> ${escapar(r.alerta)}</div>`);
  }

  const telas = [telaProtecao, telaGirias, telaEscopo, telaClassificacao, telaConfirmacao, telaResposta];
  const passos = [...document.querySelectorAll(".passo-historia")];
  let passoAtual = 1;
  function ativarPasso(numero) {
    passoAtual = Number(numero);
    passos.forEach((p) => p.classList.toggle("ativo", p.dataset.passo === String(numero)));
    document.querySelectorAll(".tela-passo").forEach((t) => t.classList.toggle("ativa", t.dataset.passo === String(numero)));
  }
  ativarPasso(1);
  $("celular-telas").innerHTML = `<div class="tela-passo ativa">${cabecalho}<div class="tela-conversa"><p class="carregando-tela">Carregando o assistente…</p></div></div>`;

  // ---------- carregar o modelo (780 KB) sem travar a página ----------
  const carregarScript = (src) => new Promise((ok, falha) => {
    const s = Object.assign(document.createElement("script"), { src, onload: ok, onerror: falha });
    document.body.appendChild(s);
  });
  let carregamento = null;
  function carregarModelo() {
    if (!carregamento) {
      carregamento = carregarScript("js/modelo.js").then(() => carregarScript("js/assistente.js")).then(() => {
        Assistente = window.Assistente;
        $("celular-telas").innerHTML = telas.map((montar, i) =>
          `<div class="tela-passo" data-passo="${i + 1}">${cabecalho}<div class="tela-conversa">${montar()}</div></div>`).join("");
        ativarPasso(passoAtual);
      }).catch(() => {
        $("celular-telas").querySelector(".carregando-tela").textContent = "Não foi possível carregar o assistente.";
      });
    }
    return carregamento;
  }
  // começa quando o navegador estiver livre, ou antes, se a pessoa rolar até perto do celular
  const quandoLivre = window.requestIdleCallback || ((f) => setTimeout(f, 300));
  window.addEventListener("load", () => quandoLivre(carregarModelo, { timeout: 2000 }), { once: true });
  if ("IntersectionObserver" in window) {
    const perto = new IntersectionObserver((e) => {
      if (e.some((x) => x.isIntersecting)) {
        carregarModelo();
        perto.disconnect();
      }
    }, { rootMargin: "800px 0px" });
    perto.observe(document.querySelector(".historia"));
  }
  if ("IntersectionObserver" in window) {
    const observadorPassos = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => e.isIntersecting && ativarPasso(e.target.dataset.passo));
    }, {
      // no computador, o passo ativo é o que está no meio da tela; no celular, o que está na faixa abaixo do aparelho
      rootMargin: window.matchMedia("(max-width: 900px)").matches ? "-56% 0px -22% 0px" : "-45% 0px -45% 0px",
    });
    passos.forEach((p) => observadorPassos.observe(p));
  }

  // ---------- números que contam sozinhos e barras de comparação ----------
  if (M) {
    const cego = M.conjuntos[M.conjuntos.length - 1]; // teste cego: a medida mais honesta
    const flesch = M.clareza["Assistente adaptado"]["Flesch (pt)"];
    const numeros = [
      { de: 0, ate: cego.assistente.certos, texto: (v) => `${v} de ${cego.assistente.total}`,
        rotulo: "perguntas novas respondidas corretamente no teste cego", detalhe: `o chatbot de exemplo acertou ${cego.baseline.certos}` },
      { de: M.fallbackTeste.baseline, ate: M.fallbackTeste.assistente, texto: (v) => `${v}`,
        rotulo: "perguntas sem resposta no teste oficial", detalhe: `o chatbot de exemplo deixou ${M.fallbackTeste.baseline} sem resposta` },
      { de: 0, ate: flesch, decimais: 1, texto: (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        rotulo: "de 100 em facilidade de leitura", detalhe: "nível \"muito fácil\" (o exemplo: 30,6, \"difícil\")" },
    ];
    $("numeros").innerHTML = numeros.map((n, i) => `
      <div class="numero revelar" data-i="${i}">
        <div class="valor">${n.texto(n.ate)}</div>
        <div class="rotulo">${n.rotulo}</div>
        <div class="detalhe">${n.detalhe}</div>
      </div>`).join("");

    const pct = (c) => Math.round((100 * c.certos) / c.total);
    $("barras").innerHTML = M.conjuntos.map((c) => `
      <div class="barra-grupo">
        <div class="barra-nome">${escapar(c.nome)}</div>
        <div class="barra-linha"><i class="base" style="--largura:${pct(c.baseline)}%"></i><b>${pct(c.baseline)}%</b></div>
        <div class="barra-linha"><i class="nosso" style="--largura:${pct(c.assistente)}%"></i><b>${pct(c.assistente)}%</b></div>
      </div>`).join("");

    const contar = (el) => {
      const n = numeros[Number(el.dataset.i)];
      const alvo = el.querySelector(".valor");
      if (reduzirMovimento) return;
      const inicio = performance.now();
      const passo = (agora) => {
        const t = Math.min(1, (agora - inicio) / 1300);
        const k = 1 - Math.pow(1 - t, 3);
        const v = n.de + (n.ate - n.de) * k;
        alvo.textContent = n.texto(n.decimais ? Math.round(v * 10) / 10 : Math.round(v));
        if (t < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    };
    const comparativo = document.querySelector(".comparativo");
    if ("IntersectionObserver" in window && !reduzirMovimento) {
      const observadorNumeros = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => {
          if (!e.isIntersecting) return;
          if (e.target.classList.contains("numero")) contar(e.target);
          e.target.classList.add("visivel");
          observadorNumeros.unobserve(e.target);
        });
      }, { threshold: 0.4 });
      document.querySelectorAll(".numero").forEach((el) => observadorNumeros.observe(el));
      observadorNumeros.observe(comparativo);
    } else {
      document.querySelectorAll(".numero").forEach((el) => el.classList.add("visivel"));
      comparativo.classList.add("visivel");
    }
  }

  // ---------- seu progresso (conquistas) ----------
  function mostrarProgresso() {
    const feitas = Comum.conquistas();
    const total = Comum.CONQUISTAS.length;
    const obtidas = Comum.CONQUISTAS.filter((c) => feitas[c.id]).length;
    $("progresso-numero").textContent = `${obtidas} de ${total}`;
    $("progresso-frase").textContent = obtidas === 0 ? "conquistas. Comece pelo chat ou pelo simulador!"
      : obtidas === total ? "conquistas. Você completou tudo! 🏆" : "conquistas desbloqueadas";
    $("progresso-barra").style.width = `${(obtidas / total) * 100}%`;
    $("medalhas").innerHTML = Comum.CONQUISTAS.map((c) => {
      const data = feitas[c.id];
      return `<div class="medalha-cartao${data ? " obtida" : ""}">
        <span class="medalha">${icone(data ? c.icone : "cadeado")}</span>
        <strong>${escapar(c.titulo)}</strong>
        <small>${escapar(c.descricao)}</small>
        ${data ? `<em>${escapar(data)}</em>` : ""}
      </div>`;
    }).join("");
  }
  mostrarProgresso();
  // volta do histórico (botão "voltar") com o progresso atualizado
  window.addEventListener("pageshow", mostrarProgresso);
  $("zerar-progresso").addEventListener("click", () => {
    if (!confirm("Zerar todas as suas conquistas neste aparelho?")) return;
    Comum.gravar("fe_conquistas", "{}");
    mostrarProgresso();
  });

  // ---------- rolagem ----------
  let pendente = false;
  const aoRolar = () => {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(() => {
      pendente = false;
      if (reduzirMovimento) palavras.forEach((p) => p.classList.add("acesa"));
      else acenderFrase();
    });
  };
  window.addEventListener("scroll", aoRolar, { passive: true });
  window.addEventListener("resize", aoRolar);
  aoRolar();
})();
