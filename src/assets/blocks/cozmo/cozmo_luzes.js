(function() {
    const COR_LUZES = "#cf63cf";

    Blockly.Blocks['cozmo_set_lights'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Cozmo: Luzes da Mochila")
                .appendField(new Blockly.FieldDropdown([
                    ["vermelho", "red"], ["verde", "green"], ["azul", "blue"], ["branco", "white"], ["desligar", "off"]
                ]), "COLOR");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COR_LUZES);
        }
    };

    Blockly.Blocks['cozmo_blink_lights'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Cozmo: Piscar luz")
                .appendField(new Blockly.FieldDropdown([
                    ["vermelho", "red"], ["verde", "green"], ["azul", "blue"]
                ]), "COLOR")
                .appendField("por");
            this.appendValueInput("TIMES").setCheck("Number");
            this.appendDummyInput().appendField("vezes");
            this.setInputsInline(true);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COR_LUZES);
        }
    };

    if (typeof cozmoGenerator !== 'undefined') {
        // COR FIXA
        cozmoGenerator.forBlock['cozmo_set_lights'] = function(block) {
            const color = block.getFieldValue('COLOR'); // Pega o valor selecionado no dropdown
            return `await ligarLuzes("${color}");\n`;
        };

        // PISCAR
        cozmoGenerator.forBlock['cozmo_blink_lights'] = function(block, generator) {
            const color = block.getFieldValue('COLOR');
            // Usamos generator.ORDER_ATOMIC que é o padrão do seu cozmoGenerator
            const times = generator.valueToCode(block, 'TIMES', generator.ORDER_ATOMIC) || '3';
            return `await piscarLuzes("${color}", ${times});\n`;
        };
    }
})();