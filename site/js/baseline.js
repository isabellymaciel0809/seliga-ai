// Baseline: o chatbot do notebook de exemplo da professora, rodando no navegador.
// Reproduz o baseline_responder() do notebook (seção 3.1) usando MODELO.baseline.
(function (raiz) {
  const M = raiz.MODELO;
  const B = M.baseline;
  const padroesSensiveis = M.padroesSensiveis.map((p) => new RegExp(p, "i"));
  const LETRA = "[\\p{L}\\p{N}_]";

  // TfidfVectorizer(strip_accents="unicode", lowercase=True, ngram_range=(1, 2))
  function vetorizar(texto) {
    texto = texto.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
    const tokens = texto.match(new RegExp(`${LETRA}{2,}`, "gu")) || [];
    const termos = [...tokens];
    for (let i = 0; i + 1 < tokens.length; i++) termos.push(tokens[i] + " " + tokens[i + 1]);
    const vetor = new Map();
    for (const t of termos) {
      const j = B.vocab[t];
      if (j !== undefined) vetor.set(j, (vetor.get(j) || 0) + 1);
    }
    let norma = 0;
    for (const [j, tf] of vetor) {
      const peso = tf * B.idf[j];
      vetor.set(j, peso);
      norma += peso * peso;
    }
    norma = Math.sqrt(norma) || 1;
    for (const [j, peso] of vetor) vetor.set(j, peso / norma);
    return vetor;
  }

  const expressoes = Object.entries(B.palavrasTema).flatMap(([tema, lista]) =>
    lista.map((palavra) => ({
      tema,
      tamanho: palavra.length,
      regex: new RegExp(`(?<!${LETRA})${palavra.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?!${LETRA})`, "u"),
    }))
  );

  function detectarTemaExplicito(pergunta) {
    const texto = pergunta.toLowerCase();
    const hits = expressoes.filter((e) => e.regex.test(texto));
    if (!hits.length) return null;
    // max() de tuplas (tamanho, tema) no Python
    hits.sort((a, b) => a.tamanho - b.tamanho || (a.tema < b.tema ? -1 : a.tema > b.tema ? 1 : 0));
    return hits[hits.length - 1].tema;
  }

  function responder(pergunta, limiar = 0.22) {
    if (padroesSensiveis.some((p) => p.test(pergunta))) {
      return { tema: "dado_sensivel", confianca: 0, resposta: B.mensagemSensivel };
    }
    const temaDireto = detectarTemaExplicito(pergunta);
    const q = vetorizar(pergunta);
    let indice = 0;
    let score = -1;
    B.matriz.forEach((linha, i) => {
      let s = 0;
      for (const [j, v] of linha) {
        const w = q.get(j);
        if (w !== undefined) s += w * v;
      }
      if (s > score) {
        score = s;
        indice = i;
      }
    });
    const minusculo = pergunta.toLowerCase();
    const temGolpe = B.palavrasGolpe.some((t) => minusculo.includes(t));
    if (temaDireto === null && (score < Math.max(limiar, 0.48) || (score < 0.9 && !temGolpe))) {
      return { tema: "fora_do_escopo", confianca: score, resposta: B.fallback };
    }
    const tema = temaDireto || B.temasTreino[indice];
    return { tema, confianca: score, resposta: M.respostasOriginais[tema] };
  }

  const api = { responder };
  raiz.Baseline = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
