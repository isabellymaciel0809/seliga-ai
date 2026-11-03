// Página "Sobre": números e gráfico a partir de METRICAS (gerado pelo notebook, seção 10).
(function () {
  const { escapar } = window.Formatar;
  const M = window.METRICAS;
  const pct = (c) => Math.round((100 * c.certos) / c.total);
  const virgula = (n) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const [teste, validacao, final, cego] = M.conjuntos;
  const clarezaA = M.clareza["Assistente adaptado"];

  // ---------- números em destaque ----------
  const tiles = [
    { destaque: true, rotulo: "Teste cego: perguntas novas, escritas antes do último ajuste",
      valor: `${cego.assistente.certos} de ${cego.assistente.total}`,
      detalhe: "Usadas uma única vez, sem ajustes depois (inclui 8 perguntas fora do assunto)" },
    { rotulo: "Teste oficial da base",
      valor: `${teste.assistente.certos} de ${teste.assistente.total}`,
      detalhe: "perguntas respondidas com o tema certo" },
    { rotulo: "Perguntas sem resposta (fallback)",
      valor: `${M.fallbackTeste.assistente} de ${M.fallbackTeste.total}`,
      detalhe: "no teste oficial: todas receberam orientação" },
    { rotulo: "Facilidade de leitura (Flesch, 0 a 100)",
      valor: virgula(clarezaA["Flesch (pt)"]),
      detalhe: "nível \"muito fácil\"" },
    { rotulo: "Palavras por frase",
      valor: virgula(clarezaA["palavras por frase"]),
      detalhe: "frases curtas são mais fáceis de entender" },
  ];
  document.getElementById("tiles").innerHTML = tiles.map((t) => `
    <div class="tile${t.destaque ? " destaque" : ""}">
      <div class="rotulo">${t.rotulo}</div>
      <div class="valor">${t.valor}</div>
      <div class="detalhe">${t.detalhe}</div>
    </div>`).join("");

  document.getElementById("h1").textContent =
    `Indícios a favor: ${teste.assistente.certos} de ${teste.assistente.total} no teste oficial e ` +
    `${validacao.assistente.certos + final.assistente.certos + cego.assistente.certos} de ` +
    `${validacao.assistente.total + final.assistente.total + cego.assistente.total} ` +
    "em perguntas informais novas. Falta confirmar com perguntas escritas por adolescentes.";
  document.getElementById("h2").textContent =
    `Indícios a favor: as respostas adaptadas têm frases curtas (${virgula(clarezaA["palavras por frase"])} palavras ` +
    `por frase) e leitura "muito fácil" (${virgula(clarezaA["Flesch (pt)"])} de 100). A confirmação vem do teste com adolescentes ` +
    "(página Avaliação).";

  // ---------- gráfico de barras (SVG) ----------
  const grafico = document.getElementById("grafico");
  const alturaGrupo = 60, barra = 26, topo = 8, direita = 52;
  const H = topo + M.conjuntos.length * alturaGrupo + 28;
  // o desenho usa a largura real do espaço, para o texto não encolher no celular
  let L, esquerda, largura;
  const x = (v) => esquerda + (v / 100) * largura;

  // barra horizontal com a ponta arredondada (4px) e a base reta
  const barraPath = (x0, y, w, h, r = 4) => {
    if (w <= 0) return "";
    r = Math.min(r, w, h / 2);
    return `M${x0},${y}h${w - r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(w - r)}Z`;
  };

  function desenhar() {
  L = Math.max(300, Math.min(760, Math.round(grafico.clientWidth || 640)));
  esquerda = L < 480 ? 112 : 150;
  largura = L - esquerda - direita;
  let svg = `<svg viewBox="0 0 ${L} ${H}" width="${L}" height="${H}" role="group" aria-label="${escapar(rotuloGrafico)}">`;
  for (const v of [0, 25, 50, 75, 100]) {
    svg += `<line class="linha-grade" x1="${x(v)}" x2="${x(v)}" y1="${topo}" y2="${H - 26}"/>`;
    svg += `<text class="rotulo-eixo" x="${x(v)}" y="${H - 8}" text-anchor="middle">${v}%</text>`;
  }
  M.conjuntos.forEach((c, i) => {
    const y = topo + i * alturaGrupo + (alturaGrupo - barra) / 2;
    const [nome, detalhe] = c.nome.replace(")", "").split(" (");
    svg += `<text class="rotulo-eixo" x="${esquerda - 12}" y="${y + barra / 2 - 3}" text-anchor="end" style="fill:var(--texto);font-weight:700">${escapar(nome)}</text>`;
    svg += `<text class="rotulo-eixo" x="${esquerda - 12}" y="${y + barra / 2 + 14}" text-anchor="end">${escapar(detalhe || "")}</text>`;
    const valor = pct(c.assistente);
    svg += `<path d="${barraPath(esquerda, y, x(valor) - esquerda, barra)}" style="fill:var(--serie-assistente)"/>`;
    svg += `<text class="rotulo-valor" x="${x(valor) + 6}" y="${y + barra / 2 + 5}">${valor}%</text>`;
    const dica = escapar(`${c.nome}: ${c.assistente.certos} de ${c.assistente.total} (${valor}%)`);
    svg += `<rect class="alvo" x="${esquerda}" y="${y}" width="${largura + direita}" height="${barra}"
      tabindex="0" role="img" aria-label="${dica}" data-dica="${dica}"/>`;
  });
  svg += `<line class="linha-base" x1="${esquerda}" x2="${esquerda}" y1="${topo}" y2="${H - 26}"/></svg>`;
  grafico.innerHTML = svg + '<div class="dica-grafico" role="status"></div>';
  }

  const rotuloGrafico = "Perguntas respondidas corretamente: " + M.conjuntos.map((c) =>
    `${c.nome}: ${pct(c.assistente)}%`).join("; ");
  desenhar();
  let ultimaLargura = grafico.clientWidth;
  window.addEventListener("resize", () => {
    if (Math.abs(grafico.clientWidth - ultimaLargura) > 20) {
      ultimaLargura = grafico.clientWidth;
      desenhar();
    }
  });

  // a dica é recriada a cada desenho, por isso é buscada na hora
  const dica = () => grafico.querySelector(".dica-grafico");
  const esconderDica = () => (dica().style.opacity = "0");
  const mostrarDica = (alvo, px, py) => {
    const caixa = grafico.getBoundingClientRect();
    const d = dica();
    d.textContent = alvo.dataset.dica;
    d.style.left = `${px - caixa.left}px`;
    d.style.top = `${py - caixa.top}px`;
    d.style.opacity = "1";
  };
  grafico.addEventListener("pointermove", (e) => {
    const alvo = e.target.closest(".alvo");
    if (alvo) mostrarDica(alvo, e.clientX, e.clientY);
    else esconderDica();
  });
  grafico.addEventListener("pointerleave", esconderDica);
  grafico.addEventListener("focusin", (e) => {
    const alvo = e.target.closest(".alvo");
    if (!alvo) return;
    const r = alvo.getBoundingClientRect();
    mostrarDica(alvo, r.left + r.width / 3, r.top);
  });
  grafico.addEventListener("focusout", esconderDica);

  // ---------- número em destaque contando sozinho ----------
  const destaque = document.querySelector(".tile.destaque .valor");
  if (destaque && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const alvo = cego.assistente.certos;
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const inicio = performance.now();
      const passo = (agora) => {
        const t = Math.min(1, (agora - inicio) / 1200);
        destaque.textContent = `${Math.round(alvo * (1 - Math.pow(1 - t, 3)))} de ${cego.assistente.total}`;
        if (t < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    }, { threshold: 0.5 }).observe(destaque);
  }

  // ---------- quem fez ----------
  // Preencha com as pessoas do grupo. Enquanto a lista estiver vazia, a seção "Quem fez" fica escondida.
  // Exemplo: { nome: "Nome Sobrenome", papel: "Notebook e modelo" },
  const EQUIPE = [
  ];
  if (EQUIPE.length) {
    document.getElementById("equipe").innerHTML = EQUIPE.map((p) => `
      <div class="pessoa">
        <span class="pessoa-inicial" aria-hidden="true">${escapar(p.nome.trim()[0] || "?")}</span>
        <strong>${escapar(p.nome)}</strong>
        ${p.papel ? `<small>${escapar(p.papel)}</small>` : ""}
      </div>`).join("");
    document.getElementById("secao-equipe").hidden = false;
  }

  // ---------- tabela com os mesmos dados ----------
  document.getElementById("tabela").innerHTML = `
    <thead><tr><th>Conjunto</th><th class="num">Acertos</th></tr></thead>
    <tbody>${M.conjuntos.map((c) => `<tr><td>${escapar(c.nome)}</td>
      <td class="num">${c.assistente.certos}/${c.assistente.total} (${pct(c.assistente)}%)</td></tr>`).join("")}
    </tbody>`;
})();
