import { db, ref, get } from "./firebase.js";

document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const matricula = document.getElementById("matricula").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("errorMessage");

    if (!matricula || !password) {
        errorMessage.textContent = "Preencha todos os campos.";
        return;
    }

    try {
        const userRef = ref(db, `User/${matricula}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const userData = snapshot.val();

            if (userData.senha === password) {
                if ("tipo" in userData) {
                    localStorage.setItem("matricula", matricula);
                    localStorage.setItem("tipoUsuario", userData.tipo); // 0 ou 1

                    window.location.href = "monitoramento.html";
                } else {
                    errorMessage.textContent = "Usuário sem tipo definido.";
                }
            } else {
                errorMessage.textContent = "Senha incorreta.";
            }
        } else {
            errorMessage.textContent = "Matrícula não encontrada.";
        }
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        errorMessage.textContent = "Erro ao acessar o banco de dados.";
    }
});