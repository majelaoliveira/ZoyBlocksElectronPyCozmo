/* -----------------------------------------------------------
   ZOY DINO — CONTROLE COM 1 SENSOR (ULTRASSOM) 
   ----------------------------------------------------------- 
*/

// Variável única para a distância, unificada com a lógica do Pong
let sensorDistancia = 100.0; 

let player;
let ground; // 
let obstacles = [];

let score = 0;
let scoreText;

let isCrounch = false;
let isPlayGame = false; // Indica se o jogo não foi iniciado ou personagem morto
let gameSpeed = 5; // Velocidade inicial (pixels por frame)

// Estrutura de Recortes dos Cactos
const CACTUS_FRAMES = [
    { frame: 0, x: 0, y: 20, w: 19, h: 36, offset_y: 0 }, // Cacto 1
    { frame: 1, x: 18, y: 20, w: 37, h: 36, offset_y: 0 }, // Cacto 2
    { frame: 2, x: 54, y: 20, w: 54, h: 36, offset_y: 0 }, // Cacto 3
    { frame: 3, x: 107, y: 5, w: 27, h: 51, offset_y: -15 }, // Cacto 4 (mais alto, precisa de ajuste Y)
    { frame: 4, x: 133, y: 5, w: 52, h: 51, offset_y: -15 }, // Cacto 5
    { frame: 5, x: 210, y: 5, w: 52, h: 51, offset_y: -15 }, // Cacto 6
    { frame: 6, x: 184, y: 5, w: 78, h: 51, offset_y: -15 }  // Cacto 7 (o maior)
];

// ------------------------ LEITURA SERIAL IPC (ADOTADA DO PONG) ------------------------
if (window.electronAPI && window.electronAPI.onDadosSerial) {
    window.electronAPI.onDadosSerial((serialData) => {
        const dataString = serialData.toString().trim();
        // Regex busca por qualquer número (inteiro ou flutuante)
        const distanceMatch = dataString.match(/(\d+\.?\d*)/); 

        if (distanceMatch) {
            const distance = parseFloat(distanceMatch[1]);
            // Filtro de Ruido - Limites de 5 a 40 cm - Evita valores absurdos disparados
            sensorDistancia = Phaser.Math.Clamp(distance, 5, 40); 
        }
    });
}


// ------------------------ CONFIG DO JOGO ------------------------
const GAME_WIDTH = 960; // Largura do jogo
const GAME_HEIGHT = 540; // Altura do jogo
const GROUND_Y = GAME_HEIGHT - 40; // Posição Y do chão

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: "game-container",
    physics: {
        default: "arcade",
        arcade: { 
            // gravity: { y: 1500 }, // Gravidade para o jogo todo (desativada aqui, aplicada individualmente)
            debug: false   // MUDANÇA: ATIVADO o debug para visualização das caixas de colisão
        } 
    },
    scene: { preload, create, update }
};
// Inicialização do jogo
new Phaser.Game(config);


// ------------------------ PRELOAD ------------------------
function preload() {
    // DINO COMPLETO (Correr, Pular, Morrer)
    // Tamanho total 300x60. 5 frames. Cada frame = 60x60.
    this.load.spritesheet("dino", "sprites/dino_run_die_jump.png", { 
        frameWidth: 60, 
        frameHeight: 60 
    });
    // DINO AGACHADO
    // Tamanho total 124x32. 2 frames. Cada frame = 62x32.
    this.load.spritesheet("dino_crounch", "sprites/dino_crounch.png", { 
        frameWidth: 62, 
        frameHeight: 32 
    });

    // CHÃO (Imagem Simples para TileSprite)
    this.load.image("ground", "sprites/ground.png");

    // PTERODÁTILO (Obstáculo)
    this.load.spritesheet("ptero", "sprites/dino_fly.png", { 
        frameWidth: 48, 
        frameHeight: 48 
    });

    // CACTOS (Obstáculo)
    this.load.image("cactos", "sprites/cactus.png");
}

