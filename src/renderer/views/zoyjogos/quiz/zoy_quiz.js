/* ---------------------------
   Zoy Quiz — Phaser 3 + JSON
   ----------------------------*/

// Parâmetros do jogo
const MODE = { name: 'Iniciação', doors: 2, pointsPerDoor: 5 };
let gameSceneRef = null;
let currentQuestion = null;
let currentDoorObj = null;
let player;
let score = Number(localStorage.getItem('zoy_score') || 0);
document.getElementById('scoreDisplay').innerText = 'Score: ' + score;

// ------------------------ Botão voltar ------------------------
function goBackToMenu() {
  if (window && window.electronAPI && window.electronAPI.navigateTo) {
    window.electronAPI.navigateTo('menu');
  } else {
    window.location.href = 'zoy_jogos.html';
  }
}

// ------------------------ Helpers globais ------------------------
window.zoyHelpers = {
  score: score,

  resetScore: function() {
    this.score = 0;
    localStorage.setItem('zoy_score', 0);
    document.getElementById('scoreDisplay').innerText = 'Score: 0';
    location.reload();
  },

  setModeToEnem: function() {
    MODE.name='ENEM';
    MODE.doors=10;
    MODE.pointsPerDoor=1;
    alert('Modo alterado para ENEM — recarregue a página para ver 10 portas.');
  },

  loadDisciplina: async function(nome) {
    try {
      const resp = await fetch(`quiz_data/${nome}.json`);
      const perguntas = await resp.json();
      window.QUESTIONS = perguntas;

      // esconder seletor e iniciar Phaser
      document.getElementById('disciplinaSelector').style.display = 'none';
      startPhaserGame();
    } catch(e) {
      console.error('Erro ao carregar disciplina:', e);
      alert('Não foi possível carregar a disciplina.');
    }
  }
};

// ------------------------ Modal Oráculo ------------------------
document.getElementById('oracleOverlay').addEventListener('click', (e)=>{
  if(e.target === document.getElementById('oracleOverlay')) e.stopPropagation();
});

function openOracleForDoor(scene, doorObj){
  currentQuestion = QUESTIONS[Math.floor(Math.random()*QUESTIONS.length)];
  currentDoorObj = doorObj;
  gameSceneRef = scene;

  showOracleModal(currentQuestion);
  scene.physics.world.pause();
}

function showOracleModal(q){
  const overlay = document.getElementById('oracleOverlay');
  const qEl = document.getElementById('oracleQuestion');
  const opts = document.getElementById('oracleOptions');
  const footer = document.getElementById('oracleFooter');

  qEl.innerText = q.question;
  opts.innerHTML = '';
  q.options.forEach((optText, idx)=>{
    const btn = document.createElement('button');
    btn.className = 'optBtn';
    btn.innerText = optText;
    btn.onclick = ()=>handleAnswer(idx);
    opts.appendChild(btn);
  });

  footer.innerText = 'Escolha uma opção para o Oráculo avaliar.';
  overlay.style.visibility = 'visible';
  overlay.setAttribute('aria-hidden','false');
}

function closeOracleModal(){
  const overlay = document.getElementById('oracleOverlay');
  overlay.style.visibility = 'hidden';
  overlay.setAttribute('aria-hidden','true');
}

function handleAnswer(selectedIndex){
  const footer = document.getElementById('oracleFooter');
  if(selectedIndex === currentQuestion.answer){
    footer.innerText = '✅ Correto! ' + currentQuestion.explanation;

    if(currentDoorObj && !currentDoorObj.opened){
      currentDoorObj.opened = true;
      score += MODE.pointsPerDoor;
      localStorage.setItem('zoy_score', score);
      document.getElementById('scoreDisplay').innerText = 'Score: ' + score;

      if(gameSceneRef){
        gameSceneRef.time.delayedCall(800, ()=>{
          try{ gameSceneRef.physics.world.remove(currentDoorObj.body); }catch(e){}
        });
        if(currentDoorObj.setFillStyle) currentDoorObj.setFillStyle(0x2ecc71);
      }
    }
  } else {
    footer.innerText = '❌ Errado. Dica: ' + currentQuestion.explanation;
  }

  setTimeout(()=>{
    closeOracleModal();
    if(gameSceneRef) gameSceneRef.physics.world.resume();
  },1200);
}

// ------------------------ Phaser ------------------------
function startPhaserGame(){
  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 960,
    height: 640,
    backgroundColor: '#87ceeb',
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: { preload, create, update }
  };
  new Phaser.Game(config);
}

function preload(){}
function create(){
  const scene = this;
  window._zoy_scene = scene;

  // jogador
  player = scene.add.rectangle(120,320,40,40,0x222222);
  scene.physics.add.existing(player);
  player.body.setCollideWorldBounds(true);
  player.body.setSize(40,40);

  // portas
  scene.doors = [];
  const startY = 200, gap = 160;
  for(let i=0;i<MODE.doors;i++){
    const y = startY + i*gap;
    const door = scene.add.rectangle(760, y, 64, 120, 0x8B4513);
    scene.physics.add.existing(door, true);
    door.isDoor = true;
    door.opened = false;
    door.doorId = i+1;
    scene.doors.push(door);
  }

  scene.doors.forEach(d=>{
    scene.physics.add.overlap(player, d, (p,dObj)=>{
      if(!dObj.opened) openOracleForDoor(scene, dObj);
    });
  });

  scene.physics.world.setBounds(0,0,960,640);
  scene.cursors = scene.input.keyboard.createCursorKeys();
  scene.add.text(12,610,'Use as setas para mover o Zoy. Vá até uma porta para o Oráculo.',{fontSize:'14px', color:'#000'});
}

function update(){
  const speed = 220;
  if(!this.cursors) return;
  player.body.setVelocity(0);
  if(this.cursors.left.isDown) player.body.setVelocityX(-speed);
  if(this.cursors.right.isDown) player.body.setVelocityX(speed);
  if(this.cursors.up.isDown) player.body.setVelocityY(-speed);
  if(this.cursors.down.isDown) player.body.setVelocityY(speed);
}
