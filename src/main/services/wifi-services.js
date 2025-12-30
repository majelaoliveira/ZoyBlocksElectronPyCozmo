// wifi-services.js
// Versão com FILA + ACK + TIMEOUT (compatível com serial-services.js)

const { BrowserWindow } = require('electron');
const WebSocket = require('ws');

let ws = null;
let conectado = false;

let filaComandos = [];
let comandoAtual = null;
let timeoutHandler = null;

const TIMEOUT_PADRAO = 800; // igual ao seu serial
const RETENTATIVAS = 2;

// ================================================================
// Envio de eventos para o front-end (status, logs, terminal)
// ================================================================
function enviarParaRenderer(canal, data) {
    const wins = BrowserWindow.getAllWindows();
    wins.forEach(win => {
        if (!win.isDestroyed()) win.webContents.send(canal, data);
    });
}

function log(msg) {
    enviarParaRenderer("onStatusWifi", { status: "log", mensagem: msg });
    enviarParaRenderer("onDadosWifi", msg);
}

// ================================================================
// Conectar ao WebSocket do robô
// ================================================================
function conectarWifi(ip, porta = 81) {
    return new Promise((resolve, reject) => {
        try {
            ws = new WebSocket(`ws://${ip}:${porta}`);

            ws.on("open", () => {
                conectado = true;
                log("Conectado ao robô via Wi-Fi");
                resolve(true);
            });

            ws.on("message", msg => tratarMensagem(msg.toString()));

            ws.on("close", () => {
                conectado = false;
                log("Wi-Fi desconectado");
            });

            ws.on("error", err => {
                conectado = false;
                log("Erro Wi-Fi: " + err.message);
                reject(err);
            });
        } catch (e) {
            reject(e);
        }
    });
}

// ================================================================
// Lógica da FILA
// ================================================================
function processarFila() {
    if (comandoAtual || filaComandos.length === 0) return;

    comandoAtual = filaComandos[0];
    enviarComandoSemFila(comandoAtual.cmd);

    timeoutHandler = setTimeout(() => {
        comandoAtual.ret++;
        if (comandoAtual.ret > RETENTATIVAS) {
            log(`Timeout no comando ${comandoAtual.cmd}`);

            comandoAtual.reject("timeout");
            finalizarComando();
        } else {
            log(`Reenviando ${comandoAtual.cmd} (${comandoAtual.ret})`);
            enviarComandoSemFila(comandoAtual.cmd);
            timeoutHandler = setTimeout(() => {
                comandoAtual.reject("timeout");
                finalizarComando();
            }, TIMEOUT_PADRAO);
        }
    }, TIMEOUT_PADRAO);
}

function finalizarComando() {
    clearTimeout(timeoutHandler);
    timeoutHandler = null;

    if (comandoAtual) {
        filaComandos.shift();
        comandoAtual = null;
    }

    setTimeout(processarFila, 10);
}

// ================================================================
// Enviar comando direto (usado internamente)
// ================================================================
function enviarComandoSemFila(cmd) {
    if (!conectado || !ws) {
        log("Wi-Fi não conectado");
        return;
    }
    ws.send(cmd + "\n");
    log("(Wi-Fi) enviado: " + cmd);
}

// ================================================================
// API pública para envio (tem fila + promise)
// ================================================================
function enviarComandoWifi(cmd) {
    return new Promise((resolve, reject) => {
        filaComandos.push({
            cmd,
            resolve,
            reject,
            ret: 0
        });
        processarFila();
    });
}

// ================================================================
// Tratamento das mensagens recebidas do robô
// ================================================================
function tratarMensagem(msg) {
    msg = msg.trim();

    enviarParaRenderer("onDadosWifi", msg);

    // === REGRAS DE CONTROLE, iguais às do Serial ===
    if (msg === "ACK") {
        if (comandoAtual) {
            comandoAtual.resolve("OK");
            finalizarComando();
        }
        return;
    }

    if (msg.startsWith("DIGITAL_") || msg.startsWith("ANALOG_") || msg.startsWith("DISTANCIA")) {
        enviarParaRenderer("onRespostaSerial", msg);
        return;
    }

    if (msg === "SERVO_FIM" || msg === "PAUSA_FIM") {
        enviarParaRenderer("onRespostaSerial", msg);
        return;
    }

    // Logs ou outras mensagens
    log(msg);
}

// ================================================================
// Desconectar
// ================================================================
function desconectarWifi() {
    if (ws) ws.close();
    ws = null;
    conectado = false;
    filaComandos = [];
    comandoAtual = null;
}

module.exports = {
    conectarWifi,
    enviarComandoWifi,
    desconectarWifi
};
