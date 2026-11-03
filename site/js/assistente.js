// Assistente de segurança digital rodando no navegador.
// Reproduz o assistente_responder() do notebook usando os dados de modelo.js.
(function (raiz) {
  const M = raiz.MODELO;

  const prefixos = new RegExp(M.prefixos);
  const girias = M.girias.map(([padrao, troca]) => [new RegExp(padrao, "g"), troca]);
  const genericas = new Set(M.palavrasGenericas);
  const vocabBase = new Set(M.vocabBase);
  const padroesSensiveis = M.padroesSensiveis.map((p) => new RegExp(p, "i"));
  // o classificador tem os 8 temas + a categoria "fora do escopo"
  const iFora = M.classes.indexOf(M.classeFora);
  const temasReais = M.classes.map((_, i) => i).filter((i) => i !== iFora);

  function normalizar(texto) {
    texto = texto.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
    texto = texto.replace(prefixos, "");
    for (const [padrao, troca] of girias) texto = texto.replace(padrao, troca);
    texto = texto.replace(/[^a-z0-9\- ]/g, " ");
    return texto.replace(/\s+/g, " ").trim();
  }

  function contemDadoSensivel(texto) {
    return padroesSensiveis.some((p) => p.test(texto));
  }

  function palavrasRelevantes(texto) {
    return normalizar(texto)
      .split(" ")
      .filter((p) => p.length > 2 && !genericas.has(p));
  }

  // Mesmo recorte do TfidfVectorizer(analyzer="char_wb") do scikit-learn
  function ngramasCaracteres(texto, min, max) {
    const saida = [];
    for (let palavra of texto.split(/\s+/).filter(Boolean)) {
      palavra = " " + palavra + " ";
      for (let n = min; n <= max; n++) {
        let inicio = 0;
        saida.push(palavra.slice(inicio, inicio + n));
        while (inicio + n < palavra.length) {
          inicio++;
          saida.push(palavra.slice(inicio, inicio + n));
        }
        if (inicio === 0) break;
      }
    }
    return saida;
  }

  // Mesmo recorte do TfidfVectorizer(analyzer="word") do scikit-learn
  function ngramasPalavras(texto, min, max) {
    const tokens = texto.match(/\b\w\w+\b/g) || [];
    const saida = [];
    for (let n = min; n <= max; n++) {
      for (let i = 0; i + n <= tokens.length; i++) saida.push(tokens.slice(i, i + n).join(" "));
    }
    return saida;
  }

  // TF-IDF com tf sublinear e normalização L2, como no notebook
  function vetorizar(texto, vet) {
    const [min, max] = vet.ngramas;
    const termos = vet.analisador === "char_wb" ? ngramasCaracteres(texto, min, max) : ngramasPalavras(texto, min, max);
    const contagem = new Map();
    for (const t of termos) {
      const i = vet.vocab[t];
      if (i !== undefined) contagem.set(i, (contagem.get(i) || 0) + 1);
    }
    let norma = 0;
    for (const [i, tf] of contagem) {
      const peso = (1 + Math.log(tf)) * vet.idf[i];
      contagem.set(i, peso);
      norma += peso * peso;
    }
    norma = Math.sqrt(norma) || 1;
    for (const [i, peso] of contagem) contagem.set(i, peso / norma);
    return contagem;
  }

  function probabilidades(texto) {
    const partes = [];
    let deslocamento = 0;
    for (const vet of M.vetorizadores) {
      partes.push([vetorizar(texto, vet), deslocamento]);
      deslocamento += vet.idf.length;
    }
    const pontos = M.classes.map((_, c) => {
      let soma = M.intercepto[c];
      for (const [vetor, inicio] of partes) {
        for (const [i, peso] of vetor) soma += peso * M.coef[c][inicio + i];
      }
      return soma;
    });
    const maior = Math.max(...pontos);
    const exp = pontos.map((p) => Math.exp(p - maior));
    const total = exp.reduce((a, b) => a + b, 0);
    return exp.map((e) => e / total);
  }

  // resposta completa de um tema (usada também quando o usuário escolhe o tema na confirmação)
  function respostaDoTema(tema, confianca) {
    return {
      tema,
      confianca,
      resposta: M.respostas[tema],
      nomeTema: M.nomesTemas[tema],
      alerta: M.alertas[tema],
      referencia: M.referencias[tema],
    };
  }

  function responder(pergunta) {
    if (contemDadoSensivel(pergunta)) {
      return { tema: "dado_sensivel", confianca: 1, resposta: M.respostaDadoSensivel };
    }
    const probs = probabilidades(normalizar(pergunta));
    const pFora = probs[iFora];
    const ordem = [...temasReais].sort((a, b) => probs[b] - probs[a]);
    const tema = M.classes[ordem[0]];
    const confianca = probs[ordem[0]] / (1 - pFora); // probabilidade entre os 8 temas
    const caracteristica = palavrasRelevantes(pergunta).some((p) => vocabBase.has(p));
    if ((pFora > probs[ordem[0]] && (pFora >= M.limiarFora || !caracteristica)) ||
        (!caracteristica && confianca < M.limiarEscopo)) {
      return { tema: "fora_do_escopo", confianca, resposta: M.respostaForaDoEscopo };
    }
    const r = respostaDoTema(tema, confianca);
    if (confianca < M.limiarDuvida) r.duvida = [tema, M.classes[ordem[1]]];
    return r;
  }

  // Palavras que mais pesaram na escolha do tema (mesma conta do explicar() do notebook)
  // tema: explica um tema específico (ex.: o que o usuário escolheu na confirmação)
  function explicar(pergunta, n = 4, tema = null) {
    const texto = normalizar(pergunta);
    const t = tema || responder(pergunta).tema;
    const c = M.classes.indexOf(t);
    if (c < 0 || !M.nomesTemas[t] || !texto) return [];
    const relativo = (j) => M.coef[c][j] - M.coef.reduce((s, linha) => s + linha[j], 0) / M.classes.length;
    const [vetChar, vetPalavra] = M.vetorizadores;
    const nChar = vetChar.idf.length;
    const xChar = vetorizar(texto, vetChar);
    const xPal = vetorizar(texto, vetPalavra);
    const totalChar = new Map();
    for (const ng of ngramasCaracteres(texto, ...vetChar.ngramas)) totalChar.set(ng, (totalChar.get(ng) || 0) + 1);

    const pesos = new Map();
    const somar = (palavra, valor) => pesos.set(palavra, (pesos.get(palavra) || 0) + valor);
    for (const palavra of texto.split(" ")) {
      for (const ng of ngramasCaracteres(palavra, ...vetChar.ngramas)) {
        const j = vetChar.vocab[ng];
        if (j !== undefined) somar(palavra, ((xChar.get(j) || 0) * relativo(j)) / totalChar.get(ng));
      }
    }
    for (const termo of new Set(ngramasPalavras(texto, ...vetPalavra.ngramas))) {
      const j = vetPalavra.vocab[termo];
      if (j === undefined) continue;
      const partes = termo.split(" ");
      for (const palavra of partes) somar(palavra, ((xPal.get(j) || 0) * relativo(nChar + j)) / partes.length);
    }
    return [...pesos]
      .filter(([p, w]) => w > 0 && !genericas.has(p) && p.length > 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([p]) => p);
  }

  // Os 8 temas ordenados pela probabilidade calculada pelo modelo (usado na página inicial)
  function ranking(pergunta) {
    const probs = probabilidades(normalizar(pergunta));
    return temasReais
      .map((i) => ({ tema: M.classes[i], nome: M.nomesTemas[M.classes[i]], probabilidade: probs[i] / (1 - probs[iFora]) }))
      .sort((a, b) => b.probabilidade - a.probabilidade);
  }

  const api = { responder, respostaDoTema, explicar, ranking, normalizar };
  raiz.Assistente = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
