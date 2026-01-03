(function() {
    const COR_VISAO = 210; // Cor azulada para os blocos de visão

    // 1. Definição do Bloco: Cozmo vê um [Rosto/QR Code]
    Blockly.Blocks['cozmo_check_vision'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Cozmo vê um")
                .appendField(new Blockly.FieldDropdown([
                    ["Rosto", "FACE"], 
                    ["QR Code", "QR"]
                ]), "TIPO_OBJETO");
            this.setOutput(true, "Boolean"); // Define como um bloco de valor (booleano)
            this.setColour(COR_VISAO);
            this.setTooltip("Verifica se o Cozmo está vendo um rosto ou um QR Code agora.");
        }
    };

    // 2. Definição do Gerador de Código
    if (typeof cozmoGenerator !== 'undefined') {
        
        cozmoGenerator.forBlock['cozmo_check_vision'] = function(block) {
            const tipo = block.getFieldValue('TIPO_OBJETO');
            
            // O código gerado chama a função que você definiu no blockly-service.js
            // Como é um bloco de saída (Boolean), retornamos o código e a ordem de precedência
            const code = `await checarVisao("${tipo}")`;
            
            return [code, cozmoGenerator.ORDER_ATOMIC];
        };
    }
})();