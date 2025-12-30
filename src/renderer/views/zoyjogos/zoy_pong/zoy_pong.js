/*
 * -----------------------------------------------------------------
 *   Zoy Pong 2D — Controle Serial (Estabilidade Máxima de Renderização)
 * -----------------------------------------------------------------
 */

// --- Variáveis Globais ---
let lastDistance = 20.0;
let player;
let ball;
let opponentPaddle;
let distanceDisplayElement;
let player1Score = 0;
let player2Score = 0;

// Dimensões e Constantes
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 650;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;
const BALL_SIZE = 20;

// ------------------------ Controle IPC (Electron) ------------------------
// Nota: para utilizar via Electron, exponha `electronAPI.onDadosSerial` no preload script
if (window.electronAPI && window.electronAPI.onDadosSerial) {
  window.electronAPI.onDadosSerial((serialData) => {
    const dataString = serialData.toString().trim();
    const distanceMatch = dataString.match(/(\d+\.?\d*)/);

    if (distanceMatch) {
      const distance = parseFloat(distanceMatch[1]);
      // limite de distâncias esperadas do sensor
      lastDistance = Phaser.Math.Clamp(distance, 5, 40);
    }
  });
}

// ------------------------ Mapeamento do Sensor ------------------------
// Mapeia distância [5..40] cm para posição de raquete no eixo Y [540..100]
function mapDistanceToPaddleY(distance) {
  // normaliza de 0..1
  const t = Phaser.Math.Clamp((distance - 5) / (40 - 5), 0, 1);
  // linear entre 540 (mais perto) e 100 (mais longe)
  return Phaser.Math.Linear(600, 60, t);
}

// ------------------------ FUNÇÕES DE JOGO (Phaser) ------------------------

function startGame(scene) {
  // coloca no centro e zera velocidade
  ball.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);
  ball.body.setVelocity(0, 0);

  const directionX = Math.random() < 0.5 ? 1 : -1;
  const initialSpeed = 300;

  ball.body.setVelocityX(initialSpeed * directionX);
  ball.body.setVelocityY(Phaser.Math.FloatBetween(-150, 150));
}

function hitPaddle(ballObj, paddleObj) {
  // ligeiro aumento de velocidade horizontal (controlado)
  const currentVelX = ballObj.body.velocity.x;
  const sign = currentVelX >= 0 ? 1 : -1;
  let newVelocityX = currentVelX * 1.03; // reduzido para evitar atravessar
  // garante um mínimo de velocidade
  if (Math.abs(newVelocityX) < 200) {
    newVelocityX = 200 * sign;
  }
  ballObj.body.setVelocityX(newVelocityX);

  // efeito vertical baseado no ponto de contato
  const diff = ballObj.y - paddleObj.y;
  ballObj.body.setVelocityY(ballObj.body.velocity.y + diff * 5);
}

function updateScoreDisplay(element) {
  if (element) {
    element.innerHTML = `Jogador 1 (Sensor): <b>${player1Score}</b> | Jogador 2 (CPU): ${player2Score} | Distância: <span id="distanceValue">${lastDistance.toFixed(
      1
    )}</span> cm`;
  }
}

function goBackToMenu() {
  if (window.electronAPI && window.electronAPI.goBack) {
    window.electronAPI.goBack();
  } else {
    window.location.href = "zoyjogos.html";
  }
}

// ------------------------ ESTRUTURA DA CENA ------------------------

function preload() {}

