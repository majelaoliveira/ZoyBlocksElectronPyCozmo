// serial-services.js

const { SerialPort, ReadlineParser } = require('serialport');
const { BrowserWindow } = require('electron');

let serialPort = null;
let parser = null;

// ==== VARIÁVEIS PARA CONTROLE DE FLUXO (QUEUE) ====
const commandQueue = [];
let isWaitingForAck = false; // TRUE se estamos esperando PAUSA_FIM, SERVO_FIM, etc.
// ========================================================

function enviarStatusSerial(data) {
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(win => {
        if (!win.isDestroyed()) {
            win.webContents.send('onStatusSerial', data);
        }
    });
}

function enviarDadosSerial(dados) {
    const allWindows = BrowserWindow.getAllWindows();
    // ... (enviar dados para as janelas)
    allWindows.forEach(win => {
        if (!win.isDestroyed()) {
            win.webContents.send('onDadosSerial', dados);
            win.webContents.send('onRespostaSerial', dados);
        }
    });

    // Pega o item ATUAL da fila (o que está esperando resposta)
    const waitingItem = commandQueue[0];

    // Se não há item ou não estamos esperando, ignora (logs espúrios)
    if (!waitingItem || !isWaitingForAck) {
        return;
    }

    let processed = false; // Flag para saber se o dado foi "consumido"

    // --- TRATAMENTO DE RESPOSTA DE SENSOR ---
    if (waitingItem.isSensor) {
        let valor = null;
        if (dados.startsWith("DISTANCIA:") && waitingItem.tag === "ULTRASSOM") {
            valor = parseFloat(dados.split(":")[1]);
            processed = true;
        } else if (dados.startsWith("ANALOG_VALOR:") && waitingItem.tag === "ANALOG_READ") {
            valor = parseInt(dados.split(":")[1]);
            processed = true;
        } else if (dados.startsWith("DIGITAL_VALOR:") && waitingItem.tag === "DIGITAL_READ") {
            valor = parseInt(dados.split(":")[1]);
            processed = true;
        }

        if (processed) {
            waitingItem.resolve(valor); // Resolve a promessa com o valor lido
            commandQueue.shift(); // Remove o item da fila
            isWaitingForAck = false; // Libera o fluxo
            process.nextTick(sendNextCommandFromQueue); // Envia o próximo
            return; // Dado consumido
        }
    }

    // --- TRATAMENTO DE ACK (FIM DE AÇÃO) ---
    // (Apenas se não for uma resposta de sensor já tratada)
    if (dados === 'PAUSA_FIM' || dados === 'SOM_FIM' || dados === 'SERVO_FIM' || dados === 'ACK') {
        if (waitingItem.isWaitingForAck) {
            waitingItem.resolve(); // Resolve a promessa (sem valor)
            commandQueue.shift(); // Remove o item da fila
            processed = true;
        }
        
        isWaitingForAck = false; // Libera o fluxo
        console.log(`[ACK] FIM de Ação (${dados}) recebido. Liberando a fila...`);
        process.nextTick(sendNextCommandFromQueue); // Envia o próximo
        return; // Dado consumido
    }

    // Se o dado não foi processado (log normal do Arduino), apenas ignora
}

async function listarPortas() {
    try {
        const ports = await SerialPort.list();
        const portPaths = ports.map(port => port.path);
        console.log(`[INFO] Portas encontradas: ${portPaths.join(', ')}`);
        return portPaths;
    } catch (error) {
        console.error("Erro ao listar portas:", error);
        return [];
    }
}

