(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = "#C95555";

  const pinosLivres = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "steam_ler_pino_digital",
        message0: "Ler pino digital %1  entrada: %2",
        args0: [
          {
            type: "field_dropdown",
            name: "PIN",
            options: [
              ["D2", "2"],
              ["D9", "9"],
              ["D10", "10"],
              ["D12", "12"],
              ["D13", "13"],
              ["A0/D14", "14"],
              ["A4/D18", "18"],
              ["A5/D19", "19"],
            ],
          },
          {
            type: "field_dropdown",
            name: "MODO",
            options: [
              ["INPUT", "INPUT"],
              ["INPUT_PULLUP", "INPUT_PULLUP"],
            ],
          },
        ],
        colour: COR_BLOCOS,
        output: "Boolean",
        tooltip:
          "Realiza a leitura de um pino digital e configura o modo de entrada (INPUT ou INPUT_PULLUP).",
        helpUrl: "",
      },

      {
        type: "steam_definir_pino_digital",
        message0: "Definir pino digital %1 como %2",
        args0: [
          {
            type: "field_dropdown",
            name: "PIN",
            options: [
              ["D2", "2"],
              ["D9", "9"],
              ["D10", "10"],
              ["D12", "12"],
              ["D13", "13"],
              ["A0/D14", "14"],
              ["A4/D18", "18"],
              ["A5/D19", "19"],
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
        tooltip:
          "Define o estado ALTO (HIGH) ou BAIXO (LOW) de um pino digital.",
        helpUrl: "",
      },

      {
        type: "steam_ler_pino_analogico",
        message0: "Ler pino analógico %1",
        args0: [
          {
            type: "field_dropdown",
            name: "PIN",
            options: [
              ["A0", "A0"],
              ["A4", "A4"],
              ["A5", "A5"],
            ],
          },
        ],
        output: "Number",
        colour: COR_BLOCOS,
        tooltip: "Lê o valor de um pino analógico",
        helpUrl: "",
      },
    ]);

    // Geração de código Javascript
    Blockly.JavaScript.forBlock["steam_ler_pino_digital"] = function (block) {
      const pin = block.getFieldValue("PIN");
      const modo = block.getFieldValue("MODO");
      const code = `await digital_read("DIGITAL_READ","${pin},${modo}")`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
    };

    Blockly.JavaScript.forBlock["steam_definir_pino_digital"] = function (block) {
      const pin = block.getFieldValue("PIN");
      const level = block.getFieldValue("LEVEL");
      return `definir_pino_digital("DIGITAL_WRITE","${pin}, ${level}")\n`;
    };


        Blockly.JavaScript.forBlock["sensor_seguidor_linha"] = function (block) {
      const pino = block.getFieldValue("PINO");
      // Adiciona "await" pois é uma função assíncrona
      const code = `await analog_read("ANALOG_READ", "${pino}")`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
    };

    Blockly.JavaScript.forBlock["steam_ler_pino_analogico"] = function (block) {
      const pin = block.getFieldValue("PIN");
      const code = `await analog_read("ANALOG_READ", "${pin}")`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
    };
  };

  const categoriaPinosLivres = {
    kind: "category",
    name: "Pinos Livres",
    colour: COR_BLOCOS,
    contents: [
      { kind: "block", type: "steam_ler_pino_digital" },
      { kind: "block", type: "steam_definir_pino_digital" },
      { kind: "block", type: "steam_ler_pino_analogico" },
    ],
  };

  // Registra blocos
  window.zoySteamRegistry = window.zoySteamRegistry || [];
  window.zoySteamRegistry.push({ init: pinosLivres, category: categoriaPinosLivres });
})();
