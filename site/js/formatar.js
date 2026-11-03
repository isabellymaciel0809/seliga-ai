// Funções de exibição usadas pelo chat (app.js) e pela avaliação (avaliacao.js).
(function (raiz) {
  function escapar(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // As respostas vêm em linhas: título, passos "1. ...", "Exemplo: ..." e dicas finais.
  function formatarResposta(texto) {
    const linhas = texto.split("\n");
    let html = "";
    let passos = [];
    const fecharPassos = () => {
      if (passos.length) html += "<ol>" + passos.map((p) => `<li>${p}</li>`).join("") + "</ol>";
      passos = [];
    };
    linhas.forEach((linha, i) => {
      const passo = linha.match(/^\d+\.\s+(.*)/);
      if (passo) {
        passos.push(escapar(passo[1]));
        return;
      }
      fecharPassos();
      if (linha.startsWith("Exemplo:")) {
        html += `<div class="exemplo"><strong>Exemplo:</strong>${escapar(linha.slice(8))}</div>`;
      } else {
        html += `<p${i === 0 && linhas.length > 1 ? ' class="titulo"' : ""}>${escapar(linha)}</p>`;
      }
    });
    fecharPassos();
    return html;
  }

  // Separa a resposta em partes, para o chat mostrar o essencial e esconder o resto em "ver mais"
  function partesResposta(texto) {
    const linhas = texto.split("\n");
    const partes = { titulo: linhas[0], passos: [], exemplo: null, extras: [] };
    for (const linha of linhas.slice(1)) {
      const passo = linha.match(/^\d+\.\s+(.*)/);
      if (passo) partes.passos.push(passo[1]);
      else if (linha.startsWith("Exemplo:")) partes.exemplo = linha.slice(8).trim();
      else if (linha.trim()) partes.extras.push(linha);
    }
    return partes;
  }

  raiz.Formatar = { escapar, formatarResposta, partesResposta };
})(window);
