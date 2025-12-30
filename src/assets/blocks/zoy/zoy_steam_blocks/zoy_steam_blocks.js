window.zoySteamBlocks = function () {
  // Apenas inicializar uma única vez
  if (window.__zoySteamInitialized) return;
  window.__zoySteamInitialized = true;

  // Garante arrays
  window.zoySteamInitFunctions = window.zoySteamInitFunctions || [];
  window.zoySteamCategories = window.zoySteamCategories || [];

  // Se houver uma registry (arquivo de cates empacotados), consome-a agora
  const registry = window.zoySteamRegistry || [];
  registry.forEach((item) => {
    if (item && typeof item.init === "function") {
      window.zoySteamInitFunctions.push(item.init);
    }
    if (item && item.category) {
      window.zoySteamCategories.push(item.category);
    }
  });

  // Executa as funções (define os blocos no Blockly)
  window.zoySteamInitFunctions.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("Erro init zoySteam fn:", e);
    }
  });

  // Monta toolboxZoySteam com as categorias do dispositivo
  const toolboxContents = [];
  (window.zoySteamCategories || []).forEach((categoria) =>
    toolboxContents.push(categoria)
  );

  window.toolboxZoySteam = {
    kind: "categoryToolbox",
    contents: toolboxContents,
  };
};
