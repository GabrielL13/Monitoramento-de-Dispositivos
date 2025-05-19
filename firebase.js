// Importa a biblioteca do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB6VS7sqzxv84g-WTGk0zxmrZuP6xv9pow",
    authDomain: "monitoramento-de-dispositivos.firebaseapp.com",
    projectId: "monitoramento-de-dispositivos",
    storageBucket: "monitoramento-de-dispositivos.firebasestorage.com",
    messagingSenderId: "317542641450",
    appId: "1:317542641450:web:749d30ed66f148abf0b853",
    measurementId: "G-TX3D42MP4V"
  };  

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Exporta o banco de dados para ser utilizado em outros arquivos
export { database };
