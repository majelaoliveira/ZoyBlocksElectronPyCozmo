(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = "#380994";

  const servo = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "nano_servo",
        message0: "Ajustar o servo Garra para o comando  %2 no pino %1 ",
        args0: [
          {
            type: "field_dropdown",
            name: "PINOS",
            options: [
              ["D0", "0"],
              ["D1", "1"],
              ["D2", "2"],
              ["D3", "3"],
              ["D4", "4"],
              ["D5", "5"],
              ["D6", "6"],
              ["D7", "7"],
              ["D8", "8"],
              ["D9", "9"],
              ["D10", "10"],
              ["D11", "11"],
              ["D12", "12"],
              ["D13", "13"],
              ["A0/D14", "14"],
              ["A1/D15", "15"],
              ["A2/D16", "16"],
              ["A3/D17", "17"],
              ["A4/D18", "18"],
              ["A5/D19", "19"],
            ],
          },
          {
            type: "field_dropdown",
            name: "COMANDOS",
            options: [
              ["ABRIR", "A"],
              ["FECHAR", "C"],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "movimenta um servo motor via comando serial",
        helpUrl: "",
      },
      {
        type: "nano_servo360",
        message0:
          "Ajustar Servo 360 para girar no pino %2 em sentido %1 com velocidade %3%",
        args0: [
          {
            type: "field_dropdown",
            name: "SENTIDO",
            options: [
              ["Horário", "HO"],
              ["Antihorário", "AH"],
              ["Parar", "P"],
            ],
          },
          {
            type: "field_dropdown",
            name: "PINOS",
            options: [
              ["D0", "0"],
              ["D1", "1"],
              ["D2", "2"],
              ["D3", "3"],
              ["D4", "4"],
              ["D5", "5"],
              ["D6", "6"],
              ["D7", "7"],
              ["D8", "8"],
              ["D9", "9"],
              ["D10", "10"],
              ["D11", "11"],
              ["D12", "12"],
              ["D13", "13"],
              ["A0/D14", "14"],
              ["A1/D15", "15"],
              ["A2/D16", "16"],
              ["A3/D17", "17"],
              ["A4/D18", "18"],
              ["A5/D19", "19"],
            ],
          },
          {
            type: "field_number",
            name: "VALOR",
            value: 100,
            min: 1,
            max: 100,
            precision: 1,
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
    Blockly.JavaScript.forBlock["nano_servo"] = function (block) {
      const nota = block.getFieldValue("PINOS");
      const tempo = block.getFieldValue("COMANDOS");

      return `servo("${tempo}","${nota}")\n`;
    };
    // Geração de código Python para o bloco
    Blockly.JavaScript.forBlock["nano_servo360"] = function (block) {
      const sentido = block.getFieldValue("SENTIDO");
      const pino = block.getFieldValue("PINOS");
      if (sentido === "HO") {
        // Converte porcentagem (0-100) para valor PWM (0-255)
        const veloConvert = Math.round(
          1499 + (block.getFieldValue("VALOR") / 100) * (1100 - 1499)
        );
        return `servo360("${sentido}","${pino},${veloConvert}")\n`;
      } else if (sentido === "AH") {
        // Converte porcentagem (0-100) para valor PWM (0-255)
        const veloConvert = Math.round(
          1501 + (block.getFieldValue("VALOR") / 100) * (1900 - 1501)
        );
        return `servo360("${sentido}","${pino},${veloConvert}")\n`;
      } else {
        // Se for "P", não é necessário converter, pois é apenas uma parada
        const veloConvert = 0;
        return `servo360("${sentido}","${pino},${veloConvert}")\n`;
      }
    };
  };

  // Categoria da toolbox
  const categoriaServo = {
    kind: "category",
    name: "Servo",
    colour: COR_BLOCOS,
    contents: [
      { kind: "block", type: "nano_servo" },
      { kind: "block", type: "nano_servo360" },
    ],
  };

  // Registra blocos
  window.nanoRegistry = window.nanoRegistry || [];
  window.nanoRegistry.push({ init: servo, category: categoriaServo });
})();
