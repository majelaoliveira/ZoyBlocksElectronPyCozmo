(() => {
  // Defini a cor da categoria e texto
  const COR_BLOCOS = 330;
  
  const variaveis = () => {
    // Blockly.defineBlocksWithJsonArray([
    //   {
    //     // Local para criar blocos personalizados
    //     // "type": "blocoPersonalizado",
    //   },
    // ]);
    // Geração de código Python
    //    Blockly.JavaScript.forBlock['blocoPersonalizado'] = (block) =>
    //     'função()\n';

    /** 
     * Para esse bloco funcionar com o electron, é necessario 
     * aplicar o override de Blockly.dialog.prompt() mas isso não está ocorrendo
     * essa função precisa ter um tratamento especial no index.js onde o Blockly é inicializado.
    */
  };

  const categoriaVariaveis = {
    kind: "category",
    name: "Variáveis",
    custom: "VARIABLE",
    colour: COR_BLOCOS,
  };
  // Registra globalmente
  window.basicCategories = window.basicCategories || [];
  window.basicCategories.push(categoriaVariaveis);

  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.push(variaveis);
})();
