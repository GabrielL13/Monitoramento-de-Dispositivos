import { db, ref, set, get } from "./firebase.js";

const form = document.getElementById("form-dispositivo");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("idSala").value.trim();
  const nome = document.getElementById("nomeSala").value.trim();

  if (!id || !nome) {
    mensagem.textContent = "Preencha todos os campos.";
    mensagem.style.color = "orange";
    return;
  }

  try {
    const dispositivoRef = ref(db, `Dispositivos/${id}`);

    // Verifica se já existe esse ID no banco
    const snapshot = await get(dispositivoRef);
    if (snapshot.exists()) {
      mensagem.textContent = `Já existe uma sala com o ID "${id}".`;
      mensagem.style.color = "red";
      return;
    }

    const dataHora = new Date().toLocaleString("pt-BR");

    const dados = {
      nome,
      ar: false,
      luz: false,
      registros: {
        ar: {
          1: {
            dataHora,
            estado: 0
          }
        },
        luz: {
          1: {
            dataHora,
            estado: 0
          }
        }
      }
    };

    await set(dispositivoRef, dados);

    mensagem.textContent = `Sala "${nome}" cadastrada com sucesso!`;
    mensagem.style.color = "lightgreen";
    form.reset();
  } catch (error) {
    console.error("Erro ao cadastrar sala:", error);
    mensagem.textContent = "Erro ao cadastrar. Tente novamente.";
    mensagem.style.color = "red";
  }
});