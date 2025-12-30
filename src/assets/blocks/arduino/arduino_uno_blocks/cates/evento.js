(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = "#A55B80";

  const eventos = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "iniciar_uno",
        message0: "Iniciar Arduino Nano",
        args0: [],
        nextStatement: null,
        tooltip: "Bloco de início do programa Arduino Nano",
        helpUrl: "",
        style: "hat_blocks", // (alternativo, se você usa theme)
        hat: "true", // ESSENCIAL para evento
      },
    ]);

    // Geração de código js
    Blockly.JavaScript.forBlock["iniciar_uno"] = () => `iniciar_zoy("ZOY", "ZOY")\n`;
  };

  const categoriaEventos = {
    kind: "category",
    name: "Iniciar Arduino UNO",
    colour: COR_BLOCOS,
    contents: [{ kind: "block", type: "iniciar_uno" }],
  };

  // Registra blocos
  window.unoRegistry = window.unoRegistry || [];
  window.unoRegistry.push({ init: eventos, category: categoriaEventos });
})();
