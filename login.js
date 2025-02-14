import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB6VS7sqzxv84g-WTGk0zxmrZuP6xv9pow",
    authDomain: "monitoramento-de-dispositivos.firebaseapp.com",
    projectId: "monitoramento-de-dispositivos",
    storageBucket: "monitoramento-de-dispositivos.firebasestorage.app",
    messagingSenderId: "317542641450",
    appId: "1:317542641450:web:749d30ed66f148abf0b853",
    measurementId: "G-TX3D42MP4V"
  };  

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Captura o evento de login
document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  let matricula = document.getElementById("matricula").value;
  let password = document.getElementById("password").value;
  let errorMessage = document.getElementById("errorMessage");

  if (matricula === "" || password === "") {
    errorMessage.textContent = "Preencha todos os campos.";
    return;
  }

  try {
    // Busca a matrícula no banco de dados
    const userRef = ref(db, `User/${matricula}/`);
    const snapshot = await get(userRef);
    console.error(snapshot);

    if (snapshot.exists()) {
      let userData = snapshot.val();

      if (userData.senha === password) {
        alert("Login bem-sucedido!");
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
