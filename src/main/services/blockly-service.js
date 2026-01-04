const vm = require("node:vm");

let ultimoQRCode = "";
let rostoVisivel = false;

/**
 * Executa o código JavaScript gerado pelo Blockly em um ambiente seguro.
 * @param {string} codigoJS - O código a ser executado.
 * @param {function} enviarParaPython - Função que comunica com o processo Cozmo.
 */
async function executarCodigo(codigoJS, enviarParaPython) {
  const logs = [];

  // Mapeamento de funções que o Blockly chama para o que o Python entende
  const cozmoActions = {
    
    mostrarExpressao: async (emocao) => {
    enviarParaPython({ cmd: "expression", emotion: emocao });
  // As animações duram em média 1.5 a 2 segundos
   return new Promise(resolve => setTimeout(resolve, 2000));
  },

    mover: async (velocidade, tempo) => {
      const v = parseInt(velocidade);
      const t = parseFloat(tempo);
      
      const comando = { cmd: "move", speed: v, duration: t };
      logs.push(`[ACAO] Mover: ${v} por ${t}s`);
      
      enviarParaPython(comando);
      
      // Espera o tempo do movimento + um pequeno respiro (200ms) para não atropelar
      return new Promise(resolve => setTimeout(resolve, (t * 1000) + 200));
    },

    virar: async (angulo) => {
      const comando = { cmd: "turn", angle: parseInt(angulo) };
      enviarParaPython(comando);
      // O PyCozmo precisa de tempo para girar. 
      // Calculamos aprox. 1.5s para 90 graus.
      return new Promise(resolve => setTimeout(resolve, 1500));
    },
    moverCabeca: async (angulo) => {
    const comando = { cmd: "head", angle: parseInt(angulo) };
    enviarParaPython(comando);
  
    // A cabeça move rápido, 600ms é o suficiente para o respiro
   return new Promise(resolve => setTimeout(resolve, 600));
   },
   moverBraco: async (altura) => {
   const comando = { cmd: "lift", height: parseInt(altura) };
   logs.push(`[ACAO] Mover Braço: ${altura}%`);
  
   enviarParaPython(comando);
  
  // O braço demora um pouco mais a percorrer o curso total
  return new Promise(resolve => setTimeout(resolve, 1000));
   },
    
    parar: async () => {
      logs.push(`[ACAO] Parar`);
      enviarParaPython({ cmd: "stop" });
      return new Promise(resolve => setTimeout(resolve, 200));
    },
    
    pausa: async (ms) => {
      logs.push(`[ACAO] Pausa: ${ms}ms`);
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    ligarLuzes: async (cor) => {
      const comando = { cmd: "set_lights", color: cor };
      logs.push(`[ACAO] Luzes: ${cor}`);
      
      enviarParaPython(comando);
      
      // Respiro de 200ms para garantir que o pacote UDP foi processado
      return new Promise(resolve => setTimeout(resolve, 300));
    },

    piscarLuzes: async (cor, vezes) => {
      const v = parseInt(vezes);
      const comando = { cmd: "blink_lights", color: cor, times: v };
      logs.push(`[ACAO] Piscar: ${cor} ${v}x`);
      
      enviarParaPython(comando);
      
      // O tempo de espera deve ser proporcional ao número de piscadas
      // (Cada piscada no python leva aprox. 600ms total)
      const tempoEspera = (v * 600) + 200;
      return new Promise(resolve => setTimeout(resolve, tempoEspera));
    },

     checarBorda: async () => {
      // Aqui acessamos a variável global que o seu processo principal gerencia
      // Se 'window' não existir aqui (pois é Node), usamos a variável de estado
      return global.estadoSensores?.detectouBorda || false;
    },
  

    checarVisao: async (tipo) => {
        // Esta função "pergunta" para as variáveis que criamos no home.js
        if (tipo === "FACE") {
            return estadoVisao.rostoDetectado; 
        } 
        if (tipo === "QR") {
            // Retorna true se houver algum texto lido no QR Code
            return estadoVisao.ultimoQR !== ""; 
        }
        return false;
    },
    
    // Opcional: bloco para ler o texto do QR Code
    obterTextoQR: async () => {
        return estadoVisao.ultimoQR;
    },



    // Injeta o console para debug se houver logs no código do Blockly
    console: {
      log: (...args) => console.log("[VM LOG]:", ...args)
    }
  };

  try {
    // Cria o contexto com as funções do Cozmo e o setTimeout global
    const contexto = vm.createContext({ ...cozmoActions, setTimeout });
    
    // Envolve o código em uma função assíncrona para suportar 'await mover()'
    const scriptWrapper = `(async () => { 
      try {
        ${codigoJS} 
      } catch (e) {
        console.log('Erro interno na VM:', e.message);
      }
    })()`;

    const script = new vm.Script(scriptWrapper);
    
    // Executa no contexto criado
    await script.runInContext(contexto, { timeout: 30000 }); // 30 segundos de segurança
    
    return { status: true, logs };
  } catch (err) {
    console.error("Falha Crítica na VM:", err);
    return { status: false, mensagem: err.message, logs };
  }
}

module.exports = { executarCodigo };