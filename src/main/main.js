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


// Se main.js está em src/main/ e o HTML em src/renderer/views/...
mainWindow.loadFile(path.join(__dirname, "..", "renderer", "views", "home", "home.html"));
}


function startCozmo() {
  if (cozmoProcess) return;

  let pythonPath;
  let scriptPath;

  if (app.isPackaged) {
    // No AppImage, os arquivos extras vão para a pasta 'resources'
    pythonPath = path.join(process.resourcesPath, "venv_cozmo", "bin", "python");
    scriptPath = path.join(process.resourcesPath, "python", "cozmo_server.py");
  } else {
    // Em desenvolvimento (npm start):
    // __dirname está em src/main. Precisamos subir dois níveis (..) para chegar na raiz
    pythonPath = path.join(__dirname, "..", "..", "venv_cozmo", "bin", "python");
    scriptPath = path.join(__dirname, "..", "..", "python", "cozmo_server.py");
  }

  console.log("--- INICIANDO COZMO ---");
  console.log("Python:", pythonPath);
  console.log("Script:", scriptPath);

  cozmoProcess = spawn(pythonPath, [scriptPath], { 
    stdio: ["pipe", "pipe", "pipe"],
    // PYTHONUNBUFFERED garante que os logs do Python apareçam em tempo real no Electron
    env: { ...process.env, PYTHONUNBUFFERED: "1" } 
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