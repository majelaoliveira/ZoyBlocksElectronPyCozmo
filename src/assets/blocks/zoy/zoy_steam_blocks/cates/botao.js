(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = "#9300DB";

  const botao = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "steam_botao",
        message0: "Ler botão ZOY ",
        args0: [],
        colour: COR_BLOCOS,
        output: "Boolean",
        tooltip: "Botão Zoy sem debounce",
        helpUrl: "",
      },
      // {
      //   type: "steam_botao_debounce",
      //   message0: "Ler botão ZOY (debounce) ",
      //   args0: [],
      //   colour: COR_BLOCOS,
      //   output: "Boolean",
      //   tooltip: "Botão Zoy com debounce",
      //   helpUrl: "",
      // },
    ]);

    // Geração de código Javascript
    Blockly.JavaScript.forBlock["steam_botao"] = function (block) {
      const code = `await digital_read("DIGITAL_READ", "4,INPUT_PULLUP")`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
    };


    // Blockly.JavaScript.forBlock["steam_botao_debounce"] = function (block) {
    //   return [
    //     `ler_botao_debounce("4", "INPUT_PULLUP")`,
    //     Blockly.JavaScript.forBlock.ORDER_FUNCTION_CALL,
    //   ];
    // };
  };
  const categoriaBotao = {
    kind: "category",
    name: "Botão",
    colour: COR_BLOCOS,
    contents: [
      { kind: "block", type: "steam_botao" },
      // Removido temporariamente para evitar erro do debounce
      // { kind: "block", type: "steam_botao_debounce" },
    ],
  };

  // Registra blocos
  window.zoySteamRegistry = window.zoySteamRegistry || [];
  window.zoySteamRegistry.push({ init: botao, category: categoriaBotao });
})();
