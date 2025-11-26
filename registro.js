import { db, ref, onValue, get, update, set } from "./firebase.js";

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

function formatarEstadoAr(v) { return v == 1 ? "Ligado" : "Desligado"; }
function formatarEstadoLuz(v) { return v == 1 ? "Ligada" : "Desligada"; }

function carregarRegistros() {
    onValue(refRegAr, (snapshot) => {
        tabelaAr.innerHTML = "";
        const dados = snapshot.val();
        if (dados) {
            const registros = Object.entries(dados);
            registros.sort((a, b) => new Date(b[1].dataHora) - new Date(a[1].dataHora));
            const ultimos50 = registros.slice(0, 50);
            ultimos50.forEach(([, r], index) => {
                tabelaAr.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${r.dataHora}</td>
                        <td>${formatarEstadoAr(r.estado)}</td>
                        <td>${r.temperatura ?? "-"}</td>
                    </tr>`;
            });
        }
    });

    onValue(refRegLuz, (snapshot) => {
        tabelaLuz.innerHTML = "";
        const dados = snapshot.val();
        if (dados) {
            const registros = Object.entries(dados);
            registros.sort((a, b) => new Date(b[1].dataHora) - new Date(a[1].dataHora));
            const ultimos50 = registros.slice(0, 50);
            ultimos50.forEach(([, r], index) => {
                tabelaLuz.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${r.dataHora}</td>
                        <td>${formatarEstadoLuz(r.estado)}</td>
                    </tr>`;
            });
        }
    });
}

carregarRegistros();

powerArBtn.onclick = async () => {
    const snap = await get(refArEstado);
    const estadoAtual = snap.val() ?? 0;
    const novoEstado = estadoAtual === 1 ? 0 : 1;
    await set(refArEstado, novoEstado);
    alert(`Ar ${novoEstado ? "Ligado" : "Desligado"}!`);
};

powerLuzBtn.onclick = async () => {
    const snap = await get(refLuzEstado);
    const estadoAtual = snap.val() ?? 0;
    const novoEstado = estadoAtual ? 0 : 1;
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
    }, 60000);

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
            csv += `Ar,${r.dataHora},${formatarEstadoAr(r.estado)},${r.temperatura ?? "-"}\n`;
        });
    }

    if (dadosLuz) {
        Object.values(dadosLuz).forEach(r => {
            csv += `Luz,${r.dataHora},${formatarEstadoLuz(r.estado)},-\n`;
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