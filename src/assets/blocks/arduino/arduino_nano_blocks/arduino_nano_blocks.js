window.nanoBlocks = function () {
  // Apenas inicializar uma única vez
  if (window.__nanoInitialized) return;
  window.__nanoInitialized = true;

  // Garante arrays
  window.nanoInitFunctions = window.nanoInitFunctions || [];
  window.nanoCategories = window.nanoCategories || [];

  // Se houver uma registry (arquivo de cates empacotados), consome-a agora
  const registry = window.nanoRegistry || [];
  registry.forEach((item) => {
    if (item && typeof item.init === "function") {
      window.nanoInitFunctions.push(item.init);
    }
    if (item && item.category) {
      window.nanoCategories.push(item.category);
    }
  });

  // Executa as funções (define os blocos no Blockly)
  window.nanoInitFunctions.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("Erro init nano fn:", e);
    }
  });

  // Monta toolboxNano com as categorias do dispositivo
  const toolboxContents = [];
  (window.nanoCategories || []).forEach((categoria) =>
    toolboxContents.push(categoria)
  );

  window.toolboxNano = {
    kind: "categoryToolbox",
    contents: toolboxContents,
  };
};
