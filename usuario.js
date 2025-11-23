import { db, ref, set, remove } from "./firebase.js";

const form = document.getElementById("form-usuario");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const matricula = document.getElementById("matriculaUsuario").value;
  const nome = document.getElementById("nomeUsuario").value;
  const email = document.getElementById("emailUsuario").value;
  const senha = document.getElementById("senhaUsuario").value;
  const tipo = document.getElementById("tipoUsuario").value;

  await set(ref(db, "User/" + matricula), {
    nome,
    email,
    senha,
    tipo
  });

  mensagem.textContent = "Usuário cadastrado com sucesso!";
  form.reset();
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

  if (matricula === "") {
    alert("Por favor, digite uma matrícula.");
    return;
  }

  await remove(ref(db, "User/" + matricula));

  alert("Usuário removido com sucesso.");

  modal.style.display = "none";
  inputMatricula.value = "";
});