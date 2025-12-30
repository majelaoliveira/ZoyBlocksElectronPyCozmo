window.unoBlocks = function () {
  // Apenas inicializar uma única vez
  if (window.__unoInitialized) return;
  window.__unoInitialized = true;

  // Garante arrays
  window.unoInitFunctions = window.unoInitFunctions || [];
  window.unoCategories = window.unoCategories || [];

  // Se houver uma registry (arquivo de cates empacotados), consome-a agora
  const registry = window.unoRegistry || [];
  registry.forEach((item) => {
    if (item && typeof item.init === "function") {
      window.unoInitFunctions.push(item.init);
    }
    if (item && item.category) {
      window.unoCategories.push(item.category);
    }
  });

  // Executa as funções (define os blocos no Blockly)
  window.unoInitFunctions.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("Erro init UNO fn:", e);
    }
  });

  // Monta toolboxUno com as categorias do dispositivo
  const toolboxContents = [];
  (window.unoCategories || []).forEach((categoria) =>
    toolboxContents.push(categoria)
  );

  window.toolboxUno = {
    kind: "categoryToolbox",
    contents: toolboxContents,
  };
};
