(function() {
    // Definir o Bloco Visual
    Blockly.Blocks['cozmo_check_cliff'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Cozmo está na borda?");
            this.setOutput(true, "Boolean");
            this.setColour(0); // Vermelho para alerta
        }
    };

    // Gerador de Código
    if (typeof cozmoGenerator !== 'undefined') {
        cozmoGenerator.forBlock['cozmo_check_cliff'] = function(block) {
            const code = `await checarBorda()`;
            return [code, cozmoGenerator.ORDER_ATOMIC];
        };
    }
})();