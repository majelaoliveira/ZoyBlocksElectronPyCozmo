// device-manager.js
// Unifica Serial + WiFi em uma única API inteligente.

const serial = require("./serial-services");
const wifi = require("./wifi-services");

let modo = "nenhum";  
// valores possíveis: "usb", "wifi", "nenhum"

// ==========================================================
// Atualiza status quando serial conectar/desconectar
// ==========================================================
function setStatusSerial(conectado) {
    if (conectado) {
        modo = "usb";
        console.log("[DeviceManager] USB conectado");
    } else {
        if (modo === "usb") modo = "nenhum";
        console.log("[DeviceManager] USB desconectado");
    }
}

// ==========================================================
// Atualiza status quando Wi-Fi conectar/desconectar
// ==========================================================
function setStatusWifi(conectado) {
    if (conectado) {
        // ESTA É A CORREÇÃO CRÍTICA: Só muda o modo para 'wifi' se 'usb' não estiver ativo.
        if (modo !== "usb") { 
            modo = "wifi";
            console.log("[DeviceManager] Wi-Fi conectado e modo ativado.");
        } else {
            // Se o USB está conectado, o modo continua 'usb'
            console.log("[DeviceManager] Wi-Fi conectado (USB tem prioridade).");
        }
    } else {
        if (modo === "wifi") modo = "nenhum";
        console.log("[DeviceManager] Wi-Fi desconectado");
    }
}

// ==========================================================
// Conectar via USB
// ==========================================================
async function conectarUSB(porta) {
    try {
        await serial.connectToSerialPort(porta);
        setStatusSerial(true);
        return true;
    } catch (e) {
        console.log("[DeviceManager] Falha USB:", e.message);
        setStatusSerial(false);
        return false;
    }
}

// ==========================================================
// Conectar via Wi-Fi
// ==========================================================
async function conectarWifi(ip) {
    try {
        await wifi.conectarWifi(ip);
        setStatusWifi(true);
        return true;
    } catch (e) {
        console.log("[DeviceManager] Falha Wi-Fi:", e.message);
        setStatusWifi(false);
        return false;
    }
}

// ==========================================================
// Desconectar todos
// ==========================================================
function desconectar() {
    serial.desconectarSerial();
    wifi.desconectarWifi();
    modo = "nenhum";
}

// ==========================================================
// Enviar comando (USB → prioridade; Wi-Fi → fallback)
// ==========================================================
async function enviar(cmd) {
    console.log(`[DeviceManager] enviando: ${cmd}`);

    if (modo === "usb") {
        return serial.enviarComandoSerial(cmd);
    }

    if (modo === "wifi") {
        return wifi.enviarComandoWifi(cmd);
    }

    throw new Error("Nenhum dispositivo conectado (USB/Wi-Fi).");
}

// ==========================================================
// Status
// ==========================================================
function getStatus() {
    return modo;
}

module.exports = {
    conectarUSB,
    conectarWifi,
    enviar,
    desconectar,
    getStatus
};


