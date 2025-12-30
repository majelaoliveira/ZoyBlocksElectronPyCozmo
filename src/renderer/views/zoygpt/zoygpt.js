const { loadAssetsGroup } = window.electronAPI.utils;

// Array de assets a serem carregados, usando os caminhos do preload
const assetsToLoad = {
  css: [
    { name: "base", type: "css", path: `${window.paths.styles.base}base.css` },
  ],
  bootstrap: [
    {
      name: "bootstrap_css",
      type: "css",
      path: `${window.paths.libs.bootstrap}bootstrap.min.css`,
    },
    {
      name: "bootstrap_js",
      type: "js",
      path: `${window.paths.libs.bootstrap}bootstrap.bundle.min.js`,
    },
  ],
};

async function initializeImports() {
  try {
    // Carrega CSS Global
    await loadAssetsGroup(assetsToLoad.css);

    // Carrega Bootstrap
    await loadAssetsGroup(assetsToLoad.bootstrap);
  } catch (error) {
    console.error("❌ Erro ao inicializar Importações:", error);
  }
}

// =======================
// 🌟 Funções de Análise e Comando
// =======================
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^\w\s]/g, "") // remove pontuação
    .trim();
}

function coletarConteudo(obj, caminho = "") {
  const resultados = [];
  for (let chave in obj) {
    if (typeof obj[chave] === "string") {
      resultados.push({ texto: obj[chave], origem: caminho + chave });
    } else if (Array.isArray(obj[chave])) {
      obj[chave].forEach((item, idx) => {
        if (typeof item === "string") {
          resultados.push({
            texto: item,
            origem: `${caminho}${chave}[${idx}]`,
          });
        } else if (item.pergunta && item.resposta) {
          resultados.push({
            pergunta: item.pergunta,
            resposta: item.resposta,
            origem: `${caminho}${chave}[${idx}]`,
          });
        } else {
          resultados.push(
            ...coletarConteudo(item, `${caminho}${chave}[${idx}].`)
          );
        }
      });
    } else if (typeof obj[chave] === "object") {
      resultados.push(...coletarConteudo(obj[chave], caminho + chave + "."));
    }
  }
  return resultados;
}

function analisarComando(p) {
  const regexMap = [
    { regex: /(parar|pare|pára|estaciona)/, comando: "<PARAR:0,0>" },
    {
      regex: /(mover|anda|vá|ir).*?(frente|pra frente)/,
      comando: "<MOTOR_FRENTE:150,150>",
    },
    {
      regex: /(mover|anda|vá|ir).*?(tras|pra tras|atrás)/,
      comando: "<MOTOR_TRAS:150,150>",
    },
    {
      regex: /(piscar|pisca|acender|ligar).*?(led|luz).*?(treze|13)/,
      comando: "<LED_TREZE:3>",
    },
    {
      regex:
        /(ler|leitura|ler o valor).*?(sensor|pino).*?anal(ó|o)gico.*?(A[1-5])/,
      comando: (match) => `<ANALOG_READ:${match[4].toUpperCase()}>`,
    },
    {
      regex: /(ler|qual|qual a).*?(ultrassom|distância|distancia)/,
      comando: "<ULTRASSOM:7,8>",
    },
    {
      regex: /(mover|anda|vá|ir).*?(frente|pra frente)/,
      comando: "<MOTOR_FRENTE:150,150>",
    },
    {
      regex: /(acender|ligar|piscar|pisca).*?(led esquerdo)/i,
      comando: "<LED_LEFT:HIGH>",
    },
    { regex: /(apagar|desligar).*?(led esquerdo)/i, comando: "<LED_LEFT:LOW>" },
    {
      regex: /(acender|ligar|piscar|pisca).*?(led direito)/i,
      comando: "<LED_RIGHT:HIGH>",
    },
    { regex: /(apagar|desligar).*?(led direito)/i, comando: "<LED_RIGHT:LOW>" },

    // Motores Esquerdo
    {
      regex:
        /(ligar|mover|anda|vá|ir).*?(motor esquerdo.*?(frente|pra frente))/i,
      comando: "<MOTOR_ESQUERDO_FRENTE>",
    },
    {
      regex:
        /(ligar|mover|anda|vá|ir).*?(motor esquerdo.*?(tras|pra tras|atrás))/i,
      comando: "<MOTOR_ESQUERDO_TRAS>",
    },
    {
      regex: /(parar|desligar|stop).*?(motor esquerdo)/i,
      comando: "<MOTOR_ESQUERDO_PARAR>",
    },

    // Motores Direito
    {
      regex:
        /(ligar|mover|anda|vá|ir).*?(motor direito.*?(frente|pra frente))/i,
      comando: "<MOTOR_DIREITO_FRENTE>",
    },
    {
      regex:
        /(ligar|mover|anda|vá|ir).*?(motor direito.*?(tras|pra tras|atrás))/i,
      comando: "<MOTOR_DIREITO_TRAS>",
    },
    {
      regex: /(parar|desligar|stop).*?(motor direito)/i,
      comando: "<MOTOR_DIREITO_PARAR>",
    },

    {
      regex:
        /(pisca|pisque|piscar).*?(led\s+(esquerdo|direito|[0-9]+)).*?a cada (\d+)\s*(segundo|s).*?por (\d+)\s*vez(es)?/i,
      comando: (match) =>
        `<LED_BLINK:${match[3].toUpperCase()},${match[4]},${match[6]}>`,
    },
  ];

  for (let r of regexMap) {
    const match = p.match(r.regex);
    if (match) {
      return typeof r.comando === "function" ? r.comando(match) : r.comando;
    }
  }
  return null;
}

async function buscarResposta(pergunta) {
  // Primeiro, verifica se é um comando para o robô
  const pNorm = normalize(pergunta);
  const comando = analisarComando(pNorm);

  if (comando) {
    const serialResult = await window.electronAPI.enviarComandoSerial(comando);
    if (serialResult.status) {
      return `Comando enviado com sucesso: ${serialResult.mensagem}`;
    } else {
      return `Erro ao enviar comando: ${serialResult.mensagem}`;
    }
  }

  // Se não for um comando, usa o chatbot (a sua lógica otimizada)
  const chatBotResponse = await window.electronAPI.perguntar(pergunta);
  return chatBotResponse;
}

// =======================
// 🌟 Eventos de input
// =======================
function addMessage(text, from) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = "msg " + from;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", async () => {
  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, "user");
  input.value = "";

  try {
    // Usa a nova função que decide se envia o comando ou consulta o chatbot
    const answer = await buscarResposta(userText);
    addMessage(answer, "gpt");

    // 🔹 Log da conversa
    if (window.electronAPI?.logConversation)
      window.electronAPI.logConversation(userText, answer);
  } catch (err) {
    addMessage("Erro ao buscar resposta: " + err, "gpt");
  }
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

addMessage(
  "Olá! Eu sou o Zoy+GPT. Posso te ajudar sobre o ZoyBlocks e também comandar o robô.",
  "gpt"
);

// Inicialização do app quando DOM estiver pronta
window.addEventListener("DOMContentLoaded", async () => {
  await initializeImports(); // Importa CSS, Bootstrap e Blockly
});
