// Página de avaliação com usuários.
// Parte 1 (H2): compara a resposta revisada original com a adaptada, em ordem aleatória.
// Parte 2 (H1): o participante faz perguntas livres e diz se a resposta tinha a ver.
// Os resultados ficam só no localStorage deste navegador e são baixados em CSV.
(function () {
  const M = window.MODELO;
  const { escapar, formatarResposta } = window.Formatar;
  const CHAVE = "ficaesperto_avaliacao";
  const N_SITUACOES = 3;
  const MAX_PERGUNTAS = 3;

  // Uma situação por tema, baseadas nas perguntas de teste da base
  const SITUACOES = {
    whatsapp: "Uma pessoa se passou por um amigo seu no aplicativo de mensagens e pediu dinheiro.",
    wifi: "Você quer fazer uma compra usando o Wi-Fi gratuito do aeroporto.",
    pix: "Chegou uma mensagem dizendo que o seu Pix está bloqueado.",
    boato: "Uma notícia no grupo parece falsa e você quer saber se é verdade.",
    senha: "Alguém pediu para você compartilhar a sua senha.",
    phishing: "Chegou um SMS pedindo os seus dados bancários.",
    falso_suporte: "Um atendente que você não conhece está pedindo os seus dados.",
    privacidade: "Um site está pedindo informações pessoais demais.",
  };

  const $ = (id) => document.getElementById(id);
  const telas = ["inicio", "comparacao", "perguntas", "fim", "aplicador"];

  let participante = null;

  // ---------- armazenamento ----------
  let memoria = { comparacoes: [], perguntas: [] }; // usado se o localStorage estiver bloqueado
  let armazenamentoOk = true;

  function carregar() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (salvo && Array.isArray(salvo.comparacoes) && Array.isArray(salvo.perguntas)) return salvo;
    } catch (e) {
      armazenamentoOk = false;
    }
    return memoria;
  }

  function salvar(dados) {
    memoria = dados;
    try {
      localStorage.setItem(CHAVE, JSON.stringify(dados));
    } catch (e) {
      armazenamentoOk = false;
    }
  }

  function registrar(tipo, linhas) {
    const dados = carregar();
    dados[tipo].push(...linhas);
    salvar(dados);
  }

  // ---------- utilidades ----------
  function embaralhar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  function mostrar(nome) {
    telas.forEach((t) => ($(`tela-${t}`).hidden = t !== nome));
    window.scrollTo(0, 0);
  }

  function atualizarProgresso(fracao) {
    $("barra").style.width = `${Math.round(fracao * 100)}%`;
  }

  function escala(nome, rotulo, minimo, maximo) {
    const opcoes = [1, 2, 3, 4, 5]
      .map((n) => `<label><input type="radio" name="${nome}" value="${n}"><span>${n}</span></label>`)
      .join("");
    return `
      <fieldset class="escala">
        <legend>${rotulo}</legend>
        <div class="notas">${opcoes}</div>
        <div class="extremos"><span>${minimo}</span><span>${maximo}</span></div>
      </fieldset>`;
  }

  function valorMarcado(nome) {
    const marcado = document.querySelector(`input[name="${nome}"]:checked`);
    return marcado ? marcado.value : null;
  }

  // ---------- início ----------
  $("comecar").addEventListener("click", () => {
    if (!$("faixa").value || !$("concordo").checked) {
      $("erro-inicio").textContent = "Escolha sua idade e marque que quer participar.";
      return;
    }
    $("erro-inicio").textContent = "";
    participante = {
      id: "P" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      data: new Date().toLocaleDateString("sv-SE"), // AAAA-MM-DD no horário local (toISOString usa UTC)
      faixa: $("faixa").value,
      temas: embaralhar(Object.keys(SITUACOES)).slice(0, N_SITUACOES),
      etapa: 0,
      perguntas: 0,
    };
    mostrarComparacao();
  });

  // ---------- parte 1: comparação ----------
  function mostrarComparacao() {
    const tema = participante.temas[participante.etapa];
    // sorteia qual versão aparece como A
    participante.ordem = embaralhar(["original", "adaptada"]);
    const textos = { original: M.respostasOriginais[tema], adaptada: M.respostas[tema] };

    $("passo-comparacao").textContent = `Situação ${participante.etapa + 1} de ${N_SITUACOES}`;
    $("situacao").textContent = SITUACOES[tema];
    $("respostas").innerHTML = ["A", "B"]
      .map((letra, i) => `
        <article class="cartao">
          <h3>Resposta ${letra}</h3>
          <div class="mensagem assistente">${formatarResposta(textos[participante.ordem[i]])}</div>
          ${escala(`entendi_${letra}`, "Entendi o que fazer?", "1 = nada", "5 = tudo")}
          ${escala(`facil_${letra}`, "É fácil de ler?", "1 = muito difícil", "5 = muito fácil")}
        </article>`)
      .join("");
    document.querySelectorAll('input[name="preferida"]').forEach((r) => (r.checked = false));
    $("erro-comparacao").textContent = "";
    atualizarProgresso(participante.etapa / (N_SITUACOES + 1));
    mostrar("comparacao");
  }

  $("proxima").addEventListener("click", () => {
    const notas = ["A", "B"].map((l) => [valorMarcado(`entendi_${l}`), valorMarcado(`facil_${l}`)]);
    const preferida = valorMarcado("preferida");
    if (notas.flat().includes(null) || !preferida) {
      $("erro-comparacao").textContent = "Falta responder alguma nota ou escolher a resposta preferida.";
      return;
    }
    const tema = participante.temas[participante.etapa];
    registrar("comparacoes", ["A", "B"].map((letra, i) => ({
      participante: participante.id,
      data: participante.data,
      faixa_etaria: participante.faixa,
      tema,
      versao: participante.ordem[i],
      posicao: letra,
      entendi: Number(notas[i][0]),
      facil: Number(notas[i][1]),
      preferida: preferida === letra ? "sim" : "nao",
    })));

    participante.etapa++;
    if (participante.etapa < N_SITUACOES) {
      mostrarComparacao();
    } else {
      atualizarProgresso(N_SITUACOES / (N_SITUACOES + 1));
      $("resposta-livre").innerHTML = "";
      $("contador-perguntas").textContent = "";
      mostrar("perguntas");
      $("pergunta-livre").focus();
    }
  });

  // ---------- parte 2: perguntas livres ----------
  $("form-pergunta").addEventListener("submit", (e) => {
    e.preventDefault();
    const pergunta = $("pergunta-livre").value.trim();
    if (!pergunta || participante.perguntas >= MAX_PERGUNTAS) return;
    const r = window.Assistente.responder(pergunta);
    $("pergunta-livre").value = "";

    // pergunta com dado pessoal: mostra o aviso e não registra o texto
    if (r.tema === "dado_sensivel") {
      $("resposta-livre").innerHTML =
        `<div class="mensagem assistente sensivel">${formatarResposta(r.resposta)}</div>`;
      return;
    }

    $("resposta-livre").innerHTML = `
      <div class="mensagem usuario">${escapar(pergunta)}</div>
      <div class="mensagem assistente">${formatarResposta(r.resposta)}</div>
      <fieldset class="escolha">
        <legend>Essa resposta tinha a ver com a sua pergunta?</legend>
        <div class="opcoes">
          <button type="button" class="chip" data-valor="sim">👍 Sim</button>
          <button type="button" class="chip" data-valor="mais_ou_menos">🤏 Mais ou menos</button>
          <button type="button" class="chip" data-valor="nao">👎 Não</button>
        </div>
      </fieldset>`;
    $("pergunta-livre").disabled = true;

    $("resposta-livre").querySelector(".opcoes").addEventListener("click", (ev) => {
      const botao = ev.target.closest("button");
      if (!botao) return;
      registrar("perguntas", [{
        participante: participante.id,
        data: participante.data,
        faixa_etaria: participante.faixa,
        pergunta,
        tema_previsto: r.tema,
        relevancia: botao.dataset.valor,
      }]);
      participante.perguntas++;
      $("resposta-livre").innerHTML = "";
      const restantes = MAX_PERGUNTAS - participante.perguntas;
      $("contador-perguntas").textContent = restantes > 0
        ? `Valeu! Você pode fazer mais ${restantes} pergunta${restantes > 1 ? "s" : ""} ou terminar.`
        : "Pronto, você já fez as 3 perguntas!";
      $("pergunta-livre").disabled = restantes === 0;
      if (restantes > 0) $("pergunta-livre").focus();
    }, { once: true });
  });

  $("terminar").addEventListener("click", () => {
    if (!$("resposta-livre").querySelector(".opcoes") || confirm("Você não avaliou a última resposta. Terminar mesmo assim?")) {
      atualizarProgresso(1);
      mostrar("fim");
    }
  });

  // ---------- reinício ----------
  function telaInicial() {
    participante = null;
    $("faixa").value = "";
    $("concordo").checked = false;
    $("pergunta-livre").disabled = false;
    atualizarProgresso(0);
    mostrar("inicio");
  }

  $("proximo-participante").addEventListener("click", telaInicial);
  $("voltar-inicio").addEventListener("click", telaInicial);

  // ---------- área do aplicador ----------
  const COLUNAS = {
    comparacoes: ["participante", "data", "faixa_etaria", "tema", "versao", "posicao", "entendi", "facil", "preferida"],
    perguntas: ["participante", "data", "faixa_etaria", "pergunta", "tema_previsto", "relevancia"],
  };

  function paraCsv(linhas, colunas) {
    const celula = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    return "﻿" + [colunas.join(","), ...linhas.map((l) => colunas.map((c) => celula(l[c])).join(","))].join("\n");
  }

  function baixar(tipo) {
    const csv = paraCsv(carregar()[tipo], COLUNAS[tipo]);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = `avaliacao_${tipo}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function abrirAplicador() {
    const dados = carregar();
    const pessoas = new Set(dados.comparacoes.map((l) => l.participante)).size;
    $("resumo-aplicador").textContent =
      `${pessoas} participante${pessoas === 1 ? "" : "s"} · ${dados.comparacoes.length / 2} situações avaliadas · ` +
      `${dados.perguntas.length} perguntas livres.`;
    $("aviso-armazenamento").textContent = armazenamentoOk ? "" :
      "Atenção: este navegador está bloqueando o armazenamento. Os resultados somem ao fechar a página. Baixe os CSVs antes de sair.";
    mostrar("aplicador");
  }

  $("abrir-aplicador").addEventListener("click", abrirAplicador);
  $("baixar-comparacoes").addEventListener("click", () => baixar("comparacoes"));
  $("baixar-perguntas").addEventListener("click", () => baixar("perguntas"));
  $("apagar").addEventListener("click", () => {
    if (confirm("Apagar TODOS os resultados deste aparelho? Baixe os CSVs antes. Isso não pode ser desfeito.")) {
      salvar({ comparacoes: [], perguntas: [] });
      abrirAplicador();
    }
  });

  window.AvaliacaoCsv = { paraCsv, COLUNAS }; // usado nos testes
  telaInicial();
})();
