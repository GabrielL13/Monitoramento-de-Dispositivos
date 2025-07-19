import { getDatabase, ref, get, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { app } from "./firebaseConfig.js";

const db = getDatabase(app);

export function carregarTabela(tipoUsuario) {
    const tabela = document.getElementById("tabela-dados");
    tabela.innerHTML = "";

    const dispositivosRef = ref(db, "Dispositivos");
    get(dispositivosRef).then((snapshot) => {
        if (snapshot.exists()) {
            const dados = snapshot.val();
            for (let id in dados) {
                const sala = dados[id];
                const linha = document.createElement("tr");

                linha.innerHTML = `
                    <td>${id}</td>
                    <td>${sala.nome || ""}</td>
                    <td>${sala.ar ? "Ligado" : "Desligado"}</td>
                    <td>${sala.luz ? "Ligada" : "Desligada"}</td>
                    <td>${tipoUsuario === 1 ? `<button class="btn-deletar" data-id="${id}" title="Excluir">❌</button>` : ""}</td>
                `;

                if (tipoUsuario === 1) {
                    linha.querySelector(".btn-deletar").addEventListener("click", (e) => {
                        e.stopPropagation();
                        const confirmar = confirm("Tem certeza que deseja excluir esta sala?");
                        if (confirmar) {
                            const salaId = e.target.dataset.id;
                            const salaRef = ref(db, `Dispositivos/${salaId}`);
                            remove(salaRef).then(() => {
                                alert("Sala excluída com sucesso!");
                                carregarTabela(tipoUsuario);
                            });
                        }
                    });
                }

                linha.addEventListener("click", () => {
                    window.location.href = `sala.html?id=${id}`;
                });

                tabela.appendChild(linha);
            }
        }
    });
}