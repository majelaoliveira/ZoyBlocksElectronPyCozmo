window.estadoVisao = {
    rostoDetectado: false,
    ultimoQR: ""
};

// Atualize sua memória global no topo do home.js
window.estadoSensores = {
    detectouBorda: false,
    bateria: 0
};


console.log("🧠 Memória de Visão Inicializada!");

// home.js - Versão Cozmo Integrada
const { loadAssetsGroup } = window.electronAPI.utils;
// 1. Variáveis de estado (coloque no início do arquivo)



// 1. Configuração de Assets - Focada apenas no essencial e no Cozmo
const assetsToLoad = {
  css: [
    { name: "base", type: "css", path: `${window.paths.styles.base}base.css` },
  ],
  bootstrap: [
    { name: "bootstrap_css", type: "css", path: `${window.paths.libs.bootstrap}bootstrap.min.css` },
    { name: "bootstrap_js", type: "js", path: `${window.paths.libs.bootstrap}bootstrap.bundle.min.js` },
  ],
  blocklyCore: [
    { name: "blockly_compressed", type: "js", path: `${window.paths.blockly.core}blockly_compressed.js` },
    { name: "blocks_compressed", type: "js", path: `${window.paths.blockly.core}blocks_compressed.js` },
    { name: "javascript_compressed", type: "js", path: `${window.paths.blockly.core}javascript_compressed.js` },
  ],
  blocklyMsg: [
    { name: "pt-br", type: "js", path: `${window.paths.blockly.msg}pt-br.js` },
  ],
  blocklyBlocks: [
    { name: "cozmo_blocks", type: "js", path: `${window.paths.blocks_device.cozmo_blocks}cozmo_motions.js` },
    { name: "cozmo_luzes", type: "js", path: `${window.paths.blocks_device.cozmo_blocks}cozmo_luzes.js` },
    { name: "cozmo_vision", type: "js", path: `${window.paths.blocks_device.cozmo_blocks}cozmo_vision.js` },
    { name: "cozmo_sensors", type: "js", path: `${window.paths.blocks_device.cozmo_blocks}cozmo_sensors.js` },
  ]
};

// 2. Inicialização do Workspace
let workspace = null;

async function initApp() {
  try {
    // Carrega todos os assets necessários
    await loadAssetsGroup(assetsToLoad.css);
    await loadAssetsGroup(assetsToLoad.bootstrap);
    await loadAssetsGroup(assetsToLoad.blocklyCore);
    await loadAssetsGroup(assetsToLoad.blocklyMsg);
    await loadAssetsGroup(assetsToLoad.blocklyBlocks);

    // Injeta o Blockly usando o ID 'toolbox' do home.html
  workspace = Blockly.inject("blocklyDiv", {
  toolbox: document.getElementById("toolbox"),
   renderer: "zelos",
   sound : false,
   grid: null,
   trashcan: true,
   zoom: { controls: true, wheel: true }
    });
    window.workspace = workspace;

    // --- ADICIONE ESTE BLOCO AQUI ---
    window.checarVisao = async function(tipo) {
        if (!window.estadoVisao) return false;
        
        if (tipo === "FACE") {
            return window.estadoVisao.rostoDetectado;
        } else if (tipo === "QR") {
            return window.estadoVisao.ultimoQR !== "";
        }
        return false;

     };

    window.checarBorda = async function() {
    return window.estadoSensores.detectouBorda;
    };

    // Atualiza a área de código sempre que o bloco mudar
    workspace.addChangeListener(() => {
      const code = Blockly.JavaScript.workspaceToCode(workspace);
      document.getElementById("areaCodigo").textContent = code || "# Nenhum bloco no workspace";
    });

    exibirLogNoTerminal("Sistema Pronto. Clique em 'Iniciar Cozmo'.");
  } catch (error) {
    console.error("Erro na inicialização:", error);
  }
}

// 3. Funções de Terminal e UI
function exibirLogNoTerminal(msg) {
  const term = document.getElementById("terminal");
  const div = document.createElement("div");
  div.textContent = `> ${msg}`;
  term.appendChild(div);
  term.scrollTop = term.scrollHeight;
}

