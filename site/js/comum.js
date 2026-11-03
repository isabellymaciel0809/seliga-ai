// Partes comuns a todas as páginas: logo, ícones, menus, acessibilidade e leitura em voz alta.
(function () {
  // [arquivo, id da página, nome, ícone]
  const PAGINAS = [
    ["index.html", "inicio", "Início", "inicio"],
    ["chat.html", "chat", "Chat", "chat"],
    ["simulador.html", "simulador", "Simulador", "simulador"],
    ["quiz.html", "quiz", "Quiz", "quiz"],
    ["checklist.html", "checklist", "Checklist", "checklist"],
    ["dicas.html", "dicas", "Dicas", "dicas"],
    ["sobre.html", "sobre", "Sobre", "sobre"],
    ["avaliacao.html", "avaliacao", "Avaliação", "avaliacao"],
  ];
  const NO_CELULAR = ["inicio", "chat", "simulador", "quiz"]; // o resto fica em "Mais"

  // Escudo em degradê: do vermelho Claro (alto, à esquerda) ao azul SoulCode (baixo, à direita).
  // O degradê fica num SVG invisível no início da página para todos os escudos usarem o mesmo id
  // (se o primeiro escudo da página estiver escondido, um degradê dentro dele não seria desenhado).
  document.body.insertAdjacentHTML("afterbegin", `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
      <linearGradient id="degrade-escudo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0.15" stop-color="#da291c"/><stop offset="0.9" stop-color="#0000ff"/>
      </linearGradient>
    </svg>`);
  const LOGO = `
    <svg class="logo" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 3 41 9.5v12.2c0 10.6-7.1 19.6-17 22.8C14.1 41.3 7 32.3 7 21.7V9.5Z" fill="url(#degrade-escudo)"/>
      <path d="m16.5 24.5 5 5 10-11" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  // Ícones de linha (24 × 24), todos no mesmo estilo
  const ICONES = {
    inicio: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
    chat: "M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 21l1.9-5A8.4 8.4 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z",
    simulador: "M6 11h4M8 9v4M15 12h.01M18 10h.01M17.3 5H6.7a4 4 0 0 0-4 3.6L2 15a3 3 0 0 0 5.3 2.2L9 15h6l1.7 2.2A3 3 0 0 0 22 15l-.7-6.4a4 4 0 0 0-4-3.6z",
    quiz: "M4 22V4M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1",
    checklist: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    dicas: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z",
    sobre: "M3 3v18h18M8 17v-5M13 17V8M18 17v-7",
    avaliacao: "M9 3h6v3H9zM9 4.5H6a2 2 0 0 0-2 2V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6.5a2 2 0 0 0-2-2h-3M9 13l2 2 4-4",
    mais: "M4 6h16M4 12h16M4 18h16",
    ouvir: "M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14",
    parar: "M6 6h12v12H6z",
    porque: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01",
    gostei: "M7 10v12M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.4 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9z",
    recomecar: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5",
    baixar: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
    compartilhar: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
    seta: "M5 12h14M13 5l7 7-7 7",
    voltar: "M19 12H5M11 19l-7-7 7-7",
    cadeado: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
    fechar: "M18 6 6 18M6 6l12 12",
    contraste: "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20zM12 2v20",
    sol: "M12 3v2M12 19v2M5 12H3M21 12h-2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    lua: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z",
    golpe: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01",
    seguro: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
    // temas
    whatsapp: "M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 21l1.9-5A8.4 8.4 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5zM9 10h.01M12 10h.01M15 10h.01",
    wifi: "M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 20 0M12 20h.01",
    pix: "M2 6h20v12H2zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 12h.01M18 12h.01",
    boato: "M4 4h13v16H6a2 2 0 0 1-2-2zM17 8h3v10a2 2 0 0 1-2 2M8 8h5M8 12h5M8 16h3",
    senha: "M15.5 7.5 19 4M21 2l-2 2 2.5 2.5L18 10l-2.5-2.5M11.4 12.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8z",
    phishing: "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
    falso_suporte: "M3 14v-2a9 9 0 0 1 18 0v2M21 15a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2zM3 15a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2zM18 17v1a3 3 0 0 1-3 3h-3",
    privacidade: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  };

  function icone(nome, extra = "") {
    const d = ICONES[nome];
    if (!d) return "";
    return `<svg class="icone" viewBox="0 0 24 24" aria-hidden="true"${extra ? ` style="${extra}"` : ""}><path d="${d}"/></svg>`;
  }

  // ---------- preferências (só neste navegador) ----------
  function ler(chave, padrao) {
    try {
      const v = localStorage.getItem(chave);
      return v === null ? padrao : v;
    } catch (e) {
      return padrao;
    }
  }
  function gravar(chave, valor) {
    try {
      localStorage.setItem(chave, valor);
    } catch (e) { /* sem armazenamento: vale só nesta visita */ }
  }

  const raiz = document.documentElement;
  let escala = Number(ler("fe_escala", "1")) || 1;
  const aplicarEscala = () => raiz.style.setProperty("--escala", escala);
  aplicarEscala();
  if (ler("fe_contraste", "") === "alto") raiz.dataset.contraste = "alto";
  if (ler("fe_tema", "") === "claro") raiz.dataset.tema = "claro";
  const iconeTema = () => icone(raiz.dataset.tema === "claro" ? "lua" : "sol");
  const rotuloTema = () => (raiz.dataset.tema === "claro" ? "Usar tema escuro" : "Usar tema claro");

  // ---------- topo, menu de cima (computador) e barra de baixo (celular) ----------
  function link([href, id, nome, ic], atual) {
    return `<a href="${href}"${id === atual ? ' aria-current="page"' : ""}>${icone(ic)}<span>${nome}</span></a>`;
  }

  function montarTopo() {
    const lugar = document.getElementById("topo-site");
    if (!lugar) return;
    const atual = document.body.dataset.pagina;
    const celular = PAGINAS.filter((p) => NO_CELULAR.includes(p[1]));
    const extras = PAGINAS.filter((p) => !NO_CELULAR.includes(p[1]));
    const maisAtivo = extras.some((p) => p[1] === atual);

    lugar.innerHTML = `
      <a class="pular" href="#conteudo">Pular para o conteúdo</a>
      <header class="topo">
        <a class="marca" href="index.html" title="Página inicial">
          ${LOGO}
          <span><strong>Fica Esperto AI</strong><small>Segurança digital para adolescentes</small></span>
        </a>
        <div class="acessibilidade" role="group" aria-label="Acessibilidade">
          <button type="button" id="fonte-menos" title="Diminuir texto">A−<span class="sr-only"> (diminuir texto)</span></button>
          <button type="button" id="fonte-mais" title="Aumentar texto">A+<span class="sr-only"> (aumentar texto)</span></button>
          <button type="button" id="tema" aria-label="${rotuloTema()}" title="${rotuloTema()}">${iconeTema()}</button>
          <button type="button" id="contraste" aria-label="Alto contraste" title="Alto contraste"
            aria-pressed="${raiz.dataset.contraste === "alto"}">${icone("contraste")}</button>
        </div>
      </header>
      <nav class="menu" aria-label="Páginas">${PAGINAS.map((p) => link(p, atual)).join("")}</nav>`;

    // barra de baixo no celular, com "Mais" para as outras páginas
    const barra = document.createElement("nav");
    barra.className = "menu-inferior";
    barra.setAttribute("aria-label", "Páginas");
    barra.innerHTML = `
      ${celular.map((p) => link(p, atual)).join("")}
      <button type="button" id="abrir-mais" aria-expanded="false" aria-controls="painel-mais"${maisAtivo ? ' class="ativo"' : ""}>
        ${icone("mais")}<span>Mais</span></button>
      <div id="painel-mais" class="painel-mais" hidden>${extras.map((p) => link(p, atual)).join("")}</div>`;
    document.body.appendChild(barra);
    document.body.classList.add("com-menu-inferior");

    const botaoMais = barra.querySelector("#abrir-mais");
    const painel = barra.querySelector("#painel-mais");
    const fecharMais = () => {
      painel.hidden = true;
      botaoMais.setAttribute("aria-expanded", "false");
    };
    botaoMais.addEventListener("click", (e) => {
      e.stopPropagation();
      painel.hidden = !painel.hidden;
      botaoMais.setAttribute("aria-expanded", String(!painel.hidden));
    });
    document.addEventListener("click", (e) => {
      if (!barra.contains(e.target)) fecharMais();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") fecharMais();
    });

    const mudarEscala = (passo) => {
      escala = Math.min(1.4, Math.max(0.85, Math.round((escala + passo) * 100) / 100));
      aplicarEscala();
      gravar("fe_escala", String(escala));
    };
    document.getElementById("fonte-menos").addEventListener("click", () => mudarEscala(-0.1));
    document.getElementById("fonte-mais").addEventListener("click", () => mudarEscala(0.1));
    document.getElementById("tema").addEventListener("click", (e) => {
      const claro = raiz.dataset.tema !== "claro";
      if (claro) raiz.dataset.tema = "claro";
      else delete raiz.dataset.tema;
      gravar("fe_tema", claro ? "claro" : "");
      e.currentTarget.innerHTML = iconeTema();
      e.currentTarget.setAttribute("aria-label", rotuloTema());
      e.currentTarget.title = rotuloTema();
    });
    document.getElementById("contraste").addEventListener("click", (e) => {
      const ligado = raiz.dataset.contraste !== "alto";
      if (ligado) raiz.dataset.contraste = "alto";
      else delete raiz.dataset.contraste;
      e.currentTarget.setAttribute("aria-pressed", String(ligado));
      gravar("fe_contraste", ligado ? "alto" : "");
    });

    // <span data-icone="nome"></span> no HTML vira o ícone
    document.querySelectorAll("[data-icone]").forEach((el) => (el.innerHTML = icone(el.dataset.icone)));
  }

  // ---------- leitura em voz alta ----------
  const temVoz = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  let botaoFalando = null;

  function limparParaFala(texto) {
    return texto
      .replace(/\p{Extended_Pictographic}|️/gu, "")
      .replace(/→/g, ", ")
      .replace(/https?:\/\/(www\.)?/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function marcarBotao(botao, falando) {
    botao.setAttribute("aria-pressed", String(falando));
    botao.innerHTML = `${icone(falando ? "parar" : "ouvir")}<span>${falando ? "Parar" : "Ouvir"}</span>`;
  }

  function pararFala() {
    if (!temVoz) return;
    window.speechSynthesis.cancel();
    if (botaoFalando) marcarBotao(botaoFalando, false);
    botaoFalando = null;
  }

  // Liga/desliga a leitura de um texto a partir de um botão.
  function alternarFala(texto, botao) {
    if (!temVoz) return;
    if (botaoFalando === botao) {
      pararFala();
      return;
    }
    pararFala();
    const fala = new SpeechSynthesisUtterance(limparParaFala(texto));
    fala.lang = "pt-BR";
    const voz = window.speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith("pt"));
    if (voz) fala.voice = voz;
    fala.rate = 1.02;
    fala.onend = fala.onerror = () => {
      if (botaoFalando === botao) pararFala();
    };
    botaoFalando = botao;
    marcarBotao(botao, true);
    window.speechSynthesis.speak(fala);
  }

  window.addEventListener("pagehide", pararFala);

  // ---------- confete (nas cores da Claro e da SoulCode) ----------
  function confete() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = document.createElement("canvas");
    canvas.className = "confete";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);
    const cores = ["#da291c", "#3d4dff", "#f9b040", "#ffffff", "#8c98ff"];
    const pedacos = Array.from({ length: 140 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 120,
      y: h * 0.35,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 13 - 4,
      giro: Math.random() * Math.PI,
      vgiro: (Math.random() - 0.5) * 0.3,
      tamanho: 6 + Math.random() * 6,
      cor: cores[Math.floor(Math.random() * cores.length)],
    }));
    const inicio = performance.now();
    const quadro = () => {
      const t = performance.now() - inicio;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - 1600) / 800);
      pedacos.forEach((p) => {
        p.vy += 0.35;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.giro += p.vgiro;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.giro);
        ctx.fillStyle = p.cor;
        ctx.fillRect(-p.tamanho / 2, -p.tamanho / 4, p.tamanho, p.tamanho / 2);
        ctx.restore();
      });
      if (t < 2400) requestAnimationFrame(quadro);
      else canvas.remove();
    };
    requestAnimationFrame(quadro);
  }

  // hora atual no formato 14:05
  const hora = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  // ---------- conquistas (salvas só neste aparelho) ----------
  const CONQUISTAS = [
    { id: "primeira-pergunta", icone: "chat", titulo: "Primeira dúvida", descricao: "Fez a primeira pergunta ao assistente" },
    { id: "por-que", icone: "porque", titulo: "Curioso(a)", descricao: "Abriu o \"Por quê?\" de uma resposta" },
    { id: "comparou", icone: "sobre", titulo: "Comparador(a)", descricao: "Usou o modo comparação no chat" },
    { id: "escapou-1", icone: "seguro", titulo: "Escapou!", descricao: "Escapou de um golpe no simulador" },
    { id: "escapou-todos", icone: "simulador", titulo: "Imbatível", descricao: "Escapou dos 3 golpes do simulador" },
    { id: "quiz-feito", icone: "quiz", titulo: "Detetive", descricao: "Terminou o quiz \"É golpe ou não?\"" },
    { id: "quiz-mestre", icone: "golpe", titulo: "Olho de águia", descricao: "Acertou 9 ou mais no quiz" },
    { id: "checklist", icone: "checklist", titulo: "Autoavaliação", descricao: "Completou o checklist de segurança" },
    { id: "checklist-10", icone: "senha", titulo: "Escudo máximo", descricao: "Tirou 10 no checklist" },
    { id: "compartilhou", icone: "compartilhar", titulo: "Espalha a dica", descricao: "Baixou ou compartilhou um card de dica" },
  ];

  function conquistas() {
    try {
      return JSON.parse(ler("fe_conquistas", "{}")) || {};
    } catch (e) {
      return {};
    }
  }

  function avisar(conquista) {
    let area = document.getElementById("avisos-conquista");
    if (!area) {
      area = Object.assign(document.createElement("div"), { id: "avisos-conquista", className: "avisos-conquista" });
      area.setAttribute("aria-live", "polite");
      document.body.appendChild(area);
    }
    const aviso = document.createElement("div");
    aviso.className = "aviso-conquista";
    aviso.innerHTML = `<span class="medalha">${icone(conquista.icone)}</span>
      <span><small>Conquista desbloqueada</small><strong>${conquista.titulo}</strong></span>`;
    area.appendChild(aviso);
    setTimeout(() => aviso.classList.add("saindo"), 3200);
    setTimeout(() => aviso.remove(), 3700);
  }

  // Desbloqueia uma conquista (só avisa na primeira vez)
  function conquistar(id) {
    const feitas = conquistas();
    if (feitas[id]) return;
    const conquista = CONQUISTAS.find((c) => c.id === id);
    if (!conquista) return;
    feitas[id] = new Date().toLocaleDateString("pt-BR");
    gravar("fe_conquistas", JSON.stringify(feitas));
    avisar(conquista);
  }

  // ---------- seções que surgem ao rolar (qualquer elemento com a classe .revelar) ----------
  function iniciarRevelar() {
    const elementos = document.querySelectorAll(".revelar:not(.visivel)");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elementos.forEach((el) => el.classList.add("visivel"));
      return;
    }
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visivel");
          observador.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    elementos.forEach((el) => observador.observe(el));
  }

  // ---------- rodapé completo (todas as páginas, menos o chat) ----------
  function montarRodape() {
    if (document.body.dataset.rodape === "nao") return;
    const casca = document.querySelector(".casca");
    if (!casca) return;
    const ligacao = (href, nome) => `<a href="${href}">${nome}</a>`;
    casca.insertAdjacentHTML("beforeend", `
      <footer class="rodape-site">
        <div class="rodape-colunas">
          <div class="rodape-marca">
            <span class="rodape-logo">${LOGO}</span>
            <strong>Fica Esperto AI</strong>
            <p>Assistente de IA que ajuda adolescentes a reconhecer golpes e se proteger na internet.</p>
          </div>
          <nav aria-label="Explorar"><h2>Explorar</h2>
            ${ligacao("chat.html", "Chat")}${ligacao("simulador.html", "Simulador")}${ligacao("quiz.html", "Quiz")}
            ${ligacao("checklist.html", "Checklist")}${ligacao("dicas.html", "Dicas")}</nav>
          <nav aria-label="Projeto"><h2>Projeto</h2>
            ${ligacao("sobre.html", "Sobre e resultados")}${ligacao("avaliacao.html", "Avaliação com adolescentes")}
            ${ligacao("index.html?abertura", "Ver a abertura de novo")}</nav>
          <div><h2>Precisa de ajuda agora?</h2>
            <p>Golpe com dinheiro: fale com um responsável e com o seu banco. Ameaça, exposição de fotos ou cyberbullying:
            converse com um adulto de confiança e procure o canal de ajuda da SaferNet Brasil.</p></div>
        </div>
        <div class="rodape-realizacao">
          <img src="img/claro.svg" alt="Claro" width="44" height="44" loading="lazy">
          <span>Projeto do bootcamp da SoulCode Academy, com apoio da Claro e da Favela Gaming</span>
        </div>
        <p class="rodape-final">Projeto educativo, ${new Date().getFullYear()}. Não é um canal oficial da Claro,
          da SoulCode Academy, da Favela Gaming ou de qualquer banco ou empresa, e não substitui a ajuda de um adulto de confiança, da escola ou do seu banco.</p>
      </footer>`);
  }

  window.Comum = { LOGO, icone, temVoz, alternarFala, pararFala, marcarBotao, ler, gravar, confete, hora,
    CONQUISTAS, conquistas, conquistar, iniciarRevelar };
  const iniciar = () => {
    montarTopo();
    montarRodape();
    iniciarRevelar();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
