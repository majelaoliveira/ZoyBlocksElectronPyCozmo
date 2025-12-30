(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = "#A7072D";

  const sensores = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "uno_ultrassom_distancia",
        message0: "Ler distância do sensor trig %1 echo %2",
        args0: [
          {
            type: "field_dropdown",
            name: "TRIG",
            options: [
              ["Pino D0", "0"],
              ["Pino D1", "1"],
              ["Pino D2", "2"],
              ["Pino D3", "3"],
              ["Pino D4", "4"],
              ["Pino D5", "5"],
              ["Pino D6", "6"],
              ["Pino D7", "7"],
              ["Pino D8", "8"],
              ["Pino D9", "9"],
              ["Pino D10", "10"],
              ["Pino D11", "11"],
              ["Pino D12", "12"],
              ["Pino D13", "13"],
              ["Pino A0/D14", "14"],
              ["Pino A1/D15", "15"],
              ["Pino A2/D16", "16"],
              ["Pino A3/D17", "17"],
              ["Pino A4/D18", "18"],
              ["Pino A5/D19", "19"],
            ],
          },
          {
            type: "field_dropdown",
            name: "ECHO",
            options: [
              ["Pino D0", "0"],
              ["Pino D1", "1"],
              ["Pino D2", "2"],
              ["Pino D3", "3"],
              ["Pino D4", "4"],
              ["Pino D5", "5"],
              ["Pino D6", "6"],
              ["Pino D7", "7"],
              ["Pino D8", "8"],
              ["Pino D9", "9"],
              ["Pino D10", "10"],
              ["Pino D11", "11"],
              ["Pino D12", "12"],
              ["Pino D13", "13"],
              ["Pino A0/D14", "14"],
              ["Pino A1/D15", "15"],
              ["Pino A2/D16", "16"],
              ["Pino A3/D17", "17"],
              ["Pino A4/D18", "18"],
              ["Pino A5/D19", "19"],
            ],
          },
        ],
        output: "Number",
        colour: COR_BLOCOS,
        tooltip: "Retorna a distância lida pelo sensor ultrassônico em cm",
        helpUrl: "",
      },

      {
        type: "uno_sensorIR",
        message0: "Leitura sensor infravermelho no pino: %1",
        args0: [
          {
            type: "field_dropdown",
            name: "PINO",
            options: [
              ["A0", "A0"],
              ["A1", "A1"],
              ["A2", "A2"],
              ["A3", "A3"],
              ["A4", "A4"],
              ["A5", "A5"],
            ],
          },
        ],
        output: "Number",
        colour: COR_BLOCOS,
        tooltip: "Lê o valor do sensor seguidor de linha",
        helpUrl: "",
      },
    ]);

    // === Geração de código JavaScript ===
    Blockly.JavaScript.forBlock["uno_ultrassom_distancia"] = function (block) {
      const trig = block.getFieldValue("TRIG");
      const echo = block.getFieldValue("ECHO");
      // Adiciona "await" pois ler_ultrassom é uma função assíncrona
      const code = `await ler_ultrassom("ULTRASSOM", "${trig},${echo}")`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
    };

    Blockly.JavaScript.forBlock["uno_sensorIR"] = function (block) {
      const pino = block.getFieldValue("PINO");
      // Adiciona "await" pois é uma função assíncrona
      const code = `await analog_read("ANALOG_READ", "${pino}")`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
    };
  };

  const categoriaSensores = {
    kind: "category",
    name: "Sensores",
    colour: COR_BLOCOS,
    contents: [
      { kind: "block", type: "uno_ultrassom_distancia" },
      { kind: "block", type: "uno_sensorIR" },
    ],
  };

  // Registra blocos
  window.unoRegistry = window.unoRegistry || [];
  window.unoRegistry.push({ init: sensores, category: categoriaSensores });
})();
