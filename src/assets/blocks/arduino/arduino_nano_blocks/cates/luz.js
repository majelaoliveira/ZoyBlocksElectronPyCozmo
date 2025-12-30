(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = "#F79226";

  const luz = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "nano_led_pisca_n",
        message0: "piscar LED %1 vezes",
        args0: [
          {
            type: "field_number",
            name: "VEZES",
            value: 3,
            min: 1,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Pisca o LED D13 da placa N vezes",
        helpUrl: "",
      },

      {
        type: "nano_led_define_pino",
        message0: "Defina o Pino %1 do LED como %2",
        args0: [
          {
            type: "field_dropdown",
            name: "PIN",
            options: [
              ["D13", "D13"],
            ],
          },
          {
            type: "field_dropdown",
            name: "LEVEL",
            options: [
              ["Ligado", "HIGH"],
              ["Desligado", "LOW"],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Pisca o LED da placa",
        helpUrl: "",
      },
    ]);

    // Geração de código js
    Blockly.JavaScript.forBlock["nano_led_pisca_n"] = (block) => {
      const vezes = block.getFieldValue("VEZES");
      return `led_pisca_n("LED_TREZE", "${vezes}")\n`;
    };

    Blockly.JavaScript.forBlock["nano_led_define_pino"] = (block) => {
      const pin = block.getFieldValue("PIN");
      const level = block.getFieldValue("LEVEL");
      return `definir_pino_digital("DIGITAL_WRITE","${pin}, ${level}")\n`;
    };
  };

  const categoriaLuz = {
    kind: "category",
    name: "Luz",
    colour: COR_BLOCOS,
    contents: [
      { kind: "block", type: "nano_led_pisca_n" },
      { kind: "block", type: "nano_led_define_pino" },
    ],
  };

  // Registra blocos
  window.nanoRegistry = window.nanoRegistry || [];
  window.nanoRegistry.push({ init: luz, category: categoriaLuz });
})();
