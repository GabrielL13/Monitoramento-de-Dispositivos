import { database } from "./firebase.js";
import { ref, onValue, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Captura o evento de login
document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  let matricula = document.getElementById("matricula").value.trim();
  let password = document.getElementById("password").value.trim();
  let errorMessage = document.getElementById("errorMessage");

  if (!matricula || !password) {
    errorMessage.textContent = "Preencha todos os campos.";
    return;
  }

  try {
    // Busca a matrícula no banco de dados
    const userRef = ref(database, `User/${matricula}/`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      let userData = snapshot.val();

      if (userData.senha === password) {
        window.location.href = "monitoramento.html";
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
