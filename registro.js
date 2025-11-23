import { db, ref, onValue, get, update, push } from "./firebase.js";

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

// botão de download apenas para tipoUsuario = 1
if (tipoUsuario === "1") {
    downloadBtn.style.display = "block";
}

// === REFERÊNCIAS CORRETAS PARA SUA ÁRVORE ===
const refArEstado = ref(db, `Dispositivos/${id}/ar`);
const refLuzEstado = ref(db, `Dispositivos/${id}/luz`);

const refTemperatura = ref(db, `Dispositivos/${id}/temperatura`);
const refTemperaturaFlag = ref(db, `Dispositivos/${id}/temperatura_flag`);

const refRegAr = ref(db, `Dispositivos/${id}/registros/ar`);
const refRegLuz = ref(db, `Dispositivos/${id}/registros/luz`);


// === FORMATADORES ===
function formatarEstadoAr(v) { return v == 1 ? "Ligado" : "Desligado"; }
function formatarEstadoLuz(v) { return v == 1 ? "Ligada" : "Desligada"; }


// === CARREGAR REGISTROS ===
function carregarRegistros() {
    onValue(refRegAr, (snapshot) => {
        tabelaAr.innerHTML = "";
        const dados = snapshot.val();
        if (dados) {
            const chaves = Object.keys(dados).slice(-50);
            chaves.forEach((key, index) => {
                const r = dados[key];
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
            const chaves = Object.keys(dados).slice(-50);
            chaves.forEach((key, index) => {
                const r = dados[key];
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


// === POWER AR ===
powerArBtn.onclick = async () => {
    const snap = await get(refArEstado);
    const estadoAtual = snap.val() ?? 0;
    const novoEstado = estadoAtual === 1 ? 0 : 1;

    await update(refArEstado, novoEstado);

    const tempSnap = await get(refTemperatura);

    push(refRegAr, {
        dataHora: new Date().toLocaleString(),
        estado: novoEstado,
        temperatura: tempSnap.val() ?? "-"
    });

    alert(`Ar ${novoEstado ? "Ligado" : "Desligado"}!`);
};


// === POWER LUZ ===
powerLuzBtn.onclick = async () => {
    const snap = await get(refLuzEstado);
    const estadoAtual = snap.val() ?? 0;
    const novoEstado = estadoAtual ? 0 : 1;

    await update(refLuzEstado, novoEstado);

    push(refRegLuz, {
        dataHora: new Date().toLocaleString(),
        estado: novoEstado
    });

    alert(`Luz ${novoEstado ? "Ligada" : "Desligada"}!`);
};


// === DEFINIR TEMPERATURA ===
temperaturaBtn.onclick = async () => {
    let temp = prompt("Defina a temperatura (16 a 31°C):");

    if (temp === null) return;

    temp = Number(temp);
    if (isNaN(temp) || temp < 16 || temp > 31) {
        alert("Temperatura inválida! Use valores entre 16 e 31.");
        return;
    }

    await update(refTemperatura, temp);
    await update(refTemperaturaFlag, true);

    push(refRegAr, {
        dataHora: new Date().toLocaleString(),
        estado: 1,
        temperatura: temp
    });

    setTimeout(() => {
        update(refTemperaturaFlag, false);
    }, 60000);

    alert("Temperatura enviada!");
};


// === DOWNLOAD CSV ===
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