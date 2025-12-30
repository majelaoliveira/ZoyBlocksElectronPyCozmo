(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = "#cf63cf";

  const som = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "steam_som_nota",
        message0: "som da nota %1 duração %2 no pino %3" ,
        args0: [
          {
            type: "field_dropdown",
            name: "NOTA",
            options: [
              ["C4", "262"],
              ["D4", "294"],
              ["E4", "330"],
              ["F4", "349"],
              ["G4", "392"],
              ["A4", "440"],
              ["B4", "494"],
              ["C5", "523"],
            ],
          },
          {
            type: "field_dropdown",
            name: "TEMPO",
            options: [
              ["Semibreve (2000ms)", "2000"],
              ["Mínima (1000ms)", "1000"],
              ["Semínima (500ms)", "500"],
              ["Colcheia (250ms)", "250"],
              ["Semicolcheia (125ms)", "125"],
            ],
          },
           {
            type: "field_dropdown",
            name: "PINO",
            options: [
              ["A0/D14", "14"],
              ["A4/D18", "18"],
              ["A5/D19", "19"],
              ["D2", "2"],
              ["D9", "9"],
              ["D10", "10"],
              ["D12", "12"],
              ["D13", "13"],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip:
          "Toca uma nota musical usando a função tone() via comando serial",
        helpUrl: "",
      },
      {
        type: "steam_som_pausa",
        message0: "Pausa com duaração %1 no pino %2",
        args0: [
          {
            type: "field_dropdown",
            name: "TEMPO",
            options: [
              ["Semibreve (2000ms)", "2000"],
              ["Mínima (1000ms)", "1000"],
              ["Semínima (500ms)", "500"],
              ["Colcheia (250ms)", "250"],
              ["Semicolcheia (125ms)", "125"],
            ],
          },
           {
            type: "field_dropdown",
            name: "PINO",
            options: [
              ["A0/D14", "14"],
              ["A4/D18", "18"],
              ["A5/D19", "19"],
              ["D2", "2"],
              ["D9", "9"],
              ["D10", "10"],
              ["D12", "12"],
              ["D13", "13"],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Pausa o som pelo tempo escolhido",
        helpUrl: "",
      },
    ]);

    // Geração de código Python para o bloco
    Blockly.JavaScript.forBlock["steam_som_nota"] = function (block) {
      const pino = block.getFieldValue("PINO");
      const nota = block.getFieldValue("NOTA");
      const tempo = block.getFieldValue("TEMPO");

      return `som_nota("SOM","${pino},${nota},${tempo}")\n`;
    };
    // Geração de código Python para o bloco
    Blockly.JavaScript.forBlock["steam_som_pausa"] = function (block) {
      const pino = block.getFieldValue("PINO");
      const tempo = block.getFieldValue("TEMPO");

      return `pausa("PAUSA","${pino},${tempo}")\n`;
    };
  };

  // Categoria da toolbox
  const categoriaSom = {
    kind: "category",
    name: "Som",
    colour: COR_BLOCOS,
    contents: [
      { kind: "block", type: "steam_som_nota" },
      { kind: "block", type: "steam_som_pausa" },
    ],
  };

  // Registra blocos
  window.zoySteamRegistry = window.zoySteamRegistry || [];
  window.zoySteamRegistry.push({ init: som, category: categoriaSom });
})();