async function conectarPorta(porta, baudRate) {
    try {
        if (serialPort && serialPort.isOpen) {
            await serialPort.close();
        }

        serialPort = new SerialPort({
            path: porta,
            baudRate: baudRate,
        });

        serialPort.on('open', () => {
            console.log(`[INFO] Conectado à porta ${porta} com baudrate ${baudRate}`);
            // CORREÇÃO AQUI: Adiciona status: 'conectado'
            enviarStatusSerial({ status: 'conectado', mensagem: `Conectado à porta ${porta}` });
        });

        parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));
        parser.on('data', data => {
            const trimmedData = data.toString().trim();
            if (trimmedData) {
                enviarDadosSerial(trimmedData); // Chama a função que trata ACK
            }
        });

        serialPort.on('close', () => {
            console.log(`[INFO] Desconectado da porta ${porta}`);
            // CORREÇÃO AQUI: Adiciona status: 'desconectado'
            enviarStatusSerial({ status: 'desconectado', mensagem: `Desconectado da porta ${porta}` });
        });

        serialPort.on('error', (err) => {
            console.error(`[ERRO] Erro na porta serial: ${err.message}`);
            // CORREÇÃO AQUI: Adiciona status: 'desconectado'
            enviarStatusSerial({ status: 'desconectado', mensagem: `Erro na porta serial: ${err.message}` });
        });
        
        return { status: true, mensagem: `Conectado à porta ${porta}` };
    } catch (error) {
        console.error("Erro ao conectar na porta:", error);
        // CORREÇÃO AQUI: Adiciona status: 'desconectado'
        enviarStatusSerial({ status: 'desconectado', mensagem: `Falha ao conectar: ${error.message}` });
        return { status: false, mensagem: `Erro ao conectar: ${error.message}` };
    }
}

// desconectarPorta (limpa a fila e rejeita promessas)
async function desconectarPorta() {
    if (serialPort && serialPort.isOpen) {
        try {
            // Rejeita todas as promessas pendentes na fila
            while (commandQueue.length > 0) {
                const item = commandQueue.shift();
                if (item.reject) {
                    item.reject(new Error("Desconectado durante a operação."));
                }
            }
            isWaitingForAck = false; 
            
            // MELHORIA: Remove os listeners ANTES de fechar manualmente
            // Isso evita que o 'on.close' seja disparado e envie um evento 
            // que o renderer não está esperando (já que ele mesmo mandou fechar).
            if (parser) {
                parser.removeAllListeners('data');
                parser = null;
            }
            serialPort.removeAllListeners('open');
            serialPort.removeAllListeners('close');
            serialPort.removeAllListeners('error');
            
            await serialPort.close();
            console.log("[INFO] Desconectando...");
            return { status: true, mensagem: "Desconectado com sucesso." };
        } catch (error) {
            console.error("Erro ao desconectar:", error);
            return { status: false, mensagem: `Erro ao desconectar: ${error.message}` };
        }
    } else {
        return { status: false, mensagem: "Nenhum dispositivo conectado." };
    }
}

// FUNÇÃO CHAVE: Usa callbacks para garantir que a escrita funciona
function enviarComandoSerialImmediate(comando, callback) {
    if (!serialPort || !serialPort.isOpen) {
        return callback(new Error('Dispositivo não conectado.')); 
    }

    const comandoBuffer = Buffer.from(comando + '\n', 'utf-8');

    // Escreve os dados na porta
    serialPort.write(comandoBuffer, (err) => {
        if (err) {
            console.error(`[ERRO] Falha na escrita do comando: ${err.message}`);
            return callback(err); 
        }

        // Garante que o buffer foi totalmente esvaziado
        serialPort.drain((drainErr) => {
            if (drainErr) {
                console.error(`[ERRO] Falha no drain da serial: ${drainErr.message}`);
                return callback(drainErr);
            }
            console.log(`[INFO] Comando enviado: ${comando}`);
            callback(null); // Sucesso
        });
    });
}

