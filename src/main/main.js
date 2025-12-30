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

  mainWindow.maximize();
  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "views", "home", "home.html"));
};

// --- CONTROLE DO PROCESSO COZMO ---
function startCozmo() {
  if (cozmoProcess) return;

  const pythonPath = "/home/majela/Downloads/ZoyBlocks_Electron_Cozmo/venv_cozmo/bin/python";
  const scriptPath = path.join(app.getAppPath(), "python", "cozmo_server.py");

  console.log("--- INICIANDO COZMO ---");
  cozmoProcess = spawn(pythonPath, [scriptPath], { stdio: ["pipe", "pipe", "pipe"] });

  cozmoProcess.on('error', (err) => {
    console.error("ERRO AO INICIAR PYTHON:", err.message);
  });

  cozmoProcess.stdout.on("data", (data) => {
    const msg = data.toString();
    console.log(`[PYTHON]: ${msg}`);
    if (mainWindow) {
        mainWindow.webContents.send("cozmo-log", msg);
    }
  });

  cozmoProcess.stderr.on("data", (data) => console.error(`[PYTHON ERROR]: ${data}`));
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

ipcMain.handle("cozmo:start", () => {
  startCozmo();
  return { status: true };
});

ipcMain.handle('executar-codigo', async (event, codigoJS) => {
    console.log("Executando sequência no Cozmo...");
    
    // Passamos a função enviarParaCozmo diretamente para o service
    try {
        return await blocklyService.executarCodigo(codigoJS, enviarParaCozmo);
    } catch (err) {
        console.error("Erro na execução:", err);
        return { status: false, mensagem: err.message };
    }
});

// Handlers vazios para evitar erros de console no renderer
ipcMain.handle("abrir-terminal", () => {});
ipcMain.handle("abrir-zoy-gpt", () => {});

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