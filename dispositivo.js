import { db, ref, set, get, push } from "./firebase.js";

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

    const snapshot = await get(dispositivoRef);
    if (snapshot.exists()) {
      mensagem.textContent = `Já existe uma sala com o ID "${id}".`;
      mensagem.style.color = "red";
      return;
    }

    const dataHora = new Date().toLocaleString("pt-BR");

    const dados = {
      nome,
      ar: {
        estado: 0,
        temperatura: -1,
        temperatura_flag: 0
      },
      luz: {
        estado: 0
      },
      registros: {
        ar: {},
        luz: {}
      }
    };

    await set(dispositivoRef, dados);

    const registrosArRef = ref(db, `Dispositivos/${id}/registros/ar`);
    const registrosLuzRef = ref(db, `Dispositivos/${id}/registros/luz`);

    await push(registrosArRef, { dataHora, estado: 0, temperatura: -1 });
    await push(registrosLuzRef, { dataHora, estado: 0 });

    mensagem.textContent = `Sala "${nome}" cadastrada com sucesso!`;
    mensagem.style.color = "lightgreen";
    form.reset();

  } catch (error) {
    console.error("Erro ao cadastrar sala:", error);
    mensagem.textContent = "Erro ao cadastrar. Tente novamente.";
    mensagem.style.color = "red";
  }
});