// Checklist de segurança digital: 10 itens, nota de 0 a 10 e plano com o que melhorar.
(function () {
  const { escapar } = window.Formatar;
  const { Comum } = window;
  const CHAVE = "fe_checklist";

  // [afirmação, dica quando a resposta é "não", pergunta para o chat]
  const ITENS = [
    ["Uso senhas diferentes no e-mail, nas redes sociais e nos jogos.",
      "Troque primeiro a senha do e-mail: quem entra nele consegue recuperar todas as outras contas.",
      "uso a mesma senha em tudo, devo trocar?"],
    ["Ativei a verificação em duas etapas no WhatsApp e nas redes sociais.",
      "Ative nas configurações de segurança de cada app. Leva 2 minutos e bloqueia a maioria das invasões.",
      "como ativo a verificação em duas etapas?"],
    ["Nunca passei um código de verificação para ninguém.",
      "Se já passou, troque a senha da conta e encerre as sessões em outros aparelhos.",
      "um conhecido pediu um código recebido por SMS"],
    ["Meu perfil é privado ou eu escolho quem vê minhas publicações.",
      "Deixe o perfil privado e revise quem segue você.",
      "como deixar meu perfil privado"],
    ["Não posto endereço, escola, telefone ou localização em tempo real.",
      "Apague posts com esses dados e desative a localização nas fotos.",
      "publiquei meus dados pessoais sem perceber"],
    ["Revisei as permissões dos apps (câmera, microfone, localização, contatos).",
      "Abra as configurações do celular e tire as permissões que não fazem sentido para cada app.",
      "preciso revisar permissões do celular"],
    ["Não entro no banco nem faço compras usando Wi-Fi público.",
      "Para coisas importantes, use o 4G/5G do seu celular.",
      "posso usar o app do banco no wi-fi do shopping?"],
    ["Confiro a fonte antes de compartilhar uma notícia.",
      "Procure a notícia em sites confiáveis e veja a data antes de repassar.",
      "como saber se uma notícia é fake?"],
    ["Quando alguém pede dinheiro por mensagem, confirmo por ligação ou pessoalmente.",
      "Combine com sua família uma regra: pedido de dinheiro só vale depois de uma ligação.",
      "minha mãe mandou msg de outro número pedindo dinheiro"],
    ["Sei com qual adulto de confiança posso falar se algo der errado.",
      "Escolha agora uma pessoa (responsável, professor, parente) e conte que você pode precisar de ajuda.",
      null],
  ];

  const lista = document.getElementById("itens");
  const resultado = document.getElementById("resultado");

  function carregar() {
    try {
      const salvo = JSON.parse(Comum.ler(CHAVE, "[]"));
      return Array.isArray(salvo) && salvo.length === ITENS.length ? salvo : Array(ITENS.length).fill(null);
    } catch (e) {
      return Array(ITENS.length).fill(null);
    }
  }
  const respostas = carregar();

  function montar() {
    lista.innerHTML = ITENS.map(([texto], i) => `
      <li class="item-check">
        <span id="item-${i}">${i + 1}. ${escapar(texto)}</span>
        <div class="sim-nao" role="group" aria-labelledby="item-${i}">
          <button type="button" data-i="${i}" data-valor="sim" aria-pressed="${respostas[i] === "sim"}">Sim</button>
          <button type="button" data-i="${i}" data-valor="nao" aria-pressed="${respostas[i] === "nao"}">Não</button>
        </div>
      </li>`).join("");
  }

  function atualizarResultado() {
    const respondidos = respostas.filter(Boolean).length;
    if (respondidos < ITENS.length) {
      resultado.innerHTML = `<p class="instrucao">Faltam ${ITENS.length - respondidos} de ${ITENS.length} itens para ver sua nota.</p>`;
      return;
    }
    const nota = respostas.filter((r) => r === "sim").length;
    Comum.conquistar("checklist");
    if (nota === ITENS.length) Comum.conquistar("checklist-10");
    const nivel = nota >= 9 ? ["🛡️", "Escudo forte!", "Você já cuida muito bem da sua segurança."]
      : nota >= 6 ? ["👍", "No caminho certo", "Faltam poucos ajustes para ficar bem protegido(a)."]
        : ["⚠️", "Atenção", "Algumas portas estão abertas para golpistas. Comece pelos itens abaixo."];
    const plano = ITENS.map((item, i) => [item, respostas[i]]).filter(([, r]) => r === "nao");
    resultado.innerHTML = `
      <div class="cartao">
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
          <div class="placar">${nota}<span style="font-size:1.25rem">/10</span></div>
          <div><h2 style="margin:0">${nivel[0]} ${nivel[1]}</h2><p style="margin:0">${nivel[2]}</p></div>
        </div>
        ${plano.length ? `<h3 style="margin-top:16px">Seu plano</h3>
          <ol>${plano.map(([[, dica, pergunta]]) => `<li style="margin-bottom:8px">${escapar(dica)}
            ${pergunta ? `<a href="chat.html?p=${encodeURIComponent(pergunta)}">Saiba mais no chat →</a>` : ""}</li>`).join("")}</ol>`
          : "<p>Nada para melhorar agora. Que tal fazer o quiz ou o simulador?</p>"}
        <div class="botoes">
          <button type="button" class="botao-secundario" id="recomecar">Recomeçar</button>
          <a class="botao-secundario" href="quiz.html">${Comum.icone("quiz")}Fazer o quiz</a>
        </div>
      </div>`;
    document.getElementById("recomecar").addEventListener("click", () => {
      respostas.fill(null);
      Comum.gravar(CHAVE, JSON.stringify(respostas));
      montar();
      atualizarResultado();
      lista.querySelector("button").focus();
    });
  }

  lista.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]");
    if (!b) return;
    const i = Number(b.dataset.i);
    respostas[i] = b.dataset.valor;
    Comum.gravar(CHAVE, JSON.stringify(respostas));
    b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    atualizarResultado();
  });

  montar();
  atualizarResultado();
})();
