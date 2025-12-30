// 1. Definição do Bloco (Visual)
Blockly.Blocks['cozmo_forward'] = {
  init: function() {
    this.appendDummyInput().appendField("Cozmo: Andar para frente");
    this.appendValueInput("SPEED").setCheck("Number").appendField("vel");
    this.appendValueInput("DURATION").setCheck("Number").appendField("por (s)");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
  }
};

// 2. Definição do Gerador (Lógica)
// IMPORTANTE: Nas versões novas, usamos o objeto 'javascript' global
const cozmoGenerator = javascript.javascriptGenerator;

cozmoGenerator.forBlock['cozmo_forward'] = function(block, generator) {
  const speed = generator.valueToCode(block, 'SPEED', cozmoGenerator.ORDER_ATOMIC) || '50';
  const duration = generator.valueToCode(block, 'DURATION', cozmoGenerator.ORDER_ATOMIC) || '1';
  
  // O código gerado deve ser uma string com '\n' no final
  return `await mover(${speed}, ${duration});\n`;
};

// Bloco Parar
Blockly.Blocks['cozmo_stop'] = {
  init: function() {
    this.appendDummyInput().appendField("Cozmo: Parar");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
  }
};

cozmoGenerator.forBlock['cozmo_stop'] = function(block, generator) {
  return `await parar();\n`;
};