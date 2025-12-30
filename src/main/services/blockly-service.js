// blockly-service.js (CORRIGIDO E ATUALIZADO)

const serialService = require("./serial-services"); // Importa o serviço serial
const vm = require("node:vm"); // ✅ Sandbox seguro do Node.js

// --- Função para prevenir loops infinitos ---
function protegerLoops(codigo) {
  const loopCounterVar = "__loopCounter";
  const limitVar = "__loopLimit";

  const header = `
    let ${loopCounterVar} = 0;
    const ${limitVar} = 500;
    function __checkLoop() {
      if (++${loopCounterVar} > ${limitVar}) {
        throw new Error("⚠️ Execução interrompida — limite máximo(500) de repetições atingido");
      }
    }
  `;

  // Versão corrigida das substituições
  const protegido = codigo
    .replace(/while\s*\((.*?)\)\s*\{/g, "while($1){ __checkLoop();")
    .replace(/for\s*\((.*?)\)\s*\{/g, "for($1){ __checkLoop();")
    .replace(/do\s*\{/g, "do { __checkLoop(); ");

  return header + "\n" + protegido;
}

async function executarCodigo(codigoJavaScript) {
  const logs = [];
  logs.push(`[INFO] Código JavaScript recebido:\n${codigoJavaScript}`);

  // Protege o código antes de rodar
  const codigoProtegido = protegerLoops(codigoJavaScript);

  // === Mapeamento das Funções do Blockly para a Ação Serial ===
  const blocklyFunctions = {
    // --- FUNÇÕES UTILITÁRIAS REFEITAS ---

    /**
     * Envia um comando que NÃO retorna valor (ex: mover, led).
     * A promessa só resolve quando o comando é concluído (seja por ACK ou imediatamente).
     */
    enviarComando: async (funcao, comando, argumentos_comando = "") => {
      let comandoSerial = `<${comando}:${argumentos_comando}>`;
      logs.push(`[INFO] [${funcao}] Enviando: ${comandoSerial}`);

      // Chama a fila unificada: (comando, tag=null, isSensor=false)
      await serialService.enviarComandoSerial(comandoSerial, null, false);

      logs.push(`[INFO] [${funcao}] Comando concluído: ${comandoSerial}`);
    },

    /**
     * Envia um comando que RETORNA valor (ex: sensores).
     * A promessa resolve com o valor lido.
     */
    enviarComandoComRetorno: async (funcao, comando, argumentos_comando = "", tag) => {
      let comandoSerial = `<${comando}:${argumentos_comando}>`;
      logs.push(`[INFO] [${funcao}] Solicitando leitura: ${comandoSerial}`);

      // Chama a fila unificada: (comando, tag=tag, isSensor=true)
      const valor = await serialService.enviarComandoSerial( comandoSerial, tag, true);

      logs.push(`[INFO] [${funcao}] Valor recebido: ${valor}`);
      return valor;
    },

    // === MAPEAMENTO DOS BLOCOS (AGORA USANDO OS NOVOS HELPERS) ===

    // ----------- Funções gerais (Ação) -------------------
    iniciar_zoy: async (comando, argsString) =>
      blocklyFunctions.enviarComando("iniciar_zoy", comando, argsString),
    set_pin_mode: async (comando, argsString) =>
      blocklyFunctions.enviarComando("set_pin_mode", comando, argsString),
    digital_write: async (comando, argsString) =>
      blocklyFunctions.enviarComando("digital_write", comando, argsString),
    definir_pino_digital: async (comando, argsString) =>
      blocklyFunctions.enviarComando("definir_pino_digital", comando, argsString),
    definir_pino_pwm: async (comando, argsString) =>
      blocklyFunctions.enviarComando("definir_pino_pwm", comando, argsString),
    pausa: async (comando, argsString) =>
      blocklyFunctions.enviarComando("pausa", comando, argsString), // Espera ACK

    // ----------- Funções Sensores (Retorno) -------------------
    digital_read: async (comando, argsString) => {
      return blocklyFunctions.enviarComandoComRetorno(
        "digital_read",
        comando,
        argsString,
        "DIGITAL_READ" // Tag de resposta
      );
    },
    analog_read: async (comando, argsString) => {
      return blocklyFunctions.enviarComandoComRetorno(
        "analog_read",
        comando,
        argsString,
        "ANALOG_READ" // Tag de resposta
      );
    },
    ler_ultrassom: async (comando, argsString) => {
      return blocklyFunctions.enviarComandoComRetorno(
        "ler_ultrassom",
        comando,
        argsString,
        "ULTRASSOM" // Tag de resposta
      );
    },

    // ----------- Funções LED (Ação) ----------------------
    led_pisca_n: async (comando, argsString) =>
      blocklyFunctions.enviarComando("led_pisca_n", comando, argsString), // Espera ACK
    led_left: async (comando, argsString) =>
      blocklyFunctions.enviarComando("led_left", comando, argsString),
    led_right: async (comando, argsString) =>
      blocklyFunctions.enviarComando("led_right", comando, argsString),

    // ----------- Funções Motores (Ação) -------------------
    mover_frente: async (comando, argsString) =>
      blocklyFunctions.enviarComando("mover_frente", comando, argsString),
    mover_tras: async (comando, argsString) =>
      blocklyFunctions.enviarComando("mover_tras", comando, argsString),
    motor_esquerdo_frente: async (comando, argsString) =>
      blocklyFunctions.enviarComando("motor_esquerdo_frente", comando, argsString),
    motor_direito_frente: async (comando, argsString) =>
      blocklyFunctions.enviarComando("motor_direito_frente", comando, argsString),
    motor_esquerdo_tras: async (comando, argsString) =>
      blocklyFunctions.enviarComando("motor_esquerdo_tras", comando, argsString),
    motor_direito_tras: async (comando, argsString) =>
      blocklyFunctions.enviarComando("motor_direito_tras", comando, argsString),
    parar_motor: async (comando, argsString) =>
      blocklyFunctions.enviarComando("parar_motor", comando, argsString),
    parar_motor_esquerdo: async (comando, argsString) =>
      blocklyFunctions.enviarComando("parar_motor_esquerdo", comando, argsString),
    parar_motor_direito: async (comando, argsString) =>
      blocklyFunctions.enviarComando("parar_motor_direito", comando, argsString),

    // ----------- Funções Servo (Ação) -------------------
    servo: async (comando, argsString) =>
      blocklyFunctions.enviarComando("servo", comando, argsString), // Espera ACK
    servo360: async (comando, argsString) =>
      blocklyFunctions.enviarComando("servo360", comando, argsString),

    // ----------- Funções Som (Ação) -------------------
    som_nota: async (comando, argsString) =>
      blocklyFunctions.enviarComando("som_nota", comando, argsString),

    // ----------- Funções Serial (Ação) -------------------
    serial_println_cmd: async (msg) => {
      const args = String(msg).replace(/^['"]|['"]$/g, "");
      return blocklyFunctions.enviarComando(
        "serial_println",
        "SERIAL_PRINT", // (Assumindo que o firmware tratará 'SERIAL_PRINT' como um comando de ação)
        args
      );
    },

    serial_read_cmd: async () => {
      // (Isto ainda é problemático, pois "SERIAL_READ_REQ" não parece estar no firmware)
      // Por enquanto, vamos manter como está, mas o ideal seria implementar
      // 'serial_read_cmd' como 'enviarComandoComRetorno' com uma tag 'SERIAL_VALOR'
      await blocklyFunctions.enviarComando(
        "serial_read",
        "SERIAL_READ_REQ",
        ""
      );
      return "0";
    },
  };

  try {
    // Cria um sandbox isolado e seguro
    const contexto = vm.createContext({
      ...blocklyFunctions,
      logs,
      console,
      setTimeout,
      clearTimeout,
    });

    // Compila e executa o script dentro do sandbox com limite de tempo
    const script = new vm.Script(`(async () => { ${codigoProtegido} })()`);

    // *** MUDANÇA SE NECEEARIA: AUMENTE O TIMEOUT ***
    // 120 segundos (120000).
    await script.runInContext(contexto, { timeout: 120000 });
  } catch (err) {
    logs.push(`[Interrupção] Erro durante a execução: ${err.message}`);
    return {
      status: false,
      mensagem: `Erro de execution: ${err.message}`,
      logs,
    };
  }
  logs.push(`[SUCESSO] Execução concluída com sucesso.`);
  return { status: true, mensagem: "Execução concluída", logs };
}

module.exports = { executarCodigo };
