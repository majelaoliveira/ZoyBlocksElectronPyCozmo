const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");

// DETECÇÃO DE AMBIENTE MELHORADA
// Se o caminho contém "node_modules", estamos em modo DEV.
const isPackaged = !process.resourcesPath.includes('node_modules') && !process.mainModule.filename.includes('node_modules');

// FUNÇÕES DE CAMINHO (Ajustadas para sua árvore src/main/preload)
function resolveSrcPathLocal(...segments) {
  // Se estiver em DEV: o preload está em src/main/preload, precisamos subir DOIS níveis para chegar na raiz e entrar em src/
  // Se estiver em BUILD: os arquivos estão em process.resourcesPath/src/
  return isPackaged
    ? path.join(process.resourcesPath, "src", ...segments)
    : path.join(__dirname, "..", "..", ...segments); 
}

function resolveSrcPath(...segments) {
  const localPath = resolveSrcPathLocal(...segments);
  return `file://${localPath.replace(/\\/g, "/")}/`;
}

// 1. CARREGAMENTO DO ASSET LOADER
// Usamos o caminho absoluto direto para evitar erro de stack
const assetLoaderPath = resolveSrcPathLocal("renderer", "utils", "assetLoader.js");
let assetLoader = {};
try {
    assetLoader = require(assetLoaderPath);
} catch (e) {
    console.error("Erro crítico: Não foi possível carregar o assetLoader em:", assetLoaderPath);
}

// 2. EXPOSIÇÃO DE CAMINHOS
contextBridge.exposeInMainWorld("paths", {
  blockly: {
    core: resolveSrcPath("assets", "libs", "blockly"),
    media: resolveSrcPath("assets", "libs", "blockly", "media"),
    msg: resolveSrcPath("assets", "libs", "blockly", "msg"),
  },
  blocks_device: {
    cozmo_blocks: resolveSrcPath("assets", "blocks", "cozmo"),
  },
  libs: {
    bootstrap: resolveSrcPath("assets", "libs", "bootstrap"),
  },
  styles: {
    base: resolveSrcPath("assets", "styles"),
  },
  imgs: {
    imgs: resolveSrcPath("assets", "imgs"),
  }
});

// 3. EXPOSIÇÃO DA API (Aqui resolvemos o erro do home.js:2)
contextBridge.exposeInMainWorld("electronAPI", {
  startCozmo: () => ipcRenderer.invoke("cozmo:start"),
  stopCozmo: () => ipcRenderer.invoke("cozmo:stop"),
  executarCodigo: (codigo) => ipcRenderer.invoke('executar-codigo', codigo),
  
  // Para a Câmera
  invoke: (channel, data) => {
    if (channel === "cozmo:camera-toggle") return ipcRenderer.invoke(channel, data);
  },
  onCozmoLog: (callback) => {
    ipcRenderer.on("cozmo-log", (event, data) => callback(data));
  },

  // Utilitários que o home.js procura na linha 2
  utils: {
    loadAssetsGroup: assetLoader.loadAssetsGroup || (() => console.warn("AssetLoader não carregado")),
    ...assetLoader
  }
});