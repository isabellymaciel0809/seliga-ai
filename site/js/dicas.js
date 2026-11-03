// Cards de dicas: um por tema, que podem ser baixados como imagem (1080 × 1350) ou compartilhados.
(function () {
  const { escapar } = window.Formatar;
  const { Comum } = window;

  const DICAS = [
    { tema: "whatsapp", icone: "💬", titulo: "Golpe do falso parente",
      dicas: ["Número novo pedindo dinheiro? Ligue no número antigo.", "Nunca passe códigos que chegam por SMS.", "Bloqueie e denuncie o contato falso."] },
    { tema: "pix", icone: "💸", titulo: "Pix sem cair em golpe",
      dicas: ["Desconfie de preço muito baixo e pressa.", "Confira o nome de quem vai receber.", "Caiu em golpe? Fale com o banco na hora."] },
    { tema: "phishing", icone: "🎣", titulo: "Link suspeito é isca",
      dicas: ["Prêmio que você não pediu é golpe.", "Abra o app oficial em vez de clicar no link.", "Nunca digite sua senha em site que chegou por mensagem."] },
    { tema: "falso_suporte", icone: "🛑", titulo: "Falso suporte",
      dicas: ["Suporte de verdade não pede código nem senha.", "Não instale apps a pedido de desconhecidos.", "Procure ajuda só pelos canais oficiais."] },
    { tema: "senha", icone: "🔐", titulo: "Senha forte, conta segura",
      dicas: ["Use uma frase longa como senha.", "Uma senha diferente para cada conta.", "Ative a verificação em duas etapas."] },
    { tema: "wifi", icone: "📶", titulo: "Wi-Fi público",
      dicas: ["Nada de banco ou compras em rede aberta.", "Confirme o nome certo da rede no local.", "Para coisas importantes, use o 4G/5G."] },
    { tema: "boato", icone: "🧐", titulo: "Antes de repassar, confira",
      dicas: ["Procure a notícia em sites confiáveis.", "Veja a data e quem publicou.", "\"Compartilhe urgente\" é sinal de boato."] },
    { tema: "privacidade", icone: "👀", titulo: "Sua privacidade",
      dicas: ["Deixe o perfil privado.", "Não poste endereço, escola ou localização.", "Negue permissões que não fazem sentido."] },
  ];

  const cards = document.getElementById("cards");
  cards.innerHTML = DICAS.map((d, i) => `
    <article class="cartao card-dica">
      <div class="icone-tema" aria-hidden="true">${Comum.icone(d.tema)}</div>
      <h2>${escapar(d.titulo)}</h2>
      <ul>${d.dicas.map((t) => `<li>${escapar(t)}</li>`).join("")}</ul>
      <div class="botoes">
        <button type="button" class="botao-principal" data-i="${i}" data-acao="baixar">${Comum.icone("baixar")}Baixar imagem</button>
        ${navigator.share ? `<button type="button" class="botao-secundario" data-i="${i}" data-acao="compartilhar">${Comum.icone("compartilhar")}Compartilhar</button>` : ""}
      </div>
    </article>`).join("");

  // quebra o texto em linhas que cabem na largura
  function quebrar(ctx, texto, largura) {
    const linhas = [];
    let linha = "";
    for (const palavra of texto.split(" ")) {
      const teste = linha ? linha + " " + palavra : palavra;
      if (ctx.measureText(teste).width > largura && linha) {
        linhas.push(linha);
        linha = palavra;
      } else {
        linha = teste;
      }
    }
    if (linha) linhas.push(linha);
    return linhas;
  }

  function desenhar(d) {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    const fundo = ctx.createLinearGradient(0, 0, 1080, 1350);
    fundo.addColorStop(0, "#da291c"); // vermelho Claro
    fundo.addColorStop(1, "#0000ff"); // azul SoulCode
    ctx.fillStyle = fundo;
    ctx.fillRect(0, 0, 1080, 1350);

    const fonte = '"Nunito", "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = "#ffffff";
    ctx.font = `120px ${fonte}`;
    ctx.fillText(d.icone, 90, 230);
    ctx.font = `800 76px ${fonte}`;
    let y = 360;
    for (const linha of quebrar(ctx, d.titulo, 900)) {
      ctx.fillText(linha, 90, y);
      y += 90;
    }
    y += 40;
    d.dicas.forEach((dica, i) => {
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath();
      ctx.roundRect(70, y - 70, 940, 230, 36);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 54px ${fonte}`;
      ctx.fillText(String(i + 1), 110, y + 4);
      ctx.font = `700 48px ${fonte}`;
      let yy = y;
      for (const linha of quebrar(ctx, dica, 800)) {
        ctx.fillText(linha, 180, yy);
        yy += 60;
      }
      y += 260;
    });
    ctx.font = `800 40px ${fonte}`;
    ctx.fillText("🛡️ Fica Esperto AI", 90, 1270);
    ctx.font = `600 30px ${fonte}`;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText("Projeto educativo de segurança digital", 90, 1310);
    return canvas;
  }

  const nomeArquivo = (d) => `fica-esperto-${d.tema}.png`;

  cards.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]");
    if (!b) return;
    const d = DICAS[Number(b.dataset.i)];
    Comum.conquistar("compartilhou");
    desenhar(d).toBlob(async (blob) => {
      if (!blob) return;
      const arquivo = new File([blob], nomeArquivo(d), { type: "image/png" });
      if (b.dataset.acao === "compartilhar" && navigator.canShare && navigator.canShare({ files: [arquivo] })) {
        try {
          await navigator.share({ files: [arquivo], title: d.titulo, text: "Dica do Fica Esperto AI 🛡️" });
          return;
        } catch (erro) {
          if (erro.name === "AbortError") return; // a pessoa cancelou
        }
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = nomeArquivo(d);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }, "image/png");
  });

  window.DicasCards = { desenhar, DICAS }; // usado nos testes
})();
