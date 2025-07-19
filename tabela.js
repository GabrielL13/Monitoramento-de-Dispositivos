import { db, ref, onValue, remove } from "./firebase.js";

const dispositivosRef = ref(db, "Dispositivos");
const tabela = document.getElementById("tabela-dados");
const tipoUsuario = parseInt(localStorage.getItem("tipoUsuario"));

onValue(dispositivosRef, (snapshot) => {
    tabela.innerHTML = "";

    if (!snapshot.exists()) {
        tabela.innerHTML = "<tr><td colspan='5'>Nenhum dispositivo encontrado.</td></tr>";
        return;
    }

    snapshot.forEach((childSnapshot) => {
        const id = childSnapshot.key;
        const data = childSnapshot.val();

        const nome = data.nome || "Desconhecido";
        const luzLigado = data.luz === true || data.luz === 1 || data.luz === "1";
        const arLigado = data.ar === true || data.ar === 1 || data.ar === "1";

        const row = document.createElement("tr");
        row.style.cursor = "pointer";
        row.dataset.id = id;

        row.innerHTML = `
            <td>${id}</td>
            <td>${nome}</td>
            <td style="color: ${luzLigado ? "green" : "red"};">${luzLigado ? "Ligado" : "Desligado"}</td>
            <td style="color: ${arLigado ? "green" : "red"};">${arLigado ? "Ligado" : "Desligado"}</td>
            ${tipoUsuario === 1 ? `<td><button data-id="${id}" class="deletar-btn">Deletar</button></td>` : ""}
        `;

        row.addEventListener("click", () => {
            localStorage.setItem("dispositivoIdParaRegistro", id);
            window.location.href = "registro.html";
        });

        tabela.appendChild(row);
    });

    if (tipoUsuario === 1) {
        document.querySelectorAll(".deletar-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = btn.getAttribute("data-id");
                const confirmar = confirm(`Deseja realmente deletar o dispositivo ${id}?`);
                if (confirmar) {
                    const salaRef = ref(db, `Dispositivos/${id}`);
                    remove(salaRef).then(() => {
                        alert("Sala deletada com sucesso.");
                    }).catch((err) => {
                        alert("Erro ao deletar sala: " + err.message);
                    });
                }
            });
        });
    }
});