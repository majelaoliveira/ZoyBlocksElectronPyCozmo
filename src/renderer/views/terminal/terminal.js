/* terminal.js */

const {
  enviarComandoSerial,
  onRespostaSerial,
  onStatusSerial,
  onDadosSerial,
  onErroSerial,
} = window.electronAPI;

const terminal = document.getElementById("terminal");
const comandoInput = document.getElementById("comando-input");
const enviarBtn = document.getElementById("enviar-btn");

function appendMessage(msg, className = "") {
  const div = document.createElement("div");
  div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  div.className = className;
  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight; // sempre rola para o fim
}

enviarBtn.addEventListener("click", () => {
  const comando = comandoInput.value.trim();
  if (comando) {
    enviarComandoSerial(comando)
      .then(() => {
        appendMessage(`> ${comando}`, "message-type-sent");
        comandoInput.value = "";
      })
      .catch((error) => {
        appendMessage(`ERRO: ${error.mensagem}`, "message-type-error");
      });
  }
});

comandoInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    enviarBtn.click();
  }
});

// Escuta eventos vindos do main.js
onDadosSerial((data) => appendMessage(data, "message-type-received"));
onStatusSerial((data) =>
  appendMessage("Status: " + data.mensagem, "message-type-system")
);
onErroSerial((data) =>
  appendMessage("Erro: " + data.mensagem, "message-type-error")
);

appendMessage(
  "Terminal completo carregado e pronto para comunicação.",
  "message-type-system"
);
