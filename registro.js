import { db, ref, onValue } from "./firebase.js";

// Pega o ID da URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
console.log("ID da sala:", id);

// Referências dos elementos HTML
const salaNome = document.getElementById("sala-nome");
const tabelaAr = document.getElementById("tabela-ar");
const tabelaLuz = document.getElementById("tabela-luz");
const btnDownloadAr = document.getElementById("download-ar-json");
const btnDownloadLuz = document.getElementById("download-luz-json");

// Atualiza o nome da sala
const salaRef = ref(db, `Dispositivos/${id}/nome`);
console.log("Buscando nome da sala em:", `Dispositivos/${id}/nome`);
onValue(salaRef, (snapshot) => {
  if (snapshot.exists()) {
    const nome = snapshot.val();
    console.log("Nome da sala encontrado:", nome);
    salaNome.innerText = nome;
  } else {
    console.warn("Sala não encontrada");
    salaNome.innerText = "Sala não encontrada";
  }
});

// Função para carregar registros
function carregarRegistros(caminho, tabela) {
  console.log("Buscando registros em:", caminho);
  const registrosRef = ref(db, caminho);
  onValue(registrosRef, (snapshot) => {
    tabela.innerHTML = "";
    if (snapshot.exists()) {
      const dados = snapshot.val();
      console.log("Registros encontrados:", dados);
      const chaves = Object.keys(dados).sort();
      chaves.forEach((chave, index) => {
        const registro = dados[chave];
        console.log(`Registro ${chave}:`, registro);
        const linha = document.createElement("tr");
        linha.innerHTML = `
          <td>${index + 1}</td>
          <td>${registro.dataHora}</td>
          <td>${registro.estado === 1 ? "Ligado" : "Desligado"}</td>
        `;
        tabela.appendChild(linha);
      });
    } else {
      console.warn("Nenhum registro encontrado em", caminho);
      const linha = document.createElement("tr");
      linha.innerHTML = `<td colspan="3">Nenhum registro encontrado</td>`;
      tabela.appendChild(linha);
    }
  });
}

// Carregar registros do Ar e da Luz
carregarRegistros(`Dispositivos/${id}/registros/ar`, tabelaAr);
carregarRegistros(`Dispositivos/${id}/registros/luz`, tabelaLuz);

// Função para download dos registros
function baixarRegistros(caminho, nomeArquivo) {
  console.log("Preparando download de:", caminho);
  const registrosRef = ref(db, caminho);
  onValue(registrosRef, (snapshot) => {
    if (snapshot.exists()) {
      const dados = snapshot.val();
      console.log("Dados para download:", dados);
      const json = JSON.stringify(dados, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nomeArquivo;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      console.warn("Nenhum dado encontrado para download em", caminho);
      alert("Nenhum dado encontrado para download.");
    }
  }, { onlyOnce: true });
}

// Eventos dos botões
btnDownloadAr.addEventListener("click", () => {
  baixarRegistros(`Dispositivos/${id}/registros/ar`, `registros_ar_${id}.json`);
});
btnDownloadLuz.addEventListener("click", () => {
  baixarRegistros(`Dispositivos/${id}/registros/luz`, `registros_luz_${id}.json`);
});