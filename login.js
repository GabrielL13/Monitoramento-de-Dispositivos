import { db, ref, get } from "./firebase.js";

// Captura o evento de login
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
        // Busca a matrícula no banco de dados
        const userRef = ref(db, `User/${matricula}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const userData = snapshot.val();

            if (userData.senha === password) {
                window.location.href = "monitoramento.html"; // Redireciona após login bem-sucedido
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