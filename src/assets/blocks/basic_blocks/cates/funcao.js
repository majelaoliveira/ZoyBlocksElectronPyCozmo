(() => {
  // Defini a cor da categoria e texto //caso for mudar a cor padrão
  const COR_BLOCOS = 0;
  
  const funcao = () => {
    // Blockly.defineBlocksWithJsonArray([
    //   {
    //     // Local para criar blocos personalizados
    //     // "type": "blocoPersonalizado",
    //   },
    // ]);
    // Geração de código Python
    //    Blockly.JavaScript.forBlock['blocoPersonalizado'] = (block) =>
    //     'função()\n';
  };

  const categoriaFuncao = {
    kind: "category",
    name: "Funções",
    custom: "PROCEDURE",
    colour: "290",
  };
  // Registra globalmente
  window.basicCategories = window.basicCategories || [];
  window.basicCategories.push(categoriaFuncao);

  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.push(funcao);
})();
