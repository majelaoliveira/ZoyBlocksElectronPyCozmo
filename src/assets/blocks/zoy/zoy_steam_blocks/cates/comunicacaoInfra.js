(() => {
  const COR_IR = "#8E44AD";

  const comunicacaoInfra = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "steam_ir_send",
        message0: "Enviar IR %1",
        args0: [
          {
            type: "input_value",
            name: "MSG",
            check: ["String", "Number"],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_IR,
        tooltip: "Envia mensagem pelo transmissor infravermelho",
        helpUrl: "",
      },

      {
        type: "steam_ir_receive",
        message0: "Receber mensagem IR",
        output: "String",
        colour: COR_IR,
        tooltip: "Retorna a última mensagem recebida via infravermelho",
        helpUrl: "",
      },

      {
        type: "steam_ir_if_message",
        message0: "Se mensagem IR recebida for %1",
        args0: [
          {
            type: "input_value",
            name: "MSG",
            check: ["String", "Number"],
          },
        ],
        message1: "faça %1",
        args1: [
          {
            type: "input_statement",
            name: "DO",
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_IR,
        tooltip: "Executa ações quando mensagem recebida via IR for igual",
        helpUrl: "",
      },
      {
        type: "steam_ir_print",
        message0: "Mostrar mensagem IR recebida",
        previousStatement: null,
        nextStatement: null,
        colour: COR_IR,
        tooltip: "Mostra no console a mensagem recebida via IR",
        helpUrl: "",
      },
    ]);

    // ---------- Geradores Python ----------
    Blockly.JavaScript.forBlock["steam_ir_send"] = (block) => {
      const msg =
        Blockly.JavaScript.forBlock.valueToCode(block, "MSG", Blockly.JavaScript.forBlock.ORDER_ATOMIC) ||
        '""';
      return `ir_send(${msg})\n`;
    };

    Blockly.JavaScript.forBlock["steam_ir_receive"] = (block) => {
      const code = "ir_receive()";
      return [code, Blockly.JavaScript.forBlock.ORDER_FUNCTION_CALL];
    };

    Blockly.JavaScript.forBlock["steam_ir_if_message"] = (block) => {
      const msg =
        Blockly.JavaScript.forBlock.valueToCode(block, "MSG", Blockly.JavaScript.forBlock.ORDER_ATOMIC) ||
        '""';
      const statements = Blockly.JavaScript.forBlock.statementToCode(block, "DO");
      return `if ir_receive() == ${msg}:\n${statements}`;
    };
    Blockly.JavaScript.forBlock["steam_ir_print"] = function (block) {
      return "print(ir_receive())\n";
    };
  };

  // Categoria na toolbox
  const categoriaComunicacaoInfra = {
    kind: "category",
    name: "ComunicacaoInfra",
    colour: COR_IR,
    contents: [
      { kind: "block", type: "steam_ir_send" },
      { kind: "block", type: "steam_ir_receive" },
      { kind: "block", type: "steam_ir_if_message" },
      { kind: "block", type: "steam_ir_print" },
    ],
  };

  // Registra blocos
  window.zoySteamRegistry = window.zoySteamRegistry || [];
  window.zoySteamRegistry.push({ init: comunicacaoInfra, category: categoriaComunicacaoInfra });
})();
