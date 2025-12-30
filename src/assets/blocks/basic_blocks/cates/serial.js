(() => {
  // Cor da categoria
  const COR_SERIAL = "160";

  const serial = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "serial_println",
        message0: "Serial println %1",
        args0: [
          {
            type: "input_value",
            name: "TEXT",
            check: ["String", "Number"],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_SERIAL,
        tooltip: "Imprime uma linha na serial do dispositivo (Arduino)",
        helpUrl: "",
      },
      {
        type: "serial_read",
        message0: "Ler Serial",
        args0: [],
        output: ["String", "Number"],
        colour: COR_SERIAL,
        tooltip: "Lê dados enviados ao dispositivo via serial",
        helpUrl: "",
      },
    ]);

    // ----------  Gerador para JavaScript  ----------
    Blockly.JavaScript.forBlock["serial_println"] = function (block) {
      // Captura o valor de entrada (a mensagem a ser impressa)
      const msg =
        Blockly.JavaScript.valueToCode(
          block,
          "TEXT",
          Blockly.JavaScript.ORDER_NONE
        ) || '""';

      // Gera uma chamada à função JS 'serial_println_cmd'
      const code = `serial_println_cmd(${msg});\n`;
      return code;
    };

    Blockly.JavaScript.forBlock["serial_read"] = function (block) {
      // Gera uma chamada à função JS 'serial_read_cmd'
      // Como é uma operação de I/O, ela é assíncrona e usa 'await'
      const code = `await serial_read_cmd()`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
    };
  };

  // Categoria Serial
  const categoriaSerial = {
    kind: "category",
    name: "Serial",
    colour: COR_SERIAL,
    contents: [
      { kind: "block", type: "serial_println" },
      { kind: "block", type: "serial_read" },
    ],
  };
  // Registra globalmente
  window.basicCategories = window.basicCategories || [];
  window.basicCategories.push(categoriaSerial);

  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.push(serial);
})();
