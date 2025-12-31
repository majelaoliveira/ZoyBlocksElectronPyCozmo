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

// 1. Registro Visual
Blockly.Blocks['cozmo_turn'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Cozmo: Girar")
        .appendField(new Blockly.FieldNumber(90), "ANGLE")
        .appendField("graus");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
  }
};

// 2. Gerador de Código
 cozmoGenerator.forBlock['cozmo_turn'] = function(block, generator) {
  const angle = block.getFieldValue('ANGLE');
  // Este texto 'virar' deve ser idêntico ao nome da função no blockly-service.js
  return `await virar(${angle});\n`;
};

// --- BLOCO MOVER CABEÇA (CORRIGIDO) ---
Blockly.Blocks['cozmo_head'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Cozmo: Mover Cabeça")
        // Trocamos FieldAngle por FieldNumber para evitar o erro de constructor
        .appendField(new Blockly.FieldNumber(0, -25, 44), "ANGLE") 
        .appendField("graus");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};

cozmoGenerator.forBlock['cozmo_head'] = function(block) {
  const angle = block.getFieldValue('ANGLE');
  return `await moverCabeca(${angle});\n`;
};

// 1. Registro Visual
Blockly.Blocks['cozmo_lift'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Cozmo: Altura do Braço")
        .appendField(new Blockly.FieldNumber(0, 0, 100), "HEIGHT")
        .appendField("%");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(20); // Cor laranja/castanho para o braço
  }
};

// 2. Gerador de Código
// Lembra-te: Usa o 'cozmoGenerator' que já foi declarado no topo do teu ficheiro!
cozmoGenerator.forBlock['cozmo_lift'] = function(block) {
  const height = block.getFieldValue('HEIGHT');
  return `await moverBraco(${height});\n`;
};

Blockly.Blocks['cozmo_expression'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Cozmo: Expressão")
        .appendField(new Blockly.FieldDropdown([
            ["Feliz", "HAPPY"],
            ["Triste", "SAD"],
            ["Bravo", "ANGRY"],
            ["Surpreso", "SURPRISED"]
        ]), "EMOTION");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(50); // Cor amarela para expressões
  }
};

cozmoGenerator.forBlock['cozmo_expression'] = function(block) {
  const emotion = block.getFieldValue('EMOTION');
  return `await mostrarExpressao("${emotion}");\n`;
};