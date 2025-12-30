(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = 210;

  const controle = () => {
    // Verifica se o bloco já foi definido
    if (!Blockly.Blocks["aguarde_segundos"]) {
      Blockly.defineBlocksWithJsonArray([
        {
          type: "aguarde_segundos",
          message0: "aguarde %1 segundos",
          args0: [
            {
              type: "field_number",
              name: "TEMPO",
              value: 1,
              min: 0,
              precision: 0.1,
            },
          ],
          previousStatement: null,
          nextStatement: null,
          colour: COR_BLOCOS,
          tooltip: "Pausa a execução por N segundos",
          helpUrl: "",
        },
        {
          type: "aguarde_milissegundos",
          message0: "aguarde %1 milissegundos",
          args0: [
            {
              type: "field_number",
              name: "TEMPO",
              value: 1000,
              min: 0,
              precision: 0,
            },
          ],
          previousStatement: null,
          nextStatement: null,
          colour: COR_BLOCOS,
          tooltip: "Pausa a execução por N milissegundos",
          helpUrl: "",
        },
      ]);

      // MUDANÇA CRUCIAL AQUI: Gerar o comando 'pausa(AGUARDA, N)'
      Blockly.JavaScript.forBlock["aguarde_segundos"] = (block) => {
        const tempo = block.getFieldValue("TEMPO");
        // O comando 'pausa' é processado pelo executarCodigo.js
        // e traduzido para o comando serial <AGUARDA:N>
        return `pausa('AGUARDA', ${tempo})\n`;
      };

      Blockly.JavaScript.forBlock["aguarde_milissegundos"] = (block) => {
        const tempo = block.getFieldValue("TEMPO");
        // O comando 'pausa' é processado pelo executarCodigo.js
        // e traduzido para o comando serial <AGUARDA:N>
        return `pausa('AGUARDA_MS', ${tempo})\n`;
      };
    }

    // ... Personalização dos blocos nativos
    const original_controls_repeat_ext = Blockly.Blocks['controls_repeat_ext'].init;
    Blockly.Blocks['controls_repeat_ext'].init = function() {
      original_controls_repeat_ext.call(this);
      this.setColour(COR_BLOCOS);
    }
    
    const original_controls_whileUntil = Blockly.Blocks['controls_whileUntil'].init;
    Blockly.Blocks['controls_whileUntil'].init = function() {
      original_controls_whileUntil.call(this);
      this.setColour(COR_BLOCOS);
    }

    const original_controls_for = Blockly.Blocks['controls_for'].init;
    Blockly.Blocks['controls_for'].init = function() {
      original_controls_for.call(this);
      this.setColour(COR_BLOCOS);
    }
    
  };

  const categoriaControle = {
    kind: "category",
    name: "Controle",
    colour: COR_BLOCOS,
    contents: [
      // { kind: "label", text: "Controle de Condição:" },
      { kind: "block", type: "controls_if" },

      // Adicionando um separador visual
      { kind: "sep", gap: "50" },

      // { kind: "label", text: "Controle de repetição:" },
      { kind: "block", type: "controls_repeat_ext" },
      { kind: "block", type: "controls_whileUntil" },
      { kind: "block", type: "controls_for" },

      // Adicionando um separador visual
      { kind: "sep", gap: "50" },

      // { kind: "label", text: "Controle de tempo:" },
      // bloco customizado aguarda segundos e milissegundos
      { kind: "block", type: "aguarde_segundos" },
      { kind: "block", type: "aguarde_milissegundos" },
    ],
  };

  // Registra globalmente
  window.basicCategories = window.basicCategories || [];
  window.basicCategories.push(categoriaControle);

  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.push(controle);

})();