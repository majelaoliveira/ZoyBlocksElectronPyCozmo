(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = "#C95555";

  const pinos = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "nano_ler_pino_digital",
        message0: "Ler pino digital %1  entrada: %2",
        args0: [
          {
            type: "field_dropdown",
            name: "PIN",
            options: [
              ["D0", "0"],
              ["D1", "1"],
              ["D2", "2"],
              ["D3", "3"],
              ["D4", "4"],
              ["D5", "5"],
              ["D6", "6"],
              ["D7", "7"],
              ["D8", "8"],
              ["D9", "9"],
              ["D10", "10"],
              ["D11", "11"],
              ["D12", "12"],
              ["D13", "13"],
              ["A0/D14", "14"],
              ["A1/D15", "15"],
              ["A2/D16", "16"],
              ["A3/D17", "17"],
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
        type: "nano_definir_pino_digital",
        message0: "Definir pino digital %1 como %2",
        args0: [
          {
            type: "field_dropdown",
            name: "PIN",
            options: [
              ["D0", "0"],
              ["D1", "1"],
              ["D2", "2"],
              ["D3", "3"],
              ["D4", "4"],
              ["D5", "5"],
              ["D6", "6"],
              ["D7", "7"],
              ["D8", "8"],
              ["D9", "9"],
              ["D10", "10"],
              ["D11", "11"],
              ["D12", "12"],
              ["D13", "13"],
              ["A0/D14", "14"],
              ["A1/D15", "15"],
              ["A2/D16", "16"],
              ["A3/D17", "17"],
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
        type: "nano_ler_pino_analogico",
        message0: "Ler pino analógico %1",
        args0: [
          {
            type: "field_dropdown",
            name: "PIN",
            options: [
              ["A0", "A0"],
              ["A1", "A1"],
              ["A2", "A2"],
              ["A3", "A3"],
              ["A4", "A4"],
              ["A5", "A5"],
              ["A6", "A6"],
              ["A7", "A7"],
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
    Blockly.JavaScript.forBlock["nano_ler_pino_digital"] = function (block) {
      const pin = block.getFieldValue("PIN");
      const modo = block.getFieldValue("MODO");
      const code = `await digital_read("DIGITAL_READ","${pin},${modo}")`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
    };

    Blockly.JavaScript.forBlock["nano_definir_pino_digital"] = function (block) {
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

    Blockly.JavaScript.forBlock["nano_ler_pino_analogico"] = function (block) {
      const pin = block.getFieldValue("PIN");
      const code = `await analog_read("ANALOG_READ", "${pin}")`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
    };
  };

  const categoriapinos = {
    kind: "category",
    name: "Pinos Livres",
    colour: COR_BLOCOS,
    contents: [
      { kind: "block", type: "nano_ler_pino_digital" },
      { kind: "block", type: "nano_definir_pino_digital" },
      { kind: "block", type: "nano_ler_pino_analogico" },
    ],
  };

  // Registra blocos
  window.nanoRegistry = window.nanoRegistry || [];
  window.nanoRegistry.push({ init: pinos, category: categoriapinos });
})();
