(() => {
  // Defini a cor da categoria e texto //caso for mudar a cor padrão
  const COR_BLOCOS = 160;

  const texto = () => {
    // Blockly.defineBlocksWithJsonArray([
    //   {s
    //     // Local para criar blocos personalizados
    //     // "type": "blocoPersonalizado",
    //   },
    // ]);
    // Geração de código Python
    //    Blockly.JavaScript.forBlock['blocoPersonalizado'] = (block) =>
    //     'função()\n';
  };

  const categoriaTexto = {
    kind: "category",
    name: "Texto",
    colour: COR_BLOCOS,
    contents: [
      { kind: "block", type: "text" },
      { kind: "block", type: "text_join" },
    ],
  };

  // Registra globalmente
  window.basicCategories = window.basicCategories || [];
  window.basicCategories.push(categoriaTexto);

  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.push(texto);
})();
