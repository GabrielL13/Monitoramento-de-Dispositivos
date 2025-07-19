import { db, ref, onValue } from "./firebase.js";

const id = localStorage.getItem("dispositivoIdParaRegistro");
if (id) {
    console.log("ID da sala recuperado do localStorage:", id);
    localStorage.removeItem("dispositivoIdParaRegistro");
} else {
    console.error("ID da sala não encontrado no localStorage. Redirecionando para monitoramento.html.");
    window.location.href = "monitoramento.html";
}

const salaNome = document.getElementById("sala-nome");
const tabelaAr = document.getElementById("tabela-ar");
const tabelaLuz = document.getElementById("tabela-luz");
const btnDownloadAr = document.getElementById("download-ar-json");
const btnDownloadLuz = document.getElementById("download-luz-json");

if (id) {
    const salaRef = ref(db, `Dispositivos/${id}/nome`);
    console.log("Buscando nome da sala em:", `Dispositivos/${id}/nome`);
    onValue(salaRef, (snapshot) => {
        if (snapshot.exists()) {
            const nome = snapshot.val();
            console.log("Nome da sala encontrado:", nome);
            salaNome.innerText = nome;
        } else {
            console.warn("Sala não encontrada para o ID:", id);
            salaNome.innerText = "Sala não encontrada";
        }
    });

    function carregarRegistros(caminho, tabela) {
        console.log("Buscando registros em:", caminho);
        const registrosRef = ref(db, caminho);
        onValue(registrosRef, (snapshot) => {
            tabela.innerHTML = "";
            if (snapshot.exists()) {
                const dados = snapshot.val();
                console.log("Registros encontrados:", dados);
                const registrosArray = Object.keys(dados).map(key => dados[key]);
                registrosArray.sort((a, b) => {
                    return new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime();
                });


                registrosArray.forEach((registro, index) => {
                    console.log(`Registro ${index + 1}:`, registro);
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
    carregarRegistros(`Dispositivos/${id}/registros/ar`, tabelaAr);
    carregarRegistros(`Dispositivos/${id}/registros/luz`, tabelaLuz);

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

    btnDownloadAr.addEventListener("click", () => {
        baixarRegistros(`Dispositivos/${id}/registros/ar`, `registros_ar_${id}.json`);
    });
    btnDownloadLuz.addEventListener("click", () => {
        baixarRegistros(`Dispositivos/${id}/registros/luz`, `registros_luz_${id}.json`);
    });
}