// FUNÇÃO CHAVE: Envia o próximo comando da fila, usando o novo método de callback
function sendNextCommandFromQueue() {
    if (commandQueue.length === 0 || isWaitingForAck) {
        return; 
    }

    const nextItem = commandQueue[0]; // Apenas "olha" (peek), não remove
    const { comando, isSensor } = nextItem;
    
    // 1. Define se o comando exige um ACK
    //    (led_pisca_n presumivelmente exige, led_left/right não)
    const requiresAck = comando.startsWith('<AGUARDA') || 
                          comando.startsWith('<PAUSA') || 
                          comando.startsWith('<SOM') ||
                          comando.startsWith('<A:') || // Servo
                          comando.startsWith('<C:') || // Servo
                          comando.startsWith('<LED_TREZE'); // Comando 'led_pisca_n'
    
    isWaitingForAck = true; // Trava a fila
    
    // 2. Envia o comando
    enviarComandoSerialImmediate(comando, (error) => {
        if (error) {
            console.error(`[ERRO] Falha ao enviar comando da fila: ${error.message}`);
            nextItem.reject(error); // Rejeita a promessa
            commandQueue.shift(); // Remove o item falho
            isWaitingForAck = false; 
            setTimeout(sendNextCommandFromQueue, 0); // Tenta o próximo
            return;
        }
        
        // Se o envio foi BEM SUCEDIDO:
        
        if (isSensor) {
            // Foi enviado, agora espera resposta do sensor (tratado em enviarDadosSerial)
            nextItem.isWaitingForSensor = true; 
        } else if (requiresAck) {
            // Foi enviado, agora espera ACK (tratado em enviarDadosSerial)
            nextItem.isWaitingForAck = true;
        } else {
            // Comando "Fire and Forget" (ex: led_left, digital_write)
            // Não precisa de ACK e não é sensor.
            nextItem.resolve({ status: true, mensagem: `Comando ${comando} enviado com sucesso.` }); // Resolve imediatamente
            commandQueue.shift(); // Remove da fila
            isWaitingForAck = false; // Libera para o próximo
            setTimeout(sendNextCommandFromQueue, 0); 
        }
    });
}

// Função pública para adicionar comandos à fila (retorna a promessa real)
async function enviarComandoSerialUnificado(comando, tag = null, isSensor = false) {
  if (!serialPort || !serialPort.isOpen) {
    throw new Error('Dispositivo não conectado.'); // Joga erro, a VM vai pegar
  }

  return new Promise((resolve, reject) => {
    // 1. Criar o objeto 'item' primeiro
    const item = {
      comando,
      tag,
      isSensor,
      resolve,
      reject,
      isWaitingForAck: false,
      isWaitingForSensor: false
    };

    // 2. Adicionar o 'item' à fila
    commandQueue.push(item);

    // 3. Inicia/Continua o processamento da fila
    if (!isWaitingForAck) {
      sendNextCommandFromQueue();
    }

    // Timeout baseado em inatividade, não no tempo total da execução
    let timeoutTimer = setTimeout(() => {
    const index = commandQueue.indexOf(item);
    if (index > -1) {
        item.reject(new Error(`Timeout para o comando: ${comando}`));
        commandQueue.splice(index, 1);
        isWaitingForAck = false;
        sendNextCommandFromQueue();
    }
    }, 5000);

    // Reinicia o timeout toda vez que houver algum dado recebido
    // Isso precisa ser feito com cuidado para não adicionar listeners demais
    const timeoutDataHandler = () => clearTimeout(timeoutTimer);
    if (parser) {
      parser.once('data', timeoutDataHandler); 
      // 'once' garante que o listener é removido após ser chamado
    }
    
    // Limpa o handler se a promessa for resolvida ou rejeitada
    const originalResolve = item.resolve;
    const originalReject = item.reject;
    
    item.resolve = (...args) => {
      clearTimeout(timeoutTimer);
      if(parser) parser.removeListener('data', timeoutDataHandler);
      originalResolve(...args);
    };
    
    item.reject = (...args) => {
      clearTimeout(timeoutTimer);
      if(parser) parser.removeListener('data', timeoutDataHandler);
      originalReject(...args);
    };
  });
}

module.exports = {
    listarPortas,
    conectarPorta,
    desconectarPorta,
    enviarComandoSerial: enviarComandoSerialUnificado,
};