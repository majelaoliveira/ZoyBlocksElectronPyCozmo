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

// Expor os caminhos de forma organizada
contextBridge.exposeInMainWorld("paths", {
  blockly: {
    core: resolveSrcPath("assets", "libs", "blockly"),
    media: resolveSrcPath("assets", "libs", "blockly", "media"),
    msg: resolveSrcPath("assets", "libs", "blockly", "msg"),
  },
  blocks_device: {
    basic_blocks: resolveSrcPath("assets", "blocks", "basic_blocks"),
    zoy_steam_blocks: resolveSrcPath("assets", "blocks", "zoy", "zoy_steam_blocks"),
    arduino_nano_blocks: resolveSrcPath("assets", "blocks", "arduino", "arduino_nano_blocks"),
    arduino_uno_blocks: resolveSrcPath("assets", "blocks", "arduino", "arduino_uno_blocks"),
  },
  libs: {
    bootstrap: resolveSrcPath("assets", "libs", "bootstrap"),
  },
  styles: {
    base: resolveSrcPath("assets", "styles"),
  },
  imgs: {
    icons: resolveSrcPath("assets", "icons"),
    imgs: resolveSrcPath("assets", "imgs"),
    flags: resolveSrcPath("assets", "imgs", "flags"),
  },
  general: {
    assets: resolveSrcPath("assets"),
    services: resolveSrcPath("main", "services"),
    utils: resolveSrcPath("renderer", "utils"),
  },
});

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld("electronAPI", {
  // Função para abrir janelas
  abrirZoyGPT: () => ipcRenderer.invoke("abrir-zoygpt"),
  abrirZoyVision: () => ipcRenderer.invoke("abrir-zoy-vision"),
  abrirTerminalCompleto: () => ipcRenderer.invoke("abrir-terminal-completo"),
  abrirZoyGames: () => ipcRenderer.invoke("abrir-zoygames"),
  abrirBlocklyGames: () => ipcRenderer.invoke("abrir-blocklygames"),

  // Funções para o chatbot
  perguntar: (pergunta) => ipcRenderer.invoke('perguntar', pergunta),
  logConversation: (pergunta, resposta) => ipcRenderer.invoke('log-conversation', pergunta, resposta),

  // Fuções para conexão de dispositivos
  listarPortas: () => ipcRenderer.invoke('listar-portas'),
  conectarPorta: (porta, baudrate) => ipcRenderer.invoke('conectar-porta', porta, baudrate),
  desconectarPorta: () => ipcRenderer.invoke('desconectar-porta'),

  // Utils globais disponíveis para todas as views - não usa ipcRenderer porque é tudo direto no renderer, não há comunicação com o main ou outro processo fora do renderer
  utils: {
    ...assetLoader, // exporta loadCSS, loadScript, loadImage, loadAssetsGroup
  },

  // Eventos para status e dados da serial
  
   onStatusSerial: (callback) => ipcRenderer.on('onStatusSerial', (event, data) => callback(data)),
   onDadosSerial: (callback) => ipcRenderer.on('onDadosSerial', (event, data) => callback(data)),
   onErroSerial: (callback) => ipcRenderer.on('onErroSerial', (event, data) => callback(data)),
   onRespostaSerial: (callback) => ipcRenderer.on('onRespostaSerial', (event, data) => callback(data)),
   
  // Funções para envio de dados e execução de código
   executarCodigo: (codigo) => ipcRenderer.invoke('executar-codigo', codigo),
   enviarComandoSerial: (comando) => ipcRenderer.invoke('enviar-comando-serial', comando),

   // Adiciona a função goBack, que envia uma mensagem IPC para o Main
   // Usamos 'navigate-to-view' com o nome da view de destino
   goBack: () => { ipcRenderer.send('navigate-to-view', 'home')},

  // Expor a API segura para abrir URLs externas
  // Adicionando a função openExternal no contexto
  openExternal: (url) => ipcRenderer.invoke("open-external", url),

});

contextBridge.exposeInMainWorld("wifiAPI", {
    conectarWifi: (ip) => ipcRenderer.invoke("wifi:conectar", ip),
    enviarWifi: (cmd) => ipcRenderer.invoke("wifi:enviar", cmd),
    desconectarWifi: () => ipcRenderer.invoke("wifi:desconectar"),
    onStatusWifi: (cb) => ipcRenderer.on("onStatusWifi", (_, data) => cb(data)),
    onDadosWifi: (cb) => ipcRenderer.on("onDadosWifi", (_, data) => cb(data)),
});


contextBridge.exposeInMainWorld("deviceManager", {
    conectarUSB: (porta) => ipcRenderer.invoke("dm:conectarUSB", porta),
    conectarWifi: (ip)    => ipcRenderer.invoke("dm:conectarWifi", ip),
    enviar:       (cmd)   => ipcRenderer.invoke("dm:enviar", cmd),
    desconectar:          () => ipcRenderer.invoke("dm:desconectar"),
    status:              () => ipcRenderer.invoke("dm:status")
});
