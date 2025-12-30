(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = "#4c97ff";
  const COR_BLOCOS_2 = "#3b38ff";

  const motores = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "steam_mover_frente",
        message0: "Mover para Frente",
        args0: [],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Move o robô para frente",
        helpUrl: "",
      },

      {
        type: "steam_mover_tras",
        message0: "Mover para Trás",
        args0: [],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Move o robô para Trás",
        helpUrl: "",
      },

      {
        type: "steam_motor_esquerdo_frente",
        message0: "Motor Esquerdo (Frente)",
        args0: [],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Ligar Motor Esquerdo para Frente",
        helpUrl: "",
      },

      {
        type: "steam_motor_esquerdo_tras",
        message0: "Motor Esquerdo (Trás)",
        args0: [],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Ligar Motor Esquerdo para Trás",
        helpUrl: "",
      },

      {
        type: "steam_motor_direito_frente",
        message0: "Motor Direito (Frente)",
        args0: [],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Ligar Motor Direito para Frente",
        helpUrl: "",
      },

      {
        type: "steam_motor_direito_tras",
        message0: "Motor Direito (Trás)",
        args0: [],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Ligar Motor Direito para Trás",
        helpUrl: "",
      },

      {
        type: "steam_parar_motor_esquerdo",
        message0: "Parar Motor Esquerdo",
        args0: [],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS_2,
        tooltip: "Parar o Motor Esquerdo",
        helpUrl: "",
      },

      {
        type: "steam_parar_motor_direito",
        message0: "Parar Motor Direito",
        args0: [],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS_2,
        tooltip: "Parar o Motor Direito",
        helpUrl: "",
      },

      {
        type: "steam_parar_motores",
        message0: "Parar Motores",
        args0: [],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS_2,
        tooltip: "Parar os 2 Motores do robô",
        helpUrl: "",
      },
    ]);

    // Geração de código Python
    Blockly.JavaScript.forBlock["steam_mover_frente"] = () =>
      'mover_frente("MOTOR_FRENTE","150,150")\n';
    Blockly.JavaScript.forBlock["steam_mover_tras"] = () =>
      'mover_tras("MOTOR_TRAS", "150,150")\n';

    Blockly.JavaScript.forBlock["steam_motor_esquerdo_frente"] = () =>
      'motor_esquerdo_frente("MOTOR_ESQUERDO_FRENTE", "150")\n';
    Blockly.JavaScript.forBlock["steam_motor_esquerdo_tras"] = () =>
      'motor_esquerdo_tras("MOTOR_ESQUERDO_TRAS", "150")\n';
    Blockly.JavaScript.forBlock["steam_motor_direito_frente"] = () =>
      'motor_direito_frente("MOTOR_DIREITO_FRENTE", "150")\n';
    Blockly.JavaScript.forBlock["steam_motor_direito_tras"] = () =>
      'motor_direito_tras("MOTOR_DIREITO_TRAS", "150")\n';

    Blockly.JavaScript.forBlock["steam_parar_motor_esquerdo"] = () =>
      'parar_motor_esquerdo("PARAR_ESQUERDO", "")\n';
    Blockly.JavaScript.forBlock["steam_parar_motor_direito"] = () =>
      'parar_motor_direito("PARAR_DIREITO", "")\n';
    Blockly.JavaScript.forBlock["steam_parar_motores"] = () => 'parar_motor("PARAR", "0,0")\n';
  };

  const categoriaMotores = {
    kind: "category",
    name: "Motores",
    colour: COR_BLOCOS,
    contents: [
      { kind: "block", type: "steam_mover_frente" },
      { kind: "block", type: "steam_mover_tras" },

      // Adicionando um separador visual
      { kind: "sep", gap: "50" },

      { kind: "block", type: "steam_motor_esquerdo_frente" },
      { kind: "block", type: "steam_motor_esquerdo_tras" },
      { kind: "block", type: "steam_motor_direito_frente" },
      { kind: "block", type: "steam_motor_direito_tras" },

      // Adicionando um separador visual
      { kind: "sep", gap: "50" },

      { kind: "block", type: "steam_parar_motor_esquerdo" },
      { kind: "block", type: "steam_parar_motor_direito" },
      { kind: "block", type: "steam_parar_motores" },
    ],
  };

  // Registra blocos
  window.zoySteamRegistry = window.zoySteamRegistry || [];
  window.zoySteamRegistry.push({ init: motores, category: categoriaMotores });
})();
