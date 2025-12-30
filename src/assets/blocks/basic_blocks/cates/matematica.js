(() => {
  // Definição da cor da categoria
  const COR_BLOCOS = 230;

  const matematica = () => {
    // Blockly.defineBlocksWithJsonArray([
    //   {
    //     // Local para criar blocos personalizados
    //     // "type": "blocoPersonalizado",
    //   },
    // ]);

    // --- Geração de Código JavaScript para Blocos Nativos (Revisão) ---
    // A maioria desses blocos já gera JavaScript válido por padrão.
    // As definições a seguir são para garantir o fluxo ou personalizar.

    // math_number (crucial para inputs de repetição)
    Blockly.JavaScript.forBlock["math_number"] = function (block) {
      const code = Number(block.getFieldValue("NUM"));
      // O código é uma string literal, sem aspas.
      const order =
        code >= 0
          ? Blockly.JavaScript.ORDER_ATOMIC
          : Blockly.JavaScript.ORDER_UNARY_NEGATION;
      return [code, order];
    };

    // math_arithmetic (ex: 1 + 2)
    Blockly.JavaScript.forBlock["math_arithmetic"] = function (block) {
      const OPERATORS = {
        ADD: [" + ", Blockly.JavaScript.ORDER_ADDITION],
        MINUS: [" - ", Blockly.JavaScript.ORDER_SUBTRACTION],
        MULTIPLY: [" * ", Blockly.JavaScript.ORDER_MULTIPLICATION],
        DIVIDE: [" / ", Blockly.JavaScript.ORDER_DIVISION],
        // A potência usa uma função Math.pow no JavaScript
        POWER: ["Math.pow(", Blockly.JavaScript.ORDER_FUNCTION_CALL],
      };
      const operator = block.getFieldValue("OP");
      const tuple = OPERATORS[operator];
      let order = tuple[1];
      let code;

      if (operator === "POWER") {
        const argument0 = Blockly.JavaScript.valueToCode(
          block,
          "A",
          Blockly.JavaScript.ORDER_COMMA
        );
        const argument1 = Blockly.JavaScript.valueToCode(
          block,
          "B",
          Blockly.JavaScript.ORDER_COMMA
        );
        code = `Math.pow(${argument0}, ${argument1})`;
        order = Blockly.JavaScript.ORDER_FUNCTION_CALL;
      } else {
        const argument0 =
          Blockly.JavaScript.valueToCode(block, "A", order) || "0";
        const argument1 =
          Blockly.JavaScript.valueToCode(block, "B", order) || "0";
        code = argument0 + tuple[0] + argument1;
      }
      return [code, order];
    };

    // ... Você pode adicionar outros blocos complexos aqui (math_random_int, math_single, etc.)
    // se houver necessidade de garantir que gerem JavaScript específico (ex: Math.floor, Math.random).
  };

  const categoriaMatematica = {
    kind: "category",
    name: "Matemática",
    colour: COR_BLOCOS,
    contents: [
      { kind: "block", type: "math_number" },
      { kind: "block", type: "math_arithmetic" },
      { kind: "block", type: "math_single" },
      { kind: "block", type: "math_constant" },
      { kind: "block", type: "math_number_property" },
      { kind: "block", type: "math_modulo" },
      { kind: "block", type: "math_round" },
      {
        kind: "block",
        type: "math_constrain",
        inputs: {
          LOW: {
            shadow: {
              type: "math_number",
              fields: { NUM: 1 },
            },
          },
          HIGH: {
            shadow: {
              type: "math_number",
              fields: { NUM: 100 },
            },
          },
        },
      },
      {
        kind: "block",
        type: "math_random_int",
        inputs: {
          FROM: {
            shadow: {
              type: "math_number",
              fields: { NUM: 1 },
            },
          },
          TO: {
            shadow: {
              type: "math_number",
              fields: { NUM: 10 },
            },
          },
        },
      },
      { kind: "block", type: "math_random_float" },
    ],
  };

  // Registra globalmente
  window.basicCategories = window.basicCategories || [];
  window.basicCategories.push(categoriaMatematica);

  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.push(matematica);
})();