// ------------------------ CREATE ------------------------
function create() {
    // Cor de fundo (simulando a tela clara do Chrome Dino)
    this.cameras.main.setBackgroundColor('#f7f7f7'); 
    
    // CONFIGURAÇÃO DO CHÃO INFINITO (TileSprite)
    // TileSprite(x, y, largura, altura, chave)
    // Usamos GAME_WIDTH na largura para ele cobrir a tela toda
    ground = this.add.tileSprite(GAME_WIDTH / 2, GROUND_Y, GAME_WIDTH, 16, "ground");
    
    // Adiciona física ao TileSprite manualmente (pois ele não é um physics factory nativo)
    this.physics.add.existing(ground, true); // true = estático (não cai)

    // CONFIGURAÇÃO DO DINO
    player = this.physics.add.sprite(100, GAME_HEIGHT - 100, "dino");
    player.setCollideWorldBounds(true);
    player.setGravityY(1500);
    
    // Ajuste da hitbox inicial (Dino em pé 60x60, mas vamos reduzir um pouco as bordas)
    player.body.setSize(42, 44); 
    // Ajusta o corpo(hitbox) para a posição correta dentro do sprite
    player.body.setOffset(10, 14);
    
    this.physics.add.collider(player, ground);

    // CRIANDO AS ANIMAÇÕES
    
    // Correr: Frames 1 a 2 [0,1,2]
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('dino', { frames: [0, 1, 2] }),
        frameRate: 10,
        repeat: -1
    });

    // Pular: Frame 1 [0]
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('dino', { frames: [0] }),
        frameRate: 10,
        repeat: -1
    });

    // Morrer: Frames 4 e 5 [3,4]
    this.anims.create({
        key: 'die',
        frames: this.anims.generateFrameNumbers('dino', { frames: [3, 4] }),
        frameRate: 10,
        repeat: 0 // Não repete, morre e fica parado
    });

    // Agachar: Frames 1 e 2 [0 e 1]
    this.anims.create({
        key: 'crounch',
        frames: this.anims.generateFrameNumbers('dino_crounch', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    // NOVO: Animação de Voo do Pterodátilo
    this.anims.create({
        key: 'fly',
        frames: this.anims.generateFrameNumbers('ptero', { start: 0, end: 1 }),
        frameRate: 8, // Mais lento que o correr
        repeat: -1
    });

    // Inicia correndo
    player.play('run');
    isPlayGame = true; // Jogo começa rodando

    scoreText = document.getElementById("scoreDisplay");

    // Spawn de obstáculos
    this.time.addEvent({
        delay: 1500,
        callback: spawnObstacle,
        callbackScope: this,
        loop: true
    });

    // CONTROLES DO TECLADO (DEBUG)
    this.cursors = this.input.keyboard.createCursorKeys();

    // Variáveis para rastrear o estado do teclado
    this.isKeyDown = {
        up: false,
        down: false
    };
}


// ------------------------ FUNÇÃO DE CRIAR OBSTÁCULO ------------------------

const PTERO_HEIGHTS = [
    GAME_HEIGHT - 45,  // Posição 1: Quase rasteiro (baixo)
    GAME_HEIGHT - 100, // Posição 2: Centro do percurso
    GAME_HEIGHT - 150  // Posição 3: Mais ao céu (alto)
];
const BASE_VELOCITY_FACTOR = 50; // Ajuste para a jogabilidade

function spawnObstacle() {
    const scene = player.scene;
    let obstacle;

    // A Chance de gerar um Pterodátilo é 30% após o score 400
    const scoreThreshold = 400; 
    // Nota: O score exibido é Math.floor(score / 10), então 400 pontos de score = 40 no contador.
    const isPteroTime = (Math.floor(score / 10) >= scoreThreshold) && (Math.random() < 0.3);

    if (isPteroTime) {
        // --- 1. GERA PTERODÁTILO ---
        
        const height = Phaser.Math.RND.pick(PTERO_HEIGHTS);
        
        obstacle = scene.physics.add.sprite(GAME_WIDTH + 40, height, "ptero");
        obstacle.play('fly'); // Começa a voar
        
    } else {
        // --- 2. GERA CACTO ---
        
        const cactusData = Phaser.Math.RND.pick(CACTUS_FRAMES);
        
        // CORREÇÃO: Usamos scene.physics.add.image para garantir que seja um objeto de física
        // Posição Y = Y do chão - (Metade da altura do cacto) + offset manual
        const yPosition = GROUND_Y - (cactusData.h / 2) + cactusData.offset_y;

        obstacle = scene.physics.add.image(GAME_WIDTH + 40, yPosition, "cactos");
        
        // Aplica o recorte (frame)
        obstacle.setCrop(cactusData.x, cactusData.y, cactusData.w, cactusData.h);
        
        // Configura o corpo (hitbox)
        obstacle.body.setSize(cactusData.w, cactusData.h);
        // CORREÇÃO: Ajusta a hitbox para o recorte dentro do sprite.
        obstacle.body.setOffset(cactusData.x, cactusData.y); 
        
        obstacle.body.setImmovable(true);
    }
    
    // Configurações Comuns
    obstacle.body.setAllowGravity(false); 
    obstacle.setImmovable(true);
    obstacle.setCollideWorldBounds(false);
    
    // Velocidade baseada na gameSpeed atual
    obstacle.setVelocityX(-(gameSpeed * BASE_VELOCITY_FACTOR)); 

    obstacles.push(obstacle);
    scene.physics.add.collider(player, obstacle, gameOver, null, scene);
}


// ------------------------ UPDATE LOOP ------------------------
function update() {

    // --- LÓGICA DE TESTE/DEBUG usando TECLADO para jogar ---
    // PULO (Seta para CIMA)
    if (this.cursors.up.isDown) {
        this.isKeyDown.up = true;
        // Força o sensor a um valor que dispara o PULO (< 15cm)
        sensorDistancia = 5; 
    } else if (this.isKeyDown.up) {
        this.isKeyDown.up = false;
        // Quando solta, restaura um valor neutro (longe, mas dentro do limite)
        sensorDistancia = 40; 
    }
    // AGACHAR (Seta para BAIXO)
    if (this.cursors.down.isDown) {
        this.isKeyDown.down = true;
        // Força o sensor a um valor que dispara o AGACHAR (20cm - 30cm)
        sensorDistancia = 25; 
    } else if (this.isKeyDown.down) {
        this.isKeyDown.down = false;
        // Quando solta, restaura um valor neutro
        sensorDistancia = 40; 
    }
    
    if (isPlayGame) {

        // --- 1. AMBIENTE E PONTUAÇÃO ---
        
        score++;
        // Aumenta a velocidade progressivamente
        gameSpeed += 0.001; 

        // Move o chão (TileSprite) para criar o efeito de corrida infinita
        ground.tilePositionX += gameSpeed;

        // Atualiza texto (Score e Sensor)
        scoreText.innerHTML = `Score: ${Math.floor(score / 10)} | Distância: ${sensorDistancia.toFixed(1)} cm`;


        // --- 2. OBSTÁCULOS (Sincronizados com o chão) ---
        
        // Move todos os cactos para a esquerda baseados na gameSpeed atual
        // Multiplicamos por 60 para converter a velocidade do chão em velocidade física
        obstacles.forEach(o => o.setVelocityX(-(gameSpeed * 60)));

        // Remove cactos que saíram da tela (Limpeza de Memória)
        obstacles = obstacles.filter(o => {
            if (o.x < -100) { // Margem de segurança maior (-100)
                o.destroy();
                return false;
            }
            return true;
        });


        // --- 3. LÓGICA VISUAL (ANIMAÇÕES) ---
        
        // Se estiver no ar (Pulando)
        if (!player.body.touching.down) {
            player.anims.stop(); 
            player.setFrame(0); // Frame estático de pulo
        } 
        else {
            // Se está no chão...
            if (isCrounch) {
                // Toca animação de agachar se já não estiver tocando
                if (player.anims.currentAnim?.key !== 'crounch') {
                    player.play('crounch', true);
                }
            } else {
                // Toca animação de correr se já não estiver tocando
                if (player.anims.currentAnim?.key !== 'run') {
                    player.play('run', true);
                }
            }
        }


        // --- 4. CONTROLE (INPUT DO SENSOR) ---

        // SALTO (< 15cm)
        // Só pula se estiver no chão e não estiver agachado
        if (sensorDistancia < 15 && player.body.touching.down && !isCrounch) {
            player.setVelocityY(-1000); // Força do pulo ajustada para a gravidade de 1500
        }

        // AGACHAR (entre 20cm e 30cm)
        if (sensorDistancia >= 20 && sensorDistancia <= 30 && player.body.touching.down) {
            
            if (!isCrounch) {
                isCrounch = true;
                
                // AJUSTE FÍSICO: Reduz a caixa de colisão
                // (Largura 62, Altura 32 - baseada no seu sprite)
                player.body.setSize(62, 32, true); 
                
                // AJUSTE VISUAL: Desce o sprite para ele não flutuar
                player.y += 15; 
            }

        } 
        // LEVANTAR (Se sair da zona de agachar)
        else if (isCrounch && (sensorDistancia < 20 || sensorDistancia > 30)) {
            
            isCrounch = false;
            
            // AJUSTE FÍSICO: Volta para a caixa de colisão "Em Pé"
            // (Largura 44, Altura 50 - um pouco menor que o sprite 60x60 para facilitar)
            player.body.setSize(44, 50, true);
            
            // AJUSTE VISUAL: Sobe o sprite de volta
            player.y -= 15; 
        }

    } else {
        // Jogo Parado (Game Over ou Menu)
        player.anims.pause();
    }
}

// ------------------------ GAME OVER ------------------------
function gameOver(player, obstacles) {
    this.physics.pause(); // Para toda a física
    player.anims.play('die'); // Toca animação de morte
    
    // Opcional: Para o chão também visualmente
    // ground.tilePositionX para de atualizar pois o update() vai parar ou reiniciar
    
    // Reinicia após um tempo
    player.once('animationcomplete', () => {
        this.time.delayedCall(1000, () => location.reload());
    });
}

function goBack() {
    if (window.electronAPI && window.electronAPI.goBack) {
    window.electronAPI.goBack();
    } else {
    window.location.href = 'zoy_jogos.html';
    }
}