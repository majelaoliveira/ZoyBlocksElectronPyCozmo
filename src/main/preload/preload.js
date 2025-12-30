const { app, contextBridge, ipcRenderer } = require("electron");
const path = require("path");

// Detecta se o app está empacotado ou rodando em dev
const isPackaged = app?.isPackaged || process.env.NODE_ENV === "production";

// Função auxiliar para gerar caminho dinâmico
function resolveSrcPath(...segments) {
  const base = isPackaged
    ? path.join(process.resourcesPath, "src", ...segments)
    : path.join(__dirname, "../../", ...segments);

  return `file://${base.replace(/\\/g, "/")}/`;
}

// Versão que retorna caminho local (sem file://) - útil para require() dinâmico
function resolveSrcPathLocal(...segments) {
  return isPackaged
    ? path.join(process.resourcesPath, "src", ...segments)
    : path.join(__dirname, "../../", ...segments);
}

// Importa o assetLoader para carregar CSS, JS e imagens dinamicamente
const assetLoaderPath = resolveSrcPathLocal("renderer", "utils", "assetLoader.js");
const assetLoader = require(assetLoaderPath);

// Expor os caminhos de forma organizada (Limpamos blocos antigos, mantivemos assets)
contextBridge.exposeInMainWorld("paths", {
  blockly: {
    core: resolveSrcPath("assets", "libs", "blockly"),
    media: resolveSrcPath("assets", "libs", "blockly", "media"),
    msg: resolveSrcPath("assets", "libs", "blockly", "msg"),
  },
  blocks_device: {
    basic_blocks: resolveSrcPath("assets", "blocks", "basic_blocks"),
    cozmo_blocks: resolveSrcPath("assets", "blocks", "cozmo"), // Adicionado foco no Cozmo
  },
  libs: {
    bootstrap: resolveSrcPath("assets", "libs", "bootstrap"),
  },
  styles: {
    base: resolveSrcPath("assets", "styles"),
  },
  imgs: {
    icons: resolveSrcPath("assets", "icons"), // Mantido conforme solicitado
    imgs: resolveSrcPath("assets", "imgs"),   // Mantido conforme solicitado
    flags: resolveSrcPath("assets", "imgs", "flags"), // Mantido conforme solicitado
  },
  general: {
    assets: resolveSrcPath("assets"),
    services: resolveSrcPath("main", "services"),
    utils: resolveSrcPath("renderer", "utils"),
  },
});

// Expor APIs seguras para o renderer focadas no Cozmo e Blockly
contextBridge.exposeInMainWorld("electronAPI", {
  // Funções de Interface
  abrirTerminalCompleto: () => ipcRenderer.invoke("abrir-terminal-completo"),
  goBack: () => { ipcRenderer.send('navigate-to-view', 'home')},
  openExternal: (url) => ipcRenderer.invoke("open-external", url),

  // Controle do Processo Cozmo (Python Runtime)
  startCozmo: () => ipcRenderer.invoke("cozmo:start"), //
  stopCozmo: () => ipcRenderer.invoke("cozmo:stop"),   //
  enviarComandoCozmo: (cmd) => ipcRenderer.send("cozmo-command", cmd), //

  // Execução de Código Blockly
  executarCodigo: (codigo) => ipcRenderer.invoke('executar-codigo', codigo), //

  // Utils globais (AssetLoader)
  utils: {
    ...assetLoader,
  },
});

// Gerenciador de Dispositivo (Mantido para status de conexão se necessário)
contextBridge.exposeInMainWorld("deviceManager", {
    status: () => ipcRenderer.invoke("dm:status") //
});