// 4. Listeners dos Botões
document.addEventListener("DOMContentLoaded", () => {
  initApp();

  // Botão para Iniciar o Servidor Python do Cozmo
  document.getElementById("btnIniciarCozmo").addEventListener("click", async () => {
    exibirLogNoTerminal("Iniciando conexão com o robô...");
    try {
      await window.electronAPI.startCozmo();
      // --- A MÁGICA ACONTECE AQUI ---
        // Assim que a função startCozmo (que é assíncrona) termina, 
        // liberamos o botão da câmera para o usuário.
      document.getElementById("btnToggleCamera").disabled = false;

      exibirLogNoTerminal("Cozmo pronto para receber comandos!");
    } catch (e) {
      exibirLogNoTerminal("Erro: " + e.message);
    }
  });

  // Botão para Executar os blocos
  document.getElementById("btnExecutarCodigo").addEventListener("click", async () => {
    const codigo = Blockly.JavaScript.workspaceToCode(workspace);
    if (!codigo) {
      exibirLogNoTerminal("Aviso: Workspace vazio.");
      return;
    }
    exibirLogNoTerminal("Executando sequência...");
    const resultado = await window.electronAPI.executarCodigo(codigo);
    if (resultado.status) {
      exibirLogNoTerminal("Execução finalizada.");
    } else {
      exibirLogNoTerminal("Erro na execução: " + resultado.mensagem);
    }
  });

  // Limpar Terminal
  document.getElementById("limparTerminalBtn").addEventListener("click", () => {
    document.getElementById("terminal").innerHTML = "";
  });

  // Toggle Sidebar
  document.getElementById("toggleSidebar").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebarRight");
    const blockly = document.getElementById("blocklyDiv");
    sidebar.classList.toggle("hidden");
    blockly.style.flexBasis = sidebar.classList.contains("hidden") ? "100%" : "70%";
    Blockly.svgResize(workspace);
  });
});

let cameraAtiva = false;

// 2. Atualização dentro do listener de logs
window.electronAPI.onCozmoLog((data) => {
    try {
        const msg = JSON.parse(data);
        
        // Dentro do seu onCozmoLog no home.js
        if (msg.type === "cliff_event") {
            window.estadoSensores.detectouBorda = msg.detected;
    
         if (msg.detected) {
           console.warn("⚠️ PERIGO: Borda detectada!");
           exibirLogNoTerminal("Alerta: Cozmo chegou na borda!");
         }
        }
        // Streaming da Câmera
        if (msg.type === "camera") {
            const view = document.getElementById("cozmoView");
            if (view) view.src = `data:image/jpeg;base64,${msg.image}`;
        }

        // Eventos de Visão do OpenCV
        if (msg.type === "vision_event") {
            // ATENÇÃO: Usamos window.estadoVisao para garantir que o console e o Blockly vejam
            window.estadoVisao.rostoDetectado = msg.face;
            window.estadoVisao.ultimoQR = msg.qrcode;
            
            // Força a escrita no console para você ter certeza que o dado chegou
            if (msg.face) console.log("👤 OpenCV: Rosto na mira!");
            if (msg.qrcode) console.log("🏁 OpenCV: QR Code lido ->", msg.qrcode);
        }
    } catch (e) {
        // console.error("Erro ao processar log do Cozmo:", e);
    }
});
// 2. Controla o botão de ligar/desligar
document.getElementById("btnToggleCamera").addEventListener("click", async () => {
    cameraAtiva = !cameraAtiva;
    const btn = document.getElementById("btnToggleCamera");
    const imgElement = document.getElementById("cozmoView");
    const placeholder = document.getElementById("cameraPlaceholder");

    // Envia o comando para o processo principal (main.js)
    await window.electronAPI.invoke("cozmo:camera-toggle", cameraAtiva);

    // Atualiza a Interface
    if (cameraAtiva) {
        btn.innerText = "Desligar Câmera";
        btn.classList.replace("btn-secondary", "btn-danger");
        imgElement.style.display = "inline-block";
        placeholder.style.display = "none";
    } else {
        btn.innerText = "Ligar Câmera";
        btn.classList.replace("btn-danger", "btn-secondary");
        imgElement.style.display = "none";
        placeholder.style.display = "block";
    }
});