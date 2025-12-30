(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = 120;

  const logica = () => {
    // Blockly.defineBlocksWithJsonArray([
    //   {
    //     // Local para criar blocos personalizados
    //     // "type": "blocoPersonalizado",
    //   },
    // ]);

    // ... Personalização dos blocos nativos
    // Personalização do bloco de comparação
    const original_logic_compare = Blockly.Blocks["logic_compare"].init;
    Blockly.Blocks["logic_compare"].init = function () {
      original_logic_compare.call(this);
      this.setColour(COR_BLOCOS);
    };

    // Personalização do bloco de operação lógica
    const original_logic_operation = Blockly.Blocks["logic_operation"].init;
    Blockly.Blocks["logic_operation"].init = function () {
      original_logic_operation.call(this);
      this.setColour(COR_BLOCOS);
    };

    // Personalização do bloco de negação lógica
    const original_logic_negate = Blockly.Blocks["logic_negate"].init;
    Blockly.Blocks["logic_negate"].init = function () {
      original_logic_negate.call(this);
      this.setColour(COR_BLOCOS);
    };

    // Personalização do bloco de valor booleano
    const original_logic_boolean = Blockly.Blocks["logic_boolean"].init;
    Blockly.Blocks["logic_boolean"].init = function () {
      original_logic_boolean.call(this);
      this.setColour(COR_BLOCOS);
    };
  };

  const categoriaLogica = {
    kind: "category",
    name: "Lógica",
    colour: COR_BLOCOS,
    contents: [
      { kind: "block", type: "logic_compare" },
      { kind: "block", type: "logic_operation" },
      { kind: "block", type: "logic_negate" },
      { kind: "block", type: "logic_boolean" },
    ],
  };

  // Registra globalmente
  window.basicCategories = window.basicCategories || [];
  window.basicCategories.push(categoriaLogica);

  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.push(logica);
})();
