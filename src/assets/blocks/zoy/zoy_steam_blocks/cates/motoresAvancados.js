(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = "#3869F8";

  const motoresAvancados = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "steam_pwm_motor_esquerdo_frente",
        message0: "Motor Esquerdo (Frente): Potência %1 (PWM)",
        args0: [
          {
            type: "field_number",
            name: "PWM",
            value: 100,
            min: 0,
            max: 255,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Ligar Motor Esquerdo para Frente",
        helpUrl: "",
      },

      {
        type: "steam_pwm_motor_esquerdo_tras",
        message0: "Motor Esquerdo (Trás): Potência %1 (PWM)",
        args0: [
          {
            type: "field_number",
            name: "PWM",
            value: 100,
            min: 0,
            max: 255,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Ligar Motor Esquerdo para Trás",
        helpUrl: "",
      },

      {
        type: "steam_pwm_motor_direito_frente",
        message0: "Motor Direito (Frente): Potência %1 (PWM)",
        args0: [
          {
            type: "field_number",
            name: "PWM",
            value: 100,
            min: 0,
            max: 255,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Ligar Motor Direito para Frente",
        helpUrl: "",
      },

      {
        type: "steam_pwm_motor_direito_tras",
        message0: "Motor Direito (Trás): Potência %1 (PWM)",
        args0: [
          {
            type: "field_number",
            name: "PWM",
            value: 100,
            min: 0,
            max: 255,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Ligar Motor Direito para Trás",
        helpUrl: "",
      },

      {
        type: "steam_percent_motor_esquerdo_frente",
        message0: "Motor Esquerdo (Frente): Potência %1 (%)",
        args0: [
          {
            type: "field_number",
            name: "VALUE",
            value: 100,
            min: 0,
            max: 100,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Ligar Motor Esquerdo para Frente com porcentagem",
        helpUrl: "",
      },

      {
        type: "steam_percent_motor_esquerdo_tras",
        message0: "Motor Esquerdo (Trás): Potência %1 (%)",
        args0: [
          {
            type: "field_number",
            name: "VALUE",
            value: 100,
            min: 0,
            max: 100,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Ligar Motor Esquerdo para Trás com porcentagem",
        helpUrl: "",
      },

      {
        type: "steam_percent_motor_direito_frente",
        message0: "Motor Direito (Frente): Potência %1 (%)",
        args0: [
          {
            type: "field_number",
            name: "VALUE",
            value: 100,
            min: 0,
            max: 100,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Ligar Motor Direito para Frente com porcentagem",
        helpUrl: "",
      },

      {
        type: "steam_percent_motor_direito_tras",
        message0: "Motor Direito (Trás): Potência %1 (%)",
        args0: [
          {
            type: "field_number",
            name: "VALUE",
            value: 100,
            min: 0,
            max: 100,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Ligar Motor Direito para Trás com porcentagem",
        helpUrl: "",
      },

      {
        type: "steam_motores_pinos_digital",
        message0: "Defina o Pino %1 do Motor como %2",
        args0: [
          {
            type: "field_dropdown",
            name: "PIN",
            options: [
              ["D3", "D3"],
              ["D5", "D5"],
              ["D6", "D6"],
              ["D11", "D11"],
            ],
          },
          {
            type: "field_dropdown",
            name: "LEVEL",
            options: [
              ["HIGH", "HIGH"],
              ["LOW", "LOW"],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Escolha seu pino dos motores",
        helpUrl: "",
      },

      {
        type: "steam_motores_pinos_pwm",
        message0: "Definir pino %1 com saída: %2 PWM (0-255)",
        args0: [
          {
            type: "field_dropdown",
            name: "PIN",
            options: [
              ["D3", "3"],
              ["D5", "5"],
              ["D6", "6"],
              ["D11", "11"],
            ],
          },
          {
            type: "field_number",
            name: "VALUE",
            value: 0,
            min: 0,
            max: 255,
            precision: 1,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Define o valor PWM (0-255) de um pino.",
        helpUrl: "",
      },

      {
        type: "steam_motores_pinos_porcentagem",
        message0: "Definir pino %1 com saída: %2 %% (0-100%%)",
        args0: [
          {
            type: "field_dropdown",
            name: "PIN",
            options: [
              ["D3", "3"],
              ["D5", "5"],
              ["D6", "6"],
              ["D11", "11"],
            ],
          },
          {
            type: "field_number",
            name: "VALUE",
            value: 0,
            min: 0,
            max: 100,
            precision: 1,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip:
          "Define o valor de potencia (0-100%) de um pino, convertendo para 0-255.",
        helpUrl: "",
      },
    ]);

    // Geração de código JS
    Blockly.JavaScript.forBlock["steam_pwm_motor_esquerdo_frente"] = (block) =>
      `motor_esquerdo_frente("MOTOR_ESQUERDO_FRENTE",${block.getFieldValue(
        "PWM"
      )})\n`;

    Blockly.JavaScript.forBlock["steam_pwm_motor_esquerdo_tras"] = (block) =>
      `motor_esquerdo_tras("MOTOR_ESQUERDO_TRAS",${block.getFieldValue(
        "PWM"
      )})\n`;

    Blockly.JavaScript.forBlock["steam_pwm_motor_direito_frente"] = (block) =>
      `motor_direito_frente("MOTOR_DIREITO_FRENTE",${block.getFieldValue(
        "PWM"
      )})\n`;

    Blockly.JavaScript.forBlock["steam_pwm_motor_direito_tras"] = (block) =>
      `motor_direito_tras("MOTOR_DIREITO_TRAS",${block.getFieldValue(
        "PWM"
      )})\n`;

    // Funções com porcentagem
    Blockly.JavaScript.forBlock["steam_percent_motor_esquerdo_frente"] = function (block) {
      // Converte porcentagem (0-100) para valor PWM (0-255)
      const pwmConvert = Math.round((block.getFieldValue("VALUE") / 100) * 255);
      return `motor_esquerdo_frente("MOTOR_ESQUERDO_FRENTE","${pwmConvert}")\n`;
    };
    Blockly.JavaScript.forBlock["steam_percent_motor_esquerdo_tras"] = function (block) {
      // Converte porcentagem (0-100) para valor PWM (0-255)
      const pwmConvert = Math.round((block.getFieldValue("VALUE") / 100) * 255);
      return `motor_esquerdo_tras("MOTOR_ESQUERDO_TRAS","${pwmConvert}")\n`;
    };
    Blockly.JavaScript.forBlock["steam_percent_motor_direito_frente"] = function (block) {
      // Converte porcentagem (0-100) para valor PWM (0-255)
      const pwmConvert = Math.round((block.getFieldValue("VALUE") / 100) * 255);
      return `motor_direito_frente("MOTOR_DIREITO_FRENTE","${pwmConvert}")\n`;
    };
    Blockly.JavaScript.forBlock["steam_percent_motor_direito_tras"] = function (block) {
      // Converte porcentagem (0-100) para valor PWM (0-255)
      const pwmConvert = Math.round((block.getFieldValue("VALUE") / 100) * 255);
      return `motor_direito_tras("MOTOR_DIREITO_TRAS","${pwmConvert}")\n`;
    };

    Blockly.JavaScript.forBlock["steam_motores_pinos_digital"] = function (block) {
      const pin = block.getFieldValue("PIN");
      const level = block.getFieldValue("LEVEL");
      return `definir_pino_digital("DIGITAL_WRITE","${pin}, ${level}")\n`;
    };

    // Escolha com pinos dos motores
    Blockly.JavaScript.forBlock["steam_motores_pinos_pwm"] = function (block) {
      const pin = block.getFieldValue("PIN");
      const value = block.getFieldValue("VALUE"); // Valor de 0 a 255
      // Assume que você terá uma função `definir_pino_pwm` no app.py
      return `definir_pino_pwm("PWM_WRITE","${pin}, ${value}")\n`;
    };

    Blockly.JavaScript.forBlock["steam_motores_pinos_porcentagem"] = function (block) {
      const pin = block.getFieldValue("PIN");
      const percentage = block.getFieldValue("VALUE");
      // Converte porcentagem (0-100) para valor PWM (0-255)
      const pwm_value = Math.round((percentage / 100) * 255);
      return `definir_pino_pwm("PWM_WRITE","${pin}, ${pwm_value}")\n`;
    };
  };

  const categoriaMotoresAvancados = {
    kind: "category",
    name: "Motores (Avançados)",
    colour: COR_BLOCOS,
    contents: [
      { kind: "block", type: "steam_pwm_motor_esquerdo_frente" },
      { kind: "block", type: "steam_pwm_motor_esquerdo_tras" },
      { kind: "block", type: "steam_pwm_motor_direito_frente" },
      { kind: "block", type: "steam_pwm_motor_direito_tras" },

      // Adicionando um separador visual
      { kind: "sep", gap: "50" },

      { kind: "block", type: "steam_percent_motor_esquerdo_frente" },
      { kind: "block", type: "steam_percent_motor_esquerdo_tras" },
      { kind: "block", type: "steam_percent_motor_direito_frente" },
      { kind: "block", type: "steam_percent_motor_direito_tras" },

      // Adicionando um separador visual
      { kind: "sep", gap: "50" },

      { kind: "block", type: "steam_motores_pinos_digital" },
      { kind: "block", type: "steam_motores_pinos_pwm" },
      { kind: "block", type: "steam_motores_pinos_porcentagem" },
    ],
  };

  // Registra blocos
  window.zoySteamRegistry = window.zoySteamRegistry || [];
  window.zoySteamRegistry.push({ init: motoresAvancados, category: categoriaMotoresAvancados });
})();
