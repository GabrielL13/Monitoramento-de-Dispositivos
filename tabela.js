import { database } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const dispositivosRef = ref(database, "Dispositivos");

// Atualizar tabela em tempo real
onValue(dispositivosRef, (snapshot) => {
    const tabela = document.getElementById("tabela-dados");
    tabela.innerHTML = ""; // Limpa a tabela antes de atualizar

    if (!snapshot.exists()) {
        tabela.innerHTML = "<tr><td colspan='4'>Nenhum dispositivo encontrado.</td></tr>";
        return;
    }

    snapshot.forEach((childSnapshot) => {
        const id = childSnapshot.key;
        const data = childSnapshot.val();

        // Garantir que os valores existam
        const nome = data.nome || "Desconhecido";
        const luzStatus = data.luz ? "Ligado" : "Desligado";
        const arStatus = data.ar ? "Ligado" : "Desligado";
        const luzColor = data.luz ? "green" : "red";
        const arColor = data.ar ? "green" : "red";

        // Criar nova linha para a tabela
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${id}</td>
            <td>${nome}</td>
            <td style="color: ${luzColor};">${luzStatus}</td>
            <td style="color: ${arColor};">${arStatus}</td>
        `;

        tabela.appendChild(row);
    });
});
