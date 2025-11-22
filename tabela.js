import { db, ref, onValue, remove } from "./firebase.js";

const DISPOSITIVOS_REF = ref(db, "Dispositivos");
const TABELA_DADOS = document.getElementById("tabela-dados");
const ADMIN_BUTTONS = document.getElementById("adminButtons");
const LOGOUT_BTN = document.getElementById("logout-btn");
const TH_DELETAR = document.getElementById("th-deletar");

function inicializarInterface() {
    const matricula = localStorage.getItem('matricula');
    const tipoUsuarioStr = localStorage.getItem('tipoUsuario');

    if (!matricula || (tipoUsuarioStr !== '0' && tipoUsuarioStr !== '1')) {
        window.location.href = "index.html"; 
        return null;
    }
    
    const tipoUsuario = parseInt(tipoUsuarioStr);

    if (tipoUsuario === 1) {
        if(ADMIN_BUTTONS) ADMIN_BUTTONS.style.display = "flex";
        if(TH_DELETAR) TH_DELETAR.style.display = "table-cell";
    } else {
        if(ADMIN_BUTTONS) ADMIN_BUTTONS.style.display = "none";
        if(TH_DELETAR) TH_DELETAR.style.display = "none";
    }

    if(LOGOUT_BTN) {
        LOGOUT_BTN.addEventListener('click', fazerLogout);
    }

    return tipoUsuario;
}

function fazerLogout() {
    localStorage.removeItem('matricula');
    localStorage.removeItem('tipoUsuario');
    window.location.href = "index.html"; 
}


function deletarDispositivo(id) {
    const confirmar = confirm(`Deseja realmente deletar o dispositivo ${id}?`);
    if (confirmar) {
        const salaRef = ref(db, `Dispositivos/${id}`);
        remove(salaRef).then(() => {
            alert(`Sala ${id} deletada com sucesso.`);
        }).catch((err) => {
            alert("Erro ao deletar sala: " + err.message);
        });
    }
}

function carregarDispositivos(tipoUsuario) {
    onValue(DISPOSITIVOS_REF, (snapshot) => {
        TABELA_DADOS.innerHTML = "";
        
        const colspan = (tipoUsuario === 1) ? 6 : 5; 

        if (!snapshot.exists()) {
            TABELA_DADOS.innerHTML = `<tr><td colspan='${colspan}'>Nenhum dispositivo encontrado.</td></tr>`;
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const id = childSnapshot.key;
            const data = childSnapshot.val();

            const nome = data.nome || "Desconhecido";
            
            const luzLigado = data.luz === true || data.luz === 1 || data.luz === "1";
            const arLigado = data.ar === true || data.ar === 1 || data.ar === "1";

            let temperaturaTexto = "-"; 

            if (data.temperatura !== undefined && data.temperatura !== null) {
                temperaturaTexto = `${data.temperatura}°C`;
            }

            const row = document.createElement("tr");
            row.style.cursor = "pointer";
            row.dataset.id = id;

            row.innerHTML = `
                <td>${id}</td>
                <td>${nome}</td>
                <td style="color: ${luzLigado ? "green" : "red"}; font-weight: bold;">
                    ${luzLigado ? "Ligado" : "Desligado"}
                </td>
                <td style="color: ${arLigado ? "green" : "red"}; font-weight: bold;">
                    ${arLigado ? "Ligado" : "Desligado"}
                </td>
                <td style="font-weight: bold;">${temperaturaTexto}</td>
                ${tipoUsuario === 1 ? `<td><button data-id="${id}" class="deletar-btn">Deletar</button></td>` : ""}
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
                    deletarDispositivo(btn.getAttribute("data-id"));
                });
            });
        }
    }, (error) => {
        console.error("Erro ao ler dados do Firebase:", error);
        TABELA_DADOS.innerHTML = `<tr><td colspan='${colspan}'>Erro ao carregar os dados.</td></tr>`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const tipoUsuario = inicializarInterface();
    
    if (tipoUsuario !== null) {
        carregarDispositivos(tipoUsuario);
    }
});