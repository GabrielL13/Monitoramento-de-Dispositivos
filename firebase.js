// Importa funções do Firebase App e Database
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push, update, remove, get } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB6VS7sqzxv84g-WTGk0zxmrZuP6xv9pow",
  authDomain: "monitoramento-de-dispositivos.firebaseapp.com",
  databaseURL: "https://monitoramento-de-dispositivos-default-rtdb.firebaseio.com",
  projectId: "monitoramento-de-dispositivos",
  storageBucket: "monitoramento-de-dispositivos.appspot.com",
  messagingSenderId: "317542641450",
  appId: "1:317542641450:web:ac1e110200ab1b4af0b853",
  measurementId: "G-B97X9GPPE9"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const analytics = getAnalytics(app);

// Exporta para os outros arquivos usarem
export { db, ref, onValue, set, push, update, remove, get };