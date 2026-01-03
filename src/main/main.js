const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

// Importa os serviços
const blocklyService = require("./services/blockly-service");

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

  // Caminho correto para o HTML baseado na sua árvore src/
  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "views", "home", "home.html"));
};

function startCozmo() {
  if (cozmoProcess) return;

  let pythonPath;
  let scriptPath;

  if (app.isPackaged) {
    // Caminhos para o AppImage
    pythonPath = path.join(process.resourcesPath, "venv_cozmo", "bin", "python");
    scriptPath = path.join(process.resourcesPath, "python", "cozmo_server.py");
  } else {
    // Caminhos para Desenvolvimento (npm start)
    pythonPath = path.join(__dirname, "..", "..", "venv_cozmo", "bin", "python");
    scriptPath = path.join(__dirname, "..", "..", "python", "cozmo_server.py");
  }

  console.log("--- INICIANDO COZMO ---");
  
  cozmoProcess = spawn(pythonPath, [scriptPath], { 
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, PYTHONUNBUFFERED: "1" } 
  });

  // CORREÇÃO: O ouvinte de dados deve estar DENTRO da função, 
  // imediatamente após o processo ser criado (spawn).
  cozmoProcess.stdout.on("data", (data) => {
    const msg = data.toString();
    if (mainWindow) {
        // Envia logs e frames da câmera para o Renderer (home.js)
        mainWindow.webContents.send("cozmo-log", msg);
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

// Função para enviar JSON ao Python via stdin
function enviarParaCozmo(comando) {
    if (cozmoProcess && cozmoProcess.stdin.writable) {
        const jsonStr = JSON.stringify(comando) + "\n";
        cozmoProcess.stdin.write(jsonStr);
        console.log("Enviado para Python:", jsonStr);
        return true;
    }
    console.error("Erro: stdin do Python não está acessível.");
    return false;
}

// --- HANDLERS IPC ---

// Iniciar o robô
ipcMain.handle("cozmo:start", () => {
  startCozmo();
  return { status: true };
});

// Ligar/Desligar Câmera
ipcMain.handle("cozmo:camera-toggle", (event, state) => {
  enviarParaCozmo({ cmd: "toggle_camera", enable: state });
  return { status: true };
});

// Executar blocos do Blockly
ipcMain.handle('executar-codigo', async (event, codigoJS) => {
    try {
        return await blocklyService.executarCodigo(codigoJS, enviarParaCozmo);
    } catch (err) {
        console.error("Erro na execução:", err);
        return { status: false, mensagem: err.message };
    }
});

// Handlers auxiliares
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