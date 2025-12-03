import { db, ref, onValue, get, set } from "./firebase.js";

const id = localStorage.getItem("dispositivoIdParaRegistro");
const tipoUsuario = localStorage.getItem("tipoUsuario");

if (!id) {
    alert("Sala não encontrada!");
    window.location.href = "index.html";
}

const tabelaAr = document.getElementById("registros-ar");
const tabelaLuz = document.getElementById("registros-luz");
const downloadBtn = document.getElementById("downloadBtn");

const powerArBtn = document.getElementById("powerArBtn");
const powerLuzBtn = document.getElementById("powerLuzBtn");
const temperaturaBtn = document.getElementById("temperaturaBtn");

if (tipoUsuario === "1") {
    downloadBtn.style.display = "block";
}

const refArEstado = ref(db, `Dispositivos/${id}/ar/estado`);
const refLuzEstado = ref(db, `Dispositivos/${id}/luz/estado`);
const refTemperatura = ref(db, `Dispositivos/${id}/ar/temperatura`);
const refTemperaturaFlag = ref(db, `Dispositivos/${id}/ar/temperatura_flag`);

const refRegAr = ref(db, `Dispositivos/${id}/registros/ar`);
const refRegLuz = ref(db, `Dispositivos/${id}/registros/luz`);

function formatarEstadoAr(v) { return v === true ? "Ligado" : "Desligado"; }
function formatarEstadoLuz(v) { return v === true ? "Ligada" : "Desligada"; }

function parseDataHoraBR(str) {
    if (!str) return new Date(0);
    const cleaned = String(str).replace(",", " ").replace(/\s+/g, " ").trim();
    const parts = cleaned.split(" ");
    if (parts.length < 2) return new Date(0);
    const [dataPart, horaPart] = [parts[0], parts.slice(1).join(" ")];
    const dataSplit = dataPart.split("/");
    if (dataSplit.length !== 3) return new Date(0);
    const d = parseInt(dataSplit[0], 10);
    const m = parseInt(dataSplit[1], 10) - 1;
    const a = parseInt(dataSplit[2], 10);
    const horaSplit = horaPart.split(":");
    const hh = parseInt(horaSplit[0] || "0", 10);
    const mm = parseInt(horaSplit[1] || "0", 10);
    const ss = parseInt(horaSplit[2] || "0", 10);
    return new Date(a, m, d, hh, mm, ss);
}

function carregarRegistros() {
    onValue(refRegAr, (snapshot) => {
        tabelaAr.innerHTML = "";
        const dados = snapshot.val();
        if (dados) {
            const registros = Object.entries(dados);
            registros.sort((a, b) => parseDataHoraBR(b[1].dataHora) - parseDataHoraBR(a[1].dataHora));
            const ultimos15 = registros.slice(0, 15);
            ultimos15.forEach(([, r], index) => {
                const estado = r.estado === true ? true : false;
                tabelaAr.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${r.dataHora}</td>
                        <td>${formatarEstadoAr(estado)}</td>
                        <td>${r.temperatura ?? "-"}</td>
                    </tr>`;
            });
        } else {
            tabelaAr.innerHTML = `<tr><td colspan="4">Nenhum registro disponível.</td></tr>`;
        }
    });

    onValue(refRegLuz, (snapshot) => {
        tabelaLuz.innerHTML = "";
        const dados = snapshot.val();
        if (dados) {
            const registros = Object.entries(dados);
            registros.sort((a, b) => parseDataHoraBR(b[1].dataHora) - parseDataHoraBR(a[1].dataHora));
            const ultimos15 = registros.slice(0, 15);
            ultimos15.forEach(([, r], index) => {
                const estado = r.estado === true ? true : false;
                tabelaLuz.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${r.dataHora}</td>
                        <td>${formatarEstadoLuz(estado)}</td>
                    </tr>`;
            });
        } else {
            tabelaLuz.innerHTML = `<tr><td colspan="3">Nenhum registro disponível.</td></tr>`;
        }
    });
}

carregarRegistros();

powerArBtn.onclick = async () => {
    const snap = await get(refArEstado);
    const estadoAtual = snap.val() === true;
    const novoEstado = !estadoAtual;
    await set(refArEstado, novoEstado);
    alert(`Ar ${novoEstado ? "Ligado" : "Desligado"}!`);
};

powerLuzBtn.onclick = async () => {
    const snap = await get(refLuzEstado);
    const estadoAtual = snap.val() === true;
    const novoEstado = !estadoAtual;
    await set(refLuzEstado, novoEstado);
    alert(`Luz ${novoEstado ? "Ligada" : "Desligada"}!`);
};

temperaturaBtn.onclick = async () => {
    let temp = prompt("Defina a temperatura (16 a 31°C):");
    if (temp === null) return;
    temp = Number(temp);
    if (isNaN(temp) || temp < 16 || temp > 31) {
        alert("Temperatura inválida! Use valores entre 16 e 31.");
        return;
    }
    await set(refTemperatura, temp);
    await set(refTemperaturaFlag, true);
    setTimeout(() => {
        set(refTemperaturaFlag, false);
    }, 5000);
    alert("Temperatura enviada!");
};

downloadBtn.onclick = async () => {
    const arSnap = await get(refRegAr);
    const luzSnap = await get(refRegLuz);
    const dadosAr = arSnap.val();
    const dadosLuz = luzSnap.val();
    let csv = "Tipo,Data/Hora,Estado,Temperatura\n";

    if (dadosAr) {
        Object.values(dadosAr).forEach(r => {
            const estado = r.estado === true ? "Ligado" : "Desligado";
            csv += `Ar,${r.dataHora},${estado},${r.temperatura ?? "-"}\n`;
        });
    }

    if (dadosLuz) {
        Object.values(dadosLuz).forEach(r => {
            const estado = r.estado === true ? "Ligada" : "Desligada";
            csv += `Luz,${r.dataHora},${estado},-\n`;
        });
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "registros.csv";
    a.click();

    URL.revokeObjectURL(url);
};