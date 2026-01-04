const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

// Importa os serviços
const blocklyService = require("./services/blockly-service");

// --- 1. MEMÓRIA GLOBAL DO SISTEMA (Acessível pela VM do Blockly) ---
global.estadoVisao = { 
    rostoDetectado: false, 
    ultimoQR: "" 
};
global.estadoSensores = { 
    detectouBorda: false 
};

let mainWindow;
let cozmoProcess = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "views", "home", "home.html"));
};

function startCozmo() {
  if (cozmoProcess) return;

  let pythonPath;
  let scriptPath;

  if (app.isPackaged) {
    pythonPath = path.join(process.resourcesPath, "venv_cozmo", "bin", "python");
    scriptPath = path.join(process.resourcesPath, "python", "cozmo_server.py");
  } else {
    pythonPath = path.join(__dirname, "..", "..", "venv_cozmo", "bin", "python");
    scriptPath = path.join(__dirname, "..", "..", "python", "cozmo_server.py");
  }

  console.log("--- INICIANDO COZMO COM MONITORAMENTO DE SENSORES ---");
  
  cozmoProcess = spawn(pythonPath, [scriptPath], { 
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, PYTHONUNBUFFERED: "1" } 
  });

  // --- ESCUTA ATIVA DO PYTHON (Sincronização Main Process <-> VM) ---
  cozmoProcess.stdout.on("data", (data) => {
    const rawMsg = data.toString();
    
    try {
        // Divide por quebras de linha caso cheguem vários JSONs juntos
        const lines = rawMsg.split('\n');
        lines.forEach(line => {
            if (!line.trim()) return;
            const msg = JSON.parse(line);

            // 1. Sincroniza Visão com a Global
            if (msg.type === "vision_event") {
                global.estadoVisao.rostoDetectado = msg.face;
                global.estadoVisao.ultimoQR = msg.qrcode || "";
            }

            // 2. Sincroniza Sensores (Cliff/Penhasco) com a Global
            if (msg.type === "cliff_event") {
                global.estadoSensores.detectouBorda = msg.detected;
                console.log(`[SENSOR] Borda detectada: ${msg.detected}`);
            }
        });
    } catch (e) {
        // Ignora mensagens que não são JSON (ex: prints de debug do Python)
    }

    if (mainWindow) {
        mainWindow.webContents.send("cozmo-log", rawMsg);
    }
  });

  cozmoProcess.stderr.on("data", (data) => {
    console.error("Erro no Python:", data.toString());
  });

  cozmoProcess.on("close", (code) => {
    console.log(`Processo Python encerrado com código: ${code}`);
    cozmoProcess = null;
  });
}

function enviarParaCozmo(comando) {
    if (cozmoProcess && cozmoProcess.stdin.writable) {
        const jsonStr = JSON.stringify(comando) + "\n";
        cozmoProcess.stdin.write(jsonStr);
        return true;
    }
    return false;
}

// --- HANDLERS IPC ---

ipcMain.handle("cozmo:start", () => {
  startCozmo();
  return { status: true };
});

ipcMain.handle("cozmo:camera-toggle", (event, state) => {
  enviarParaCozmo({ cmd: "toggle_camera", enable: state });
  return { status: true };
});

ipcMain.handle('executar-codigo', async (event, codigoJS) => {
    try {
        // A VM agora lerá os valores de global.estadoVisao e global.estadoSensores
        return await blocklyService.executarCodigo(codigoJS, enviarParaCozmo);
    } catch (err) {
        console.error("Erro na execução:", err);
        return { status: false, mensagem: err.message };
    }
});

ipcMain.handle("open-external", (event, url) => shell.openExternal(url));

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (cozmoProcess) {
    enviarParaCozmo({ cmd: "stop" });
    cozmoProcess.kill();
  }
});