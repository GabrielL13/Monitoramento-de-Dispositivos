import { db, ref, onValue } from "./firebase.js";

const dispositivosRef = ref(db, "Dispositivos");
const tabela = document.getElementById("tabela-dados");

onValue(dispositivosRef, (snapshot) => {
    tabela.innerHTML = "";

    if (!snapshot.exists()) {
        tabela.innerHTML = "<tr><td colspan='4'>Nenhum dispositivo encontrado.</td></tr>";
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
        row.innerHTML = `
            <td>${id}</td>
            <td>${nome}</td>
            <td style="color: ${luzLigado ? "green" : "red"};">${luzLigado ? "Ligado" : "Desligado"}</td>
            <td style="color: ${arLigado ? "green" : "red"};">${arLigado ? "Ligado" : "Desligado"}</td>
        `;

        row.addEventListener("click", () => {
            window.location.href = `registro.html?id=${encodeURIComponent(id)}`;
        });

        tabela.appendChild(row);
    });
});