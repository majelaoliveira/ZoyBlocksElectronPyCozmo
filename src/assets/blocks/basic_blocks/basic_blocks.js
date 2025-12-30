window.basicBlocks = function () {
  // Executa todas as funções de inicialização de blocos
  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.forEach((fn) => fn());

  // Monta o toolbox categoria a categoria
  const toolboxContents = [];

  // Separador inicial
  toolboxContents.push({
    kind: "category",
    name: "_______________",
    colour: "#dddddd",
    contents: [],
  });

  // Adiciona cada categoria registrada em basicCategories
  (window.basicCategories || []).forEach((categoria) => {
    toolboxContents.push(categoria);
  });

  // Atualiza o toolbox global
  window.toolboxbasicBlocks = {
    kind: "categoryToolbox",
    contents: toolboxContents
  };
};
