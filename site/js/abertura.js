// Abertura da página inicial: partículas vermelhas formam o escudo,
// o "check" se desenha, o nome aparece e o botão "Entrar" leva para a página com um zoom.
(function () {
  const raiz = document.documentElement;
  const abertura = document.getElementById("abertura");
  if (!abertura) return;
  if (!raiz.classList.contains("com-abertura")) {
    abertura.remove();
    return;
  }

  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("abertura-canvas");
  const ctx = canvas.getContext("2d");
  const escudo = document.getElementById("abertura-escudo");
  const [contorno, check] = escudo.querySelectorAll("path");
  raiz.classList.add("abertura-ativa");

  // nome letra por letra
  const titulo = document.getElementById("abertura-titulo");
  titulo.innerHTML = [..."Se Liga AI"]
    .map((letra, i) => `<span style="--i:${i}" aria-hidden="true">${letra === " " ? "&nbsp;" : letra}</span>`)
    .join("");

  // vermelho e vermelho escuro no escudo; o check em preto no fundo branco (ou branco no tema escuro)
  const CORES = { claro: "218, 41, 28", escuro: "158, 26, 16", check: raiz.dataset.tema === "escuro" ? "255, 255, 255" : "17, 17, 17" };

  // brilho de cada partícula desenhado uma vez só (shadowBlur a cada quadro é muito pesado)
  const brilhos = {};
  Object.values(CORES).forEach((cor) => {
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 24;
    const c = sprite.getContext("2d");
    const degrade = c.createRadialGradient(12, 12, 0, 12, 12, 12);
    degrade.addColorStop(0, `rgba(${cor}, 1)`);
    degrade.addColorStop(0.18, `rgba(${cor}, 0.95)`);
    degrade.addColorStop(0.35, `rgba(${cor}, 0.35)`);
    degrade.addColorStop(1, `rgba(${cor}, 0)`);
    c.fillStyle = degrade;
    c.fillRect(0, 0, 24, 24);
    brilhos[cor] = sprite;
  });
  let largura = 0, altura = 0, particulas = [];

  // pontos do escudo (contorno e check) na posição real do SVG na tela
  function alvos() {
    const caixa = escudo.getBoundingClientRect();
    const escala = caixa.width / 48;
    const paraTela = (x, y) => ({ x: caixa.left + x * escala, y: caixa.top + y * escala });
    const pontos = [];
    const total = contorno.getTotalLength();
    for (let i = 0; i < 64; i++) {
      const p = contorno.getPointAtLength((total * i) / 64);
      // mesma diagonal do degradê: vermelho no alto à esquerda, vermelho escuro embaixo à direita
      const posicao = ((p.x - 7) / 34 + (p.y - 3) / 41.5) / 2;
      pontos.push({ ...paraTela(p.x, p.y), cor: posicao < 0.5 ? CORES.claro : CORES.escuro });
    }
    const totalCheck = check.getTotalLength();
    for (let i = 0; i <= 12; i++) {
      const p = check.getPointAtLength((totalCheck * i) / 12);
      pontos.push({ ...paraTela(p.x, p.y), cor: CORES.check });
    }
    return pontos;
  }

  function preparar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    largura = window.innerWidth;
    altura = window.innerHeight;
    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    canvas.style.width = largura + "px";
    canvas.style.height = altura + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pontos = alvos();
    if (!particulas.length) {
      particulas = pontos.map((alvo) => ({
        x: Math.random() * largura,
        y: Math.random() * altura,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        alvo,
      }));
    } else {
      particulas.forEach((p, i) => (p.alvo = pontos[i]));
    }
  }

  const suavizar = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const INICIO_JUNTAR = 450, FIM_JUNTAR = 1850;
  let comeco = null, quadro = null, partida = null;

  // o tempo vem do relógio, não da contagem de quadros: mesmo num aparelho lento, cada fase chega na hora
  function desenhar() {
    if (comeco === null) comeco = performance.now();
    const t = performance.now() - comeco;
    ctx.clearRect(0, 0, largura, altura);

    if (t >= INICIO_JUNTAR && !partida) partida = particulas.map((p) => ({ x: p.x, y: p.y }));
    const progresso = t < INICIO_JUNTAR ? 0 : Math.min(1, (t - INICIO_JUNTAR) / (FIM_JUNTAR - INICIO_JUNTAR));
    const k = suavizar(progresso);
    // depois que o escudo aparece, as partículas ficam como um brilho discreto
    const brilho = t < FIM_JUNTAR + 200 ? 1 : Math.max(0.22, 1 - (t - FIM_JUNTAR - 200) / 700);

    particulas.forEach((p, i) => {
      if (progresso === 0) {
        p.x += p.vx;
        p.y += p.vy;
      } else {
        const oscila = (1 - k) * 6;
        p.x = partida[i].x + (p.alvo.x - partida[i].x) * k + Math.sin(t / 300 + i) * oscila;
        p.y = partida[i].y + (p.alvo.y - partida[i].y) * k + Math.cos(t / 300 + i) * oscila;
      }
    });

    // linhas entre partículas próximas: a "rede"
    const distancia = 110 - 60 * k;
    for (let i = 0; i < particulas.length; i++) {
      for (let j = i + 1; j < particulas.length; j++) {
        const a = particulas[i], b = particulas[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < distancia) {
          ctx.strokeStyle = `rgba(${a.alvo.cor}, ${(1 - d / distancia) * 0.35 * brilho})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = brilho;
    particulas.forEach((p) => ctx.drawImage(brilhos[p.alvo.cor], p.x - 12, p.y - 12));
    ctx.globalAlpha = 1;

    if (t > FIM_JUNTAR) abertura.classList.add("fase-escudo");
    if (t > FIM_JUNTAR + 450) abertura.classList.add("fase-titulo");
    if (t > FIM_JUNTAR + 1000) abertura.classList.add("fase-botao");
    quadro = requestAnimationFrame(desenhar);
  }

  let saindo = false;
  function entrar() {
    if (saindo) return;
    saindo = true;
    try {
      sessionStorage.setItem("fe_abertura_vista", "1");
    } catch (e) { /* sem armazenamento: a abertura volta na próxima visita */ }
    abertura.classList.add("fase-escudo", "fase-titulo", "fase-botao", "saindo");
    raiz.classList.add("capa-livre"); // a capa começa a aparecer junto com o zoom do escudo
    const terminar = () => {
      cancelAnimationFrame(quadro);
      abertura.remove();
      raiz.classList.remove("abertura-ativa", "com-abertura");
      document.dispatchEvent(new Event("abertura:fim"));
      const campo = document.getElementById("pergunta-inicio");
      if (campo) campo.focus({ preventScroll: true });
    };
    if (reduzirMovimento) terminar();
    else setTimeout(terminar, 900);
  }

  document.getElementById("abertura-entrar").addEventListener("click", entrar);
  document.getElementById("abertura-pular").addEventListener("click", entrar);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !saindo) entrar();
  });

  if (reduzirMovimento) {
    // sem animação: mostra o escudo pronto e o botão
    abertura.classList.add("fase-escudo", "fase-titulo", "fase-botao", "sem-movimento");
    document.getElementById("abertura-entrar").focus();
    return;
  }

  window.addEventListener("resize", preparar);
  // espera a fonte para o escudo estar na posição final antes de calcular os pontos
  const fonte = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fonte, new Promise((ok) => setTimeout(ok, 800))]).then(() => {
    preparar();
    quadro = requestAnimationFrame(desenhar);
    // as fases também são garantidas por tempo, caso o navegador desenhe poucos quadros
    setTimeout(() => abertura.classList.add("fase-escudo"), FIM_JUNTAR);
    setTimeout(() => abertura.classList.add("fase-titulo"), FIM_JUNTAR + 450);
    setTimeout(() => {
      abertura.classList.add("fase-botao");
      document.getElementById("abertura-entrar").focus({ preventScroll: true });
    }, FIM_JUNTAR + 1050);
  });
})();