function create() {
  const scene = this;
  window._zoy_scene = scene;

  scene.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
  // Configura quais paredes do mundo são sólidas (esquerda, direita, cima, baixo)
  // false = aberta (bola passa), true = sólida (bola bate)
  scene.physics.world.setBoundsCollision(false, false, true, true);
  scene.cameras.main.setBackgroundColor("#000000");

  const playerX = PADDLE_WIDTH / 2 + 10;
  const cpuX = GAME_WIDTH - PADDLE_WIDTH / 2 - 10;

  // 1. RAQUETE JOGADOR (Sensor)
  player = scene.add.rectangle(
    playerX,
    GAME_HEIGHT / 2,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    0x2ecc71
  );
  player.setOrigin(0.5);

  scene.physics.add.existing(player);
  player.body.setImmovable(true);
  player.body.setCollideWorldBounds(true);
  player.body.setSize(PADDLE_WIDTH, PADDLE_HEIGHT);
  // body offset = centraliza o corpo no game object
  player.body.setOffset(-PADDLE_WIDTH / 2, -PADDLE_HEIGHT / 2);

  // 2. CPU
  opponentPaddle = scene.add.rectangle(
    cpuX,
    GAME_HEIGHT / 2,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    0xe74c3c
  );
  opponentPaddle.setOrigin(0.5);

  scene.physics.add.existing(opponentPaddle);
  opponentPaddle.body.setImmovable(true);
  opponentPaddle.body.setCollideWorldBounds(true);
  opponentPaddle.body.setSize(PADDLE_WIDTH, PADDLE_HEIGHT);
  opponentPaddle.body.setOffset(-PADDLE_WIDTH / 2, -PADDLE_HEIGHT / 2);

  // 3. BOLA
  ball = scene.add.circle(
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2,
    BALL_SIZE / 2,
    0xffa500
  );
  ball.setOrigin(0.5);

  scene.physics.add.existing(ball);
  // usa corpo circular para colisões mais naturais
  ball.body.setCircle(BALL_SIZE / 2);
  ball.body.setOffset(-BALL_SIZE / 2, -BALL_SIZE / 2);
  ball.body.setCollideWorldBounds(true);
  ball.body.setBounce(1, 1);

  // Linha central
  const lineGraphics = scene.add.graphics({
    lineStyle: { width: 2, color: 0x888888, alpha: 0.5 },
  });
  lineGraphics.beginPath();
  lineGraphics.moveTo(GAME_WIDTH / 2, 0);
  lineGraphics.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
  lineGraphics.strokePath();

  // Colisões
  scene.physics.add.collider(ball, player, hitPaddle, null, scene);
  scene.physics.add.collider(ball, opponentPaddle, hitPaddle, null, scene);

  distanceDisplayElement = document.getElementById("distanceValue");
  scene.scoreDisplayElement = document.getElementById("scoreDisplay");

  startGame(scene);
}

function update() {
  // --------------------------- RAQUETE JOGADOR ---------------------------
  if (distanceDisplayElement) {
    distanceDisplayElement.innerText = lastDistance.toFixed(1);
  }

  const targetY = mapDistanceToPaddleY(lastDistance);

  // LERP correto: from = player.y, to = targetY, t = 0..1
  player.y = Phaser.Math.Linear(player.y, targetY, 0.1);
  player.body.updateFromGameObject();

  // 5. Garantir física consistente
  player.body.setSize(PADDLE_WIDTH, PADDLE_HEIGHT);
  player.body.setOffset(0, 0);
  player.body.setImmovable(true);
  player.body.setMaxVelocity(0, 500);

  // --------------------------- RAQUETE CPU ---------------------------
  const cpuTrackingSpeed = 5;
  let targetCpuY = ball.body.velocity.x > 0 ? ball.y : GAME_HEIGHT / 2;

  if (Math.abs(targetCpuY - opponentPaddle.y) > cpuTrackingSpeed) {
    opponentPaddle.y +=
      targetCpuY > opponentPaddle.y ? cpuTrackingSpeed : -cpuTrackingSpeed;
  }

  opponentPaddle.y = Phaser.Math.Clamp(
    opponentPaddle.y,
    PADDLE_HEIGHT / 2,
    GAME_HEIGHT - PADDLE_HEIGHT / 2
  );
  opponentPaddle.body.updateFromGameObject();

  // --------------------------- PONTUAÇÃO ---------------------------
  if (ball.x < 0) {
    // Ponto para CPU
    player2Score++;
    updateScoreDisplay(this.scoreDisplayElement);
    checkVictory(this); // Verifica se alguém ganhou antes de reiniciar
  } else if (ball.x > GAME_WIDTH) {
    // Ponto para Jogador
    player1Score++;
    updateScoreDisplay(this.scoreDisplayElement);
    checkVictory(this); // Verifica se alguém ganhou antes de reiniciar
  }
}

function checkVictory(scene) {
  const MAX_SCORE = 5; // Jogo acaba com 5 pontos

  if (player1Score >= MAX_SCORE) {
    finishGame(scene, "JOGADOR VENCEU!");
  } else if (player2Score >= MAX_SCORE) {
    finishGame(scene, "CPU VENCEU!");
  } else {
    // Ninguém ganhou ainda, continua o jogo
    startGame(scene);
  }
}

function finishGame(scene, message) {
  // Para a bola
  ball.body.setVelocity(0, 0);
  ball.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);

  // Cria um texto grande na tela
  let text = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, message, {
    fontSize: "64px",
    fill: "#ffffff",
    backgroundColor: "#000000",
  });
  text.setOrigin(0.5);

  // Reinicia o jogo após 3 segundos
  scene.time.delayedCall(3000, () => {
    player1Score = 0;
    player2Score = 0;
    updateScoreDisplay(scene.scoreDisplayElement);
    text.destroy(); // Remove o texto de vitória
    startGame(scene);
  });
}

// --------------------------- CONFIGURAÇÃO DO JOGO ---------------------------
const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: "game-container",
  },
  physics: {
    default: "arcade",
    arcade: {
      // Modo debug para visualizar corpos físicos
      debug: false, // coloque false quando finalizar testes
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

// Inicialização
window.onload = function () {
  new Phaser.Game(config);
};
