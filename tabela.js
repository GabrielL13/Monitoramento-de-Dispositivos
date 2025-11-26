import { db, ref, onValue, remove } from "./firebase.js";

const DISPOSITIVOS_REF = ref(db, "Dispositivos");
const TABELA_DADOS = document.getElementById("tabela-dados");
const ADMIN_BUTTONS = document.getElementById("adminButtons");
const LOGOUT_BTN = document.getElementById("logout-btn");
const TH_DELETAR = document.getElementById("th-deletar");

function inicializarInterface() {
    const matricula = localStorage.getItem('matricula');
    const tipoUsuarioStr = localStorage.getItem('tipoUsuario');

    if (!matricula || (tipoUsuarioStr !== "0" && tipoUsuarioStr !== "1")) {
        window.location.href = "index.html";
        return null;
    }
    
    const tipoUsuario = Number(tipoUsuarioStr);

    if (tipoUsuario === 1) {
        ADMIN_BUTTONS.style.display = "flex";
        TH_DELETAR.style.display = "table-cell";
    } else {
        ADMIN_BUTTONS.style.display = "none";
        TH_DELETAR.style.display = "none";
    }

    LOGOUT_BTN.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = "index.html";
    });

    return tipoUsuario;
}

function deletarDispositivo(id) {
    if (confirm(`Deseja realmente deletar o dispositivo ${id}?`)) {
        const salaRef = ref(db, `Dispositivos/${id}`);
        remove(salaRef).then(() => {
            alert(`Sala ${id} deletada com sucesso.`);
        }).catch((err) => {
            alert("Erro ao deletar sala: " + err.message);
        });
    }
}

function carregarDispositivos(tipoUsuario) {
    const colspan = tipoUsuario === 1 ? 6 : 5;

    onValue(DISPOSITIVOS_REF, (snapshot) => {
        TABELA_DADOS.innerHTML = "";
        
        if (!snapshot.exists()) {
            TABELA_DADOS.innerHTML = `<tr><td colspan='${colspan}'>Nenhum dispositivo encontrado.</td></tr>`;
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const id = childSnapshot.key;
            const data = childSnapshot.val();

            const nome = data.nome || "Desconhecido";

            const luzLigado = data.luz?.estado == 1;
            const arLigado = data.ar?.estado == 1;

            const temperatura = data.ar?.temperatura;
            const temperaturaTexto = temperatura !== undefined ? `${temperatura}°C` : "-";

            const row = document.createElement("tr");
            row.dataset.id = id;

            row.innerHTML = `
                <td>${id}</td>
                <td>${nome}</td>
                <td style="color:${luzLigado ? "green" : "red"};font-weight:bold;">
                    ${luzLigado ? "Ligado" : "Desligado"}
                </td>
                <td style="color:${arLigado ? "green" : "red"};font-weight:bold;">
                    ${arLigado ? "Ligado" : "Desligado"}
                </td>
                <td style="font-weight:bold;">${temperaturaTexto}</td>
                ${tipoUsuario === 1 ? `<td><button class="deletar-btn" data-id="${id}">Deletar</button></td>` : ""}
            `;

            row.addEventListener("click", () => {
                localStorage.setItem("dispositivoIdParaRegistro", id);
                window.location.href = "registro.html";
            });

            TABELA_DADOS.appendChild(row);
        });

        if (tipoUsuario === 1) {
            document.querySelectorAll(".deletar-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    deletarDispositivo(e.target.dataset.id);
                });
            });
        }
    }, () => {
        TABELA_DADOS.innerHTML = `<tr><td colspan='${colspan}'>Erro ao carregar os dados.</td></tr>`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const tipoUsuario = inicializarInterface();
    if (tipoUsuario !== null) carregarDispositivos(tipoUsuario);
});