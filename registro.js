import { database } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  alert("ID não encontrado na URL.");
} else {
  const titulo = document.getElementById("titulo");
  const tabelaAr = document.getElementById("tabela-ar");
  const tabelaLuz = document.getElementById("tabela-luz");

  const dispositivoRef = ref(database, `Dispositivos/${id}`);

  get(dispositivoRef).then((snapshot) => {
    if (!snapshot.exists()) {
      titulo.textContent = "Dispositivo não encontrado.";
      return;
    }

    const data = snapshot.val();

    titulo.textContent = `Registros da Sala: ${data.nome || id}`;

    const registrosAr = data.registros && data.registros.ar ? data.registros.ar : {};
    const registrosLuz = data.registros && data.registros.luz ? data.registros.luz : {};

    preencherTabela(registrosAr, tabelaAr);
    preencherTabela(registrosLuz, tabelaLuz);
  }).catch((error) => {
    console.error("Erro ao obter dados:", error);
    titulo.textContent = "Erro ao carregar dados.";
  });

  function preencherTabela(registros, tabela) {
    tabela.innerHTML = "";
    const chaves = Object.keys(registros).sort((a, b) => Number(a) - Number(b));

    if (chaves.length === 0) {
      tabela.innerHTML = `<tr><td colspan="3">Nenhum registro encontrado.</td></tr>`;
      return;
    }

    chaves.forEach((key, index) => {
      const valor = registros[key]; // Exemplo: "01/01/0001 12:12:12 1"
      const partes = valor.split(" ");
      const dataHora = `${partes[0]} ${partes[1]}`;
      const estado = partes[2] === "1" ? "Ligado" : "Desligado";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${dataHora}</td>
        <td>${estado}</td>
      `;
      tabela.appendChild(tr);
    });
  }

  document.getElementById("download-ar").addEventListener("click", () => {
    baixarJSON(tabelaAr, "ar");
  });

  document.getElementById("download-luz").addEventListener("click", () => {
    baixarJSON(tabelaLuz, "luz");
  });

  function baixarJSON(tabela, tipo) {
    const linhas = Array.from(tabela.querySelectorAll("tr"));
    const dados = linhas.map(linha => {
      const colunas = linha.querySelectorAll("td");
      return {
        numero: colunas[0]?.textContent,
        dataHora: colunas[1]?.textContent,
        status: colunas[2]?.textContent,
      };
    });

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `registros_${tipo}.json`;
    a.click();
  }
}