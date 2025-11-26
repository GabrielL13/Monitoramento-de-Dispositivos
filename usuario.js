import { db, ref, set, get, remove } from "./firebase.js";

const form = document.getElementById("form-usuario");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const matricula = document.getElementById("matriculaUsuario").value.trim();
  const nome = document.getElementById("nomeUsuario").value.trim();
  const email = document.getElementById("emailUsuario").value.trim();
  const senha = document.getElementById("senhaUsuario").value.trim();
  const tipo = document.getElementById("tipoUsuario").value.trim();

  if (!matricula || !nome || !email || !senha || !tipo) {
    mensagem.textContent = "Preencha todos os campos.";
    mensagem.style.color = "orange";
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    mensagem.textContent = "E-mail inválido.";
    mensagem.style.color = "red";
    return;
  }

  try {
    const userRef = ref(db, "User/" + matricula);
    const snap = await get(userRef);

    if (snap.exists()) {
      mensagem.textContent = `A matrícula "${matricula}" já está cadastrada.`;
      mensagem.style.color = "red";
      return;
    }

    const allUsersSnap = await get(ref(db, "User"));
    if (allUsersSnap.exists()) {
      const users = allUsersSnap.val();
      for (const id in users) {
        if (users[id].email === email) {
          mensagem.textContent = "E-mail já cadastrado.";
          mensagem.style.color = "red";
          return;
        }
      }
    }

    await set(ref(db, "User/" + matricula), {
      nome,
      email,
      senha,
      tipo
    });

    mensagem.textContent = "Usuário cadastrado com sucesso!";
    mensagem.style.color = "lightgreen";
    form.reset();
  } catch (err) {
    mensagem.textContent = "Erro ao cadastrar. Tente novamente.";
    mensagem.style.color = "red";
  }
});

const btnOpen = document.getElementById("btnOpenModal");
const btnCancel = document.getElementById("btnCancelModal");
const modal = document.getElementById("modalExclusao");
const btnConfirm = document.getElementById("btnConfirmDelete");
const inputMatricula = document.getElementById("matriculaDelete");

btnOpen.addEventListener("click", () => {
  modal.style.display = "flex";
  inputMatricula.focus();
});

btnCancel.addEventListener("click", () => {
  modal.style.display = "none";
  inputMatricula.value = "";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

btnConfirm.addEventListener("click", async () => {
  const matricula = inputMatricula.value.trim();

  if (!matricula) {
    alert("Por favor, digite uma matrícula.");
    return;
  }

  const userRef = ref(db, "User/" + matricula);
  const snap = await get(userRef);

  if (!snap.exists()) {
    alert("Matrícula não encontrada.");
    return;
  }

  await remove(userRef);
  alert("Usuário removido com sucesso.");

  modal.style.display = "none";
  inputMatricula.value = "";
});