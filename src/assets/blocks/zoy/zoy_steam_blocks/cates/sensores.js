(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = "#A7072D";

  const sensores = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "steam_ultrassom_distancia",
        message0: "Ler distância do sensor trig %1 echo %2",
        args0: [
          {
            type: "field_dropdown",
            name: "TRIG",
            options: [["Pino D7", "7"]],
          },
          {
            type: "field_dropdown",
            name: "ECHO",
            options: [["Pino D8", "8"]],
          },
        ],
        output: "Number",
        colour: COR_BLOCOS,
        tooltip: "Retorna a distância lida pelo sensor ultrassônico em cm",
        helpUrl: "",
      },

      {
        type: "steam_sensor_ir",
        message0: "Leitura sensor de linha %1",
        args0: [
          {
            type: "field_dropdown",
            name: "PINO",
            options: [
              ["Direito (A3)", "A3"],
              ["Central (A6)", "A6"],
              ["Esquerdo (A7)", "A7"],
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
    Blockly.JavaScript.forBlock["steam_ultrassom_distancia"] = function (block) {
      const trig = block.getFieldValue("TRIG");
      const echo = block.getFieldValue("ECHO");
      // Adiciona "await" pois ler_ultrassom é uma função assíncrona
      const code = `await ler_ultrassom("ULTRASSOM", "${trig},${echo}")`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
    };

    Blockly.JavaScript.forBlock["steam_sensor_ir"] = function (block) {
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
      { kind: "block", type: "steam_ultrassom_distancia" },
      { kind: "block", type: "steam_sensor_ir" },
    ],
  };

  // Registra blocos
  window.zoySteamRegistry = window.zoySteamRegistry || [];
  window.zoySteamRegistry.push({ init: sensores, category: categoriaSensores });
})();
