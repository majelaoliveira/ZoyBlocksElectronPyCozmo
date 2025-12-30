// home.js

window.deviceManagerIP = null;

const { loadAssetsGroup } = window.electronAPI.utils;

// Array de assets a serem carregados, usando os caminhos do preload
const assetsToLoad = {
  css: [
    { name: "base", type: "css", path: `${window.paths.styles.base}base.css` },
  ],
  bootstrap: [
    {
      name: "bootstrap_css",
      type: "css",
      path: `${window.paths.libs.bootstrap}bootstrap.min.css`,
    },
    {
      name: "bootstrap_js",
      type: "js",
      path: `${window.paths.libs.bootstrap}bootstrap.bundle.min.js`,
    },
  ],
  blocklyCore: [
    {
      name: "blockly_compressed",
      type: "js",
      path: `${window.paths.blockly.core}blockly_compressed.js`,
    },
    {
      name: "blocks_compressed",
      type: "js",
      path: `${window.paths.blockly.core}blocks_compressed.js`,
    },
    {
      name: "javascript_compressed",
      type: "js",
      path: `${window.paths.blockly.core}javascript_compressed.js`,
    },
  ],
  blocklyMsg: [
    { name: "en", type: "js", path: `${window.paths.blockly.msg}en.js` },
    { name: "es", type: "js", path: `${window.paths.blockly.msg}es.js` },
    { name: "pt-br", type: "js", path: `${window.paths.blockly.msg}pt-br.js` },
  ],
  blocksDeviceBasic: [
    // Blocos basicos
    {
      name: "basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}basic_blocks.js`,
    },
    // importar categorias do basicblocks
    {
      name: "controle_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/controle.js`,
    },
    {
      name: "logica_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/logica.js`,
    },
    {
      name: "matematica_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/matematica.js`,
    },
    {
      name: "texto_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/texto.js`,
    },
    {
      name: "serial_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/serial.js`,
    },
    {
      name: "variavel_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/variaveis.js`,
    },
    {
      name: "funcao_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/funcao.js`,
    },
    {
      name: "extra_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/extra.js`,
    },
  ],
  images: [
    {
      name: "ZoySTEAM",
      type: "img",
      path: `${window.paths.imgs.imgs}ZoySTEAM.png`,
    },
    {
      name: "zoySTEAMPlaca",
      type: "img",
      path: `${window.paths.imgs.imgs}zoySTEAMPlaca.png`,
    },
    { name: "Cima", type: "img", path: `${window.paths.imgs.imgs}Cima.png` },
    { name: "Baixo", type: "img", path: `${window.paths.imgs.imgs}Baixo.png` },
    {
      name: "PlacaNano",
      type: "img",
      path: `${window.paths.imgs.imgs}PlacaNano.png`,
    },
  ],
};

// IPs de Sugestão. COLOQUE O IP REAL DO SEU ESP8266 AQUI.
const SUGESTOES_DE_IPS = ["192.168.4.1 (ESP8266 REAL)", "192.168.1.100", "10.0.0.5"];

// ----------------------------------------------------------------------------
// ----------- Lógica de conexões Wi-Fi (NOVA LÓGICA DE SELEÇÃO) --------------
// ----------------------------------------------------------------------------

window.wifiConectado = false; // flag global simples

// Função para exibir logs no terminal com hora (mantida)
function exibirLogNoTerminal(log) {
  const terminalElement = document.getElementById("terminal");
  if (!terminalElement) return;

  const hora = new Date().toLocaleTimeString();

  const logDiv = document.createElement("div");
  logDiv.textContent = `[${hora}] ${log}`; // Inclui hora
  terminalElement.appendChild(logDiv);

  // Rolagem automática para o final do terminal
  terminalElement.scrollTop = terminalElement.scrollHeight;
}

// Atualiza badge visual de status Wi-Fi (revisada)
function atualizarBadgeWifi(conectado, mensagem = "") {
  const badgeWrap = document.getElementById("wifiStatusBadge");
  if (!badgeWrap) return;

  // Assumindo que você tem um badge com ID 'statusWifiBadge' no HTML
  const badge = document.getElementById("statusWifiBadge");

  if (badge) {
    badge.textContent = mensagem;
    if (conectado) {
        badge.classList.remove("bg-secondary", "bg-danger");
        badge.classList.add("bg-success");
    } else {
        badge.classList.remove("bg-success");
        badge.classList.add("bg-secondary");
    }
  }

  if (mensagem) exibirLogNoTerminal(`[WIFI] ${mensagem}`);
}

// ==========================================================
// FUNÇÃO: Busca e lista os IPs Wi-Fi disponíveis
// ==========================================================
async function buscarIPsWifi() {
    const select = document.getElementById("selectIpRobo");
    const btnConectar = document.getElementById("btnConectarWifi");
    const btnBuscar = document.getElementById("btnBuscarIPs");

    // Desativa a interface durante a busca
    btnBuscar.disabled = true;
    select.innerHTML = '<option value="">Buscando...</option>';
    select.disabled = true;
    btnConectar.disabled = true;

    exibirLogNoTerminal("[WIFI] Buscando dispositivos Wi-Fi disponíveis...");

    try {
        // Simulação de busca
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const ipsDisponiveis = SUGESTOES_DE_IPS; 
        
        select.innerHTML = '<option value="">Selecione o IP...</option>';
        
        if (ipsDisponiveis && ipsDisponiveis.length > 0) {
            ipsDisponiveis.forEach(ipComDescricao => {
                const option = document.createElement('option');
                const ipPuro = ipComDescricao.split(' ')[0]; 
                option.value = ipPuro; 
                option.textContent = ipComDescricao;
                select.appendChild(option);
            });

            select.disabled = false;
            exibirLogNoTerminal(`[WIFI] ${ipsDisponiveis.length} IPs encontrados. Selecione um.`);

            // Listener: Habilita o botão de conectar SOMENTE ao selecionar um IP
            select.onchange = () => {
                // Habilita se um IP foi selecionado E NÃO estiver conectado
                btnConectar.disabled = !select.value || window.wifiConectado; 
            };

        } else {
            select.innerHTML = '<option value="">Nenhum IP encontrado.</option>';
            exibirLogNoTerminal("[WIFI] Nenhum dispositivo Wi-Fi encontrado.");
        }

    } catch (err) {
        select.innerHTML = '<option value="">Erro na busca.</option>';
        exibirLogNoTerminal(`[WIFI] Erro ao buscar IPs: ${err.message}`);
    } finally {
        btnBuscar.disabled = false;
    }
}


// ==========================================================
// FUNÇÃO: Gerencia Conexão E Desconexão Wi-Fi (Lê do SELECT)
// ==========================================================
async function conectarWifi() {
    const btn = document.getElementById("btnConectarWifi");
    const select = document.getElementById("selectIpRobo");
    const ip = select.value.trim();

    // 1. Lógica para Desconexão (toggle)
    if (window.wifiConectado) {
        select.disabled = true;
        btn.disabled = true;
        exibirLogNoTerminal("[WIFI] Desconectando...");
        
        await window.deviceManager.desconectar();
        
        // Retorna ao estado inicial
        window.wifiConectado = false;
        atualizarBadgeWifi(false, "Desconectado");
        btn.textContent = "Conectar Wi-Fi";
        btn.classList.remove("btn-danger");
        btn.classList.add("btn-primary");
        select.disabled = false;
        document.getElementById("btnBuscarIPs").disabled = false;
        btn.disabled = !select.value; // Habilita se um IP estiver selecionado
        return;
    }

    // 2. Lógica para Conexão
    if (!ip) {
        exibirLogNoTerminal("[WIFI] Por favor, selecione um IP para conectar.");
        return;
    }

    // Desativa a interface durante a tentativa de conexão
    select.disabled = true;
    document.getElementById("btnBuscarIPs").disabled = true;
    btn.disabled = true;
    btn.textContent = "Conectando...";

    exibirLogNoTerminal(`[WIFI] Tentando conectar em ${ip}...`);
    try {
        const ok = await window.deviceManager.conectarWifi(ip); 
        
        if (ok) {
            window.wifiConectado = true;
            atualizarBadgeWifi(true, `Conectado a ${ip}`);
            
            // Sucesso: Altera texto e estilo para "Desconectar"
            btn.textContent = "Desconectar Wi-Fi";
            btn.classList.remove("btn-primary");
            btn.classList.add("btn-danger");
        } else {
            // Falha
            atualizarBadgeWifi(false, "Falha ao conectar (retorno falso)");
        }
    } catch (err) {
        atualizarBadgeWifi(false, `Falha: ${err.message}`);
    } finally {
        // Habilita novamente a interface se a conexão falhou
        if (!window.wifiConectado) {
            select.disabled = false;
            document.getElementById("btnBuscarIPs").disabled = false;
            btn.textContent = "Conectar Wi-Fi";
            btn.classList.remove("btn-danger");
            btn.classList.add("btn-primary");
            btn.disabled = !select.value;
        } else {
             btn.disabled = false; // Habilita o botão Desconectar
        }
    }
}


// ----------------------------------------------------------------------------
// ----------- FIM DA NOVA LÓGICA DE CONEXÃO WI-FI ----------------------------
// ----------------------------------------------------------------------------



// ----------------------------------------------------------------------------
// ----------- Importações Iniciais da página ---------------------------------
// ----------------------------------------------------------------------------
// Mapeamento de Dispositivos: Define quais arquivos/funções carregar para cada placa.
const DEVICE_CONFIG = {
  "zoySTEAM": {
    assets: [
      // Todos os assets de blocos específicos da ZoySTEAM
      {
        name: "zoySteamBlocks",
        type: "js",
        path: `${window.paths.blocks_device.zoy_steam_blocks}zoy_steam_blocks.js`,
      },
      // importar categorias do zoySteamBlocks
      {
        name: "evento_zoySteamBlocks",
        type: "js",
        path: `${window.paths.blocks_device.zoy_steam_blocks}cates/evento.js`,
      },
      {
        name: "luz_zoySteamBlocks",
        type: "js",
        path: `${window.paths.blocks_device.zoy_steam_blocks}cates/luz.js`,
      },
      {
        name: "motores_zoySteamBlocks",
        type: "js",
        path: `${window.paths.blocks_device.zoy_steam_blocks}cates/motores.js`,
      },
      {
        name: "motoresAvancados_zoySteamBlocks",
        type: "js",
        path: `${window.paths.blocks_device.zoy_steam_blocks}cates/motoresAvancados.js`,
      },
      {
        name: "sensores_zoySteamBlocks",
        type: "js",
        path: `${window.paths.blocks_device.zoy_steam_blocks}cates/sensores.js`,
      },
      {
        name: "botao_zoySteamBlocks",
        type: "js",
        path: `${window.paths.blocks_device.zoy_steam_blocks}cates/botao.js`,
      },
      {
        name: "pinosLivres_zoySteamBlocks",
        type: "js",
        path: `${window.paths.blocks_device.zoy_steam_blocks}cates/pinosLivres.js`,
      },
      {
        name: "som_zoySteamBlocks",
        type: "js",
        path: `${window.paths.blocks_device.zoy_steam_blocks}cates/som.js`,
      },
      {
        name: "servo_zoySteamBlocks",
        type: "js",
        path: `${window.paths.blocks_device.zoy_steam_blocks}cates/servo.js`,
      },
      {
        name: "infravermelho_zoySteamBlocks",
        type: "js",
        path: `${window.paths.blocks_device.zoy_steam_blocks}cates/infravermelho.js`,
      },
      {
        name: "comunicacaoInfra_zoySteamBlocks",
        type: "js",
        path: `${window.paths.blocks_device.zoy_steam_blocks}cates/comunicacaoInfra.js`,
      },
    ],
    defineFunction: 'zoySteamBlocks', // Função global (window.zoySteamBlocks) que registra os blocos
    toolboxVariable: 'toolboxZoySteam', // Variável global do toolbox (window.toolboxZoySteam)
  },

  "arduino_nano": {
    assets: [
      // Todos os assets de blocos específicos do Arduino Nano
      {
        name: "nanoBlocks",
        type: "js",
        path: `${window.paths.blocks_device.arduino_nano_blocks}arduino_nano_blocks.js`,
      },

      // importar categorias do nanoBlocks
      {
        name: "evento_nanoBlocks",
        type: "js",
        path: `${window.paths.blocks_device.arduino_nano_blocks}cates/evento.js`,
      },
      {
        name: "pin_nanoBlocks",
        type: "js",
        path: `${window.paths.blocks_device.arduino_nano_blocks}cates/pin.js`,
      },
      {
        name: "luz_nanoBlocks",
        type: "js",
        path: `${window.paths.blocks_device.arduino_nano_blocks}cates/luz.js`,
      },
      {
        name: "sensores_nanoBlocks",
        type: "js",
        path: `${window.paths.blocks_device.arduino_nano_blocks}cates/sensores.js`,
      },
      {
        name: "servo_nanoBlocks",
        type: "js",
        path: `${window.paths.blocks_device.arduino_nano_blocks}cates/servo.js`,
      },
    ],
    defineFunction: 'nanoBlocks', 
    toolboxVariable: 'toolboxNano', 
  },

  "arduino_uno": {
    assets: [
      // Todos os assets de blocos específicos do Arduino Uno
      {
        name: "unoBlocks",
        type: "js",
        path: `${window.paths.blocks_device.arduino_uno_blocks}arduino_uno_blocks.js`,
      },

      // importar categorias do unoBlocks
      {
        name: "evento_unoBlocks",
        type: "js",
        path: `${window.paths.blocks_device.arduino_uno_blocks}cates/evento.js`,
      },
      {
        name: "pin_unoBlocks",
        type: "js",
        path: `${window.paths.blocks_device.arduino_uno_blocks}cates/pin.js`,
      },
      {
        name: "luz_unoBlocks",
        type: "js",
        path: `${window.paths.blocks_device.arduino_uno_blocks}cates/luz.js`,
      },
      {
        name: "sensores_unoBlocks",
        type: "js",
        path: `${window.paths.blocks_device.arduino_uno_blocks}cates/sensores.js`,
      },
      {
        name: "servo_unoBlocks",
        type: "js",
        path: `${window.paths.blocks_device.arduino_uno_blocks}cates/servo.js`,
      },
    ],
    defineFunction: 'unoBlocks', 
    toolboxVariable: 'toolboxUno',
  },        
};

async function initializeImports() {
  try {
    // Carrega CSS
    await loadAssetsGroup(assetsToLoad.css);

    // Carrega Bootstrap
    await loadAssetsGroup(assetsToLoad.bootstrap);

    // Carrega Blockly core e mensagens
    await loadAssetsGroup([
      ...assetsToLoad.blocklyCore,
      ...assetsToLoad.blocklyMsg,
    ]);

    // Carrega SOMENTE os Blocos BÁSICOS Inicialmente.
    await loadAssetsGroup(assetsToLoad.blocksDeviceBasic);

  } catch (error) {
    console.error("❌ Erro ao inicializar Importações:", error);
  }
}

// ----------------------------------------------------------------------------
// ----------- Inicialização do workspace -------------------------------------
// ----------------------------------------------------------------------------
let workspace = null; // Variável para armazenar a instância do workspace do Blockly

async function createWorkspace(toolbox) {
  // carrega midia(imgs,mp3 ...) do arquivo blockly local
  const mediaPath = window.paths.blockly.media;
  try {
    // Inicializa workspace Blockly
    workspace = Blockly.inject("blocklyDiv", {
      toolbox: toolbox,
      horizontalLayout: false,
      toolboxPosition: "start",
      media: mediaPath,
      grid: { spacing: 20, length: 1, colour: "#ffffffff", snap: true },
      trashcan: true,
      scrollbars: true,
      zoom: {
        startScale: 0.8,
        maxScale: 2,
        minScale: 0.3,
        scaleSpeed: 1.1,
        controls: true, // Ativa botões de zoom
        wheel: false, // Desative zoom com roda do mouse
        pinch: false, // Desative zoom com gesto de pinça (touchscreen)
      },
      renderer: "zelos", // Tema dos blocos : geras(clasico), zelos(cartoon) e thrasos(industrial)
      theme: Blockly.Themes.Classic, // Classic ou Dark, HighContrast, etc
    });

    window.workspace = workspace; // Torna o workspace globalmente acessível

    console.log("✅ Blockly carregado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar app:", error);
  }
}

// ---------------------------------------------------------------------------
// Atualiza o workspace ao selecionar uma placa
// ---------------------------------------------------------------------------

// Cache para saber quais blocos de dispositivo já foram carregados
const loadedDeviceAssets = new Set();
let currentDeviceToolbox = null; // Armazena o toolbox do dispositivo atualmente carregado

async function atualizarWorkspace(selectPlaca) {
  if (!selectPlaca) return;

  selectPlaca.addEventListener("change", async (e) => {
    const placa = e.target.value;
    const config = DEVICE_CONFIG[placa];

    if (!config) {
      console.warn(`Placa desconhecida selecionada: ${placa}`);
      return;
    }

    exibirLogNoTerminal(`[BLOCOS] Placa selecionada: ${placa}`);

    // Carrega os assets do dispositivo se ainda não foram carregados
    if (!loadedDeviceAssets.has(placa)) {
      try {
        // Carrega todos os JS Blocks/Categories para a placa
        await loadAssetsGroup(config.assets);

        // Chama a função global de definição dos blocos (ex: window.zoySteamBlocks())
        if (window[config.defineFunction] && typeof window[config.defineFunction] === 'function') {
          window[config.defineFunction](); // Define blocos e preenche a variável de toolbox (ex: window.toolboxZoySteam)
        }

        loadedDeviceAssets.add(placa);
      } catch (error) {
        console.error(`❌ Erro ao carregar ou registrar blocos para ${placa}:`, error);
        return;
      }
    }

    // MONTAR O NOVO TOOLBOX
    const contents = [];
    const deviceToolbox = window[config.toolboxVariable]; // Pega a variável de toolbox específica (ex: window.toolboxZoySteam)

    // Adiciona categorias do dispositivo primeiro
    if (deviceToolbox && deviceToolbox.contents?.length) {
        contents.push(...deviceToolbox.contents);
    }

    // Depois adiciona categorias básicas (que já foram carregadas em initializeImports)
    if (window.toolboxbasicBlocks?.contents?.length) {
        contents.push(...window.toolboxbasicBlocks.contents);
    }

    const newToolbox = { kind: "categoryToolbox", contents };

    // ATUALIZAR WORKSPACE
    if (window.workspace) {
        window.workspace.updateToolbox(newToolbox);
        // Limpa a área de trabalho para evitar blocos incompatíveis da placa anterior
        window.workspace.clear(); 
        // Atualiza a área de código após limpar
        atualizarAreaCodigo(); 
    } else {
        // Se por algum motivo o workspace ainda não existir (embora já seja criado com blocos básicos)
        await createWorkspace(newToolbox);
    }
  });
}

// ----------------------------------------------------------------------------
// ----------- Aréa de código em Javascript ---------------------------------------
// ----------------------------------------------------------------------------
// Atualiza espaço de código de acordo com a manipulção do blocos no workspace
function atualizarAreaCodigo() {
  // Proteção simples para erro no carregamento do workspace ou Blockly
  if (!window.workspace || !Blockly.JavaScript) return;

  try {
    const codigo = Blockly.JavaScript.workspaceToCode(workspace);
    document.getElementById("areaCodigo").textContent =
      codigo || "# Nenhum código gerado.";
  } catch (e) {
    console.warn("Erro ao gerar código:", e);
    document.getElementById("areaCodigo").textContent = "# Erro na geração do código.";
  }
}

function configurarAtualizacaoCodigo() {
  if (workspace) {
    workspace.addChangeListener(function (event) {
      // Verifica se a alteração foi relevante (por exemplo, a adição de blocos)
      if (
        event.type === Blockly.Events.BLOCK_CREATE ||
        event.type === Blockly.Events.BLOCK_CHANGE ||
        event.type === Blockly.Events.BLOCK_DELETE ||
        event.type === Blockly.Events.BLOCK_MOVE
      ) {
        atualizarAreaCodigo(); // Atualiza o código quando um bloco for adicionado ou modificado
      }
    });
  } else {
    console.warn("Workspace ainda não foi inicializado.");
  }
}

// ----------------------------------------------------------------------------
// ----------- Pré load de imagens do carrossel -------------------------------
// ----------------------------------------------------------------------------
// Lazy load de imagens (opcional, ex: pré-carregamento)
async function preloadImages() {
  // Carrega fisicamente as imagens (lazy load)
  await loadAssetsGroup(assetsToLoad.images);

  // Agora adiciona as imagens no carousel dinamicamente
  const container = document.getElementById("carouselInner");
  if (!container) return;

  assetsToLoad.images.forEach((img, index) => {
    const div = document.createElement("div");
    div.className = `carousel-item${index === 0 ? " active" : ""}`;

    const image = document.createElement("img");
    image.className = "d-block w-100";
    image.alt = img.name;
    image.src = img.path; // caminho seguro do preload

    div.appendChild(image);
    container.appendChild(div);
  });
}

// ----------------------------------------------------------------------------
// ----------- botões de navegação de telas -----------------------------------
// ----------------------------------------------------------------------------
// Terminal Completo
document
  .getElementById("abrirTerminalCompletoBtn")
  .addEventListener("click", () => {
    window.electronAPI.abrirTerminalCompleto();
  });

// ZoyGPT
document.getElementById("abrirZoyGPTBtn").addEventListener("click", () => {
  window.electronAPI.abrirZoyGPT();
});

// ZoyVision
document.getElementById("btnZoyVision").addEventListener("click", () => {
  window.electronAPI.abrirZoyVision();
});

// ZoyGames
document.getElementById("btnZoyGames").addEventListener("click", () => {
  window.electronAPI.abrirZoyGames();
});

// BlocklyGames
document.getElementById("btnBlocklyGames").addEventListener("click", () => {
  window.electronAPI.abrirBlocklyGames();
});


/**
 * Configura um prompt personalizado (Modal Bootstrap) para substituir 
 * o window.prompt() padrão do Blockly, que não funciona no Electron.
 */
function configurarPromptVariaveis() {
  const modalElement = document.getElementById('variablePromptModal');
  if (!modalElement) {
    console.error('Modal de variáveis não encontrado no HTML!');
    return;
  }

  // Pega a instância do Modal Bootstrap
  const bootstrapModal = new bootstrap.Modal(modalElement);
  
  // Pega os elementos internos do modal
  const modalText = document.getElementById('variablePromptText');
  const modalInput = document.getElementById('variablePromptInput');
  const saveButton = document.getElementById('variablePromptSave');
  const cancelButton = modalElement.querySelector('[data-bs-dismiss="modal"]');

  let blocklyCallback = null; // Armazena a função de callback do Blockly

  // Define a função de override
  const meuPromptPersonalizado = (message, defaultValue, callback) => {
    modalText.textContent = message;
    modalInput.value = defaultValue;
    blocklyCallback = callback; // Armazena a callback para ser chamada depois
    bootstrapModal.show(); // Mostra o modal
  };

  // Handler do botão Salvar
  saveButton.addEventListener('click', () => {
    const value = modalInput.value;
    if (blocklyCallback) {
      blocklyCallback(value); // Retorna o valor para o Blockly
    }
    blocklyCallback = null; // Limpa a callback
    bootstrapModal.hide();
  });

  // Handler para quando o modal é fechado (pelo 'X', 'Cancelar' ou clique fora)
  modalElement.addEventListener('hidden.bs.modal', () => {
    // Se o modal foi fechado sem salvar, 'blocklyCallback' ainda existirá
    if (blocklyCallback) {
      blocklyCallback(null); // Retorna 'null' (ação de cancelar) para o Blockly
    }
    blocklyCallback = null; // Limpa a callback
  });

  // Finalmente, registra a nossa função no Blockly
  Blockly.dialog.setPrompt(meuPromptPersonalizado);

  // OPCIONAL, mas recomendado: Faça o mesmo para 'alert' e 'confirm'
  Blockly.dialog.setAlert((message, callback) => {
    alert(message); // Você pode criar um modal Bootstrap para 'alert' também
    if (callback) callback();
  });

  Blockly.dialog.setConfirm((message, callback) => {
    // Você pode criar um modal Bootstrap para 'confirm' também
    const result = window.confirm(message); // confirm() também pode falhar
    callback(result);
  });
}

// ----------------------------------------------------------------------------
// ----------- Esconder/Exibir sidebar (menu lateral) -------------------------
// ----------------------------------------------------------------------------
// Toggle Sidebar
document.getElementById("toggleSidebar").addEventListener("click", function () {
  const sidebar = document.getElementById("sidebarRight");
  const blocklyDiv = document.getElementById("blocklyDiv");

  // Toggle a classe 'hidden' no sidebar
  sidebar.classList.toggle("hidden");

  // Ajuste a largura do #blocklyDiv quando a sidebar for escondida
  if (sidebar.classList.contains("hidden")) {
    blocklyDiv.style.flexBasis = "100%"; // Expande o #blocklyDiv para ocupar toda a largura
    blocklyDiv.style.transition = "flex-basis 0.3s ease-in-out"; // Garantir uma transição suave
  } else {
    blocklyDiv.style.flexBasis = "70%"; // Restaura a largura original
    blocklyDiv.style.transition = "flex-basis 0.3s ease-in-out"; // Transição suave
  }

  // Força o Blockly a se redimensionar
  if (window.workspace && typeof window.workspace.resize === "function") {
    window.workspace.resize();
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      window.workspace.resize();
    }, 310);
  }
});

// ----------------------------------------------------------------------------
// ----------- NavBar  --------------------------------------------------------
// ----------------------------------------------------------------------------
function salvarProjeto() {
  try {
    const state = Blockly.serialization.workspaces.save(window.workspace);
    const json = JSON.stringify(state, null, 2);
    
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "projeto.json";
    link.click();

    // Substituído alert por Toast
    mostrarToast("Projeto salvo com sucesso!", "save");
  } catch (error) {
    console.error(error);
    mostrarToast("Erro ao salvar projeto.", "error");
  }
}

async function carregarProjeto() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const state = JSON.parse(event.target.result);
        window.workspace.clear();
        Blockly.serialization.workspaces.load(state, window.workspace);
        
        // Se tiver a função atualizarAreaCodigo no seu escopo, chame-a aqui
        if(typeof atualizarAreaCodigo === 'function') atualizarAreaCodigo(); 
        
        // Substituído alert por Toast
        mostrarToast("Projeto carregado com sucesso!", "load");
      } catch (error) {
        console.error(error);
        mostrarToast("Verifique placa selecionada -  Arquivo inválido, versão antiga ou corrompida", "error");

        // Garante que o workspace seja limpo (remove blocos parciais ou lixos gerados no erro)
        if (window.workspace) {
            window.workspace.clear();
        }

        // Atualiza a área de código para mostrar a mensagem padrão
        atualizarAreaCodigo();
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

// Eventos dos botões de salvar e carregar
document.getElementById("salvarProjeto")?.addEventListener("click", (e) => {
  e.preventDefault();
  salvarProjeto();
});

document.getElementById("carregarProjeto")?.addEventListener("click", (e) => {
  e.preventDefault();
  carregarProjeto();
});



// ----------------------------------------------------------------------------
// ----------- Lógica de conexões Serial --------------------------------------
// ----------------------------------------------------------------------------
// Função de log simples
function log(mensagem, tipo = "normal") {
  console.log(`[${tipo}] ${mensagem}`);

  // **CONSOLIDAÇÃO:** // Encaminha a mensagem para o terminal visual, garantindo que as respostas do Arduino apareçam.
  // Usamos o tipo para formatar a mensagem no terminal
  exibirLogNoTerminal(`[${tipo.toUpperCase()}] ${mensagem}`);
}

// Funções de conexão (não implementadas ainda)
async function listarPortas() {
  try {
    const portas = await window.electronAPI.listarPortas();
    const select = document.getElementById("selectPorta");
    if (!select) {
      log("Elemento selectPorta não encontrado.", "erro");
      return;
    }
    select.innerHTML = "";
    if (portas && portas.length > 0) {
      portas.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.textContent = p;
        select.appendChild(opt);
      });
      log("Portas encontradas: " + portas.join(", "), "sistema");
    } else {
      log("Nenhuma porta serial encontrada.", "sistema");
    }
  } catch (err) {
    log("Erro ao listar portas: " + err.message, "erro");
  }
}
window.listarPortas = listarPortas;

// -------------------------- Função para alternar a conexão -----------------------
let conectado = false;

// Função para atualizar o layout do botão e mostrar toast
function atualizarLayoutConexao(novoEstado, mensagem, tipo) {
  const btnConectar = document.getElementById("btnConectar");

  conectado = novoEstado;

  // Atualiza texto e classes do botão
  if (conectado) {
    btnConectar.textContent = "Desconectar";
    btnConectar.classList.remove("btn-warning");
    btnConectar.classList.add("btn-danger");
  } else {
    btnConectar.textContent = "Conectar";
    btnConectar.classList.remove("btn-danger");
    btnConectar.classList.add("btn-warning");
  }

  // Mostrar toast
  mostrarToast(mensagem, tipo);
}

// Função interna de toast uso do toggleConexao e mostrar o Salar e carregar blocos de projetos
function mostrarToast(mensagem, tipo = "usb-conectado") {
  const toastEl = document.getElementById("statusToast");
  const toastMensagem = document.getElementById("statusToastMensagem");
  const toastIcon = document.getElementById("statusToastIcon");

  const icons = {
    // Ícones SVG para os toasts de Salvar/Carregar projetos
    "save": `
        <span class="text-primary">
          <svg viewBox="0 0 16 16" width="1.3em" height="1.3em" fill="currentColor">
            <path d="M11 2H9v3h2z"/><path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
          </svg>
        </span>`,
    "load": `
        <span class="text-warning">
          <svg viewBox="0 0 16 16" width="1.3em" height="1.3em" fill="currentColor">
            <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981zM2 4a1 1 0 0 0-1 1v1h14V5a1 1 0 0 0-1-1z"/>
          </svg>
        </span>`,

    // Ícones SVG para os toasts de status de conexão
    "usb-conectado": `
        <span role="img" aria-label="usb-connected" class="text-success">
          <svg viewBox="0 0 24 24" width="1.3em" height="1.3em" fill="currentColor" aria-hidden="true">
            <path d="M10 3v10.55A4 4 0 1 0 14 17V9h3v3l4-4-4-4v3h-5V3h-2zM8 21a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
          </svg>
        </span>`,
    "usb-desconectado": `
        <span role="img" aria-label="usb-disconnected" class="text-danger">
          <svg viewBox="0 0 24 24" width="1.3em" height="1.3em" fill="currentColor" aria-hidden="true">
            <path d="M20.707 19.293 4.707 3.293a1 1 0 0 0-1.414 1.414l3.356 3.356A3.98 3.98 0 0 0 6 11a4 4 0 0 0 7 2.645V21h-1a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-1v-3.586l3.293 3.293a1 1 0 0 0 1.414-1.414zM13 10.414V9h1v1.414l-1-1zM8 13a2 2 0 0 1-2-2 1.99 1.99 0 0 1 .301-1.043l2.742 2.742A1.98 1.98 0 0 1 8 13z"/>
            <path d="M15 7h3v3l4-4-4-4v3h-5V3h-2v3.586l2 2V7z"/>
          </svg>
        </span>`,
    error: `
        <span role="img" aria-label="error" class="text-danger">
          <svg viewBox="64 64 896 896" width="1.2em" height="1.2em" fill="currentColor" aria-hidden="true">
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448
            448-200.6 448-448S759.4 64 512 64zm165.4
            595.6a8 8 0 010 11.3l-33.9 33.9a8 8
            0 01-11.3 0L512 557.3l-120.2 147.5a8 8
            0 01-11.3 0l-33.9-33.9a8 8 0
            010-11.3L466.7 512 346.6 391.8a8 8
            0 010-11.3l33.9-33.9a8 8 0
            0111.3 0L512 466.7l120.2-120.2a8 8
            0 0111.3 0l33.9 33.9a8 8 0
            010 11.3L557.3 512l120.1 120.2z"></path>
          </svg>
        </span>`
  };

  toastIcon.innerHTML = icons[tipo] || "";
  toastMensagem.textContent = mensagem;

  const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 1500 });
  toast.show();
}

// Função para alternar conexão via botão
async function toggleConexao() {
  const portaSelecionada = document.getElementById("selectPorta").value;
  const baudrateSelecionado = parseInt(document.getElementById("selectBaudrate").value);

  try {
    if (conectado) {
      const resposta = await window.electronAPI.desconectarPorta();
      if (resposta.status) {
        atualizarLayoutConexao(false, "Dispositivo desconectado!", "usb-desconectado");
      } else {
        mostrarToast(`Erro: ${resposta.mensagem}`, "error");
      }
    } else {
      const resposta = await window.electronAPI.conectarPorta(portaSelecionada, baudrateSelecionado);
      if (resposta.status) {
        atualizarLayoutConexao(true, "Dispositivo conectado!", "usb-conectado");
      } else {
        mostrarToast(`Erro: ${resposta.mensagem}`, "error");
      }
    }
  } catch (err) {
    mostrarToast(`Erro inesperado: ${err.message}`, "error");
  }
}

window.toggleConexao = toggleConexao;



// ----------------------------------------------------------------------------
// ----------- Lógica de Executar Código do blocos ----------------------------
// ----------------------------------------------------------------------------
// --- garante conexão Wi-Fi se necessário (não bloqueia execução via USB) ---
async function garantirConexaoWifi() {
  // Se já conectado via UI manual (pelo novo botão), aceita
  if (window.wifiConectado) return true;

  // Lógica de fallback original (Lê o IP de um campo que não existe mais na nova UI, mas mantida por segurança)
  // Se o IP não foi selecionado na nova UI, a execução via Wi-Fi é ignorada.
  const select = document.getElementById("selectIpRobo");
  const ip = select ? select.value.trim() : null;

  if (!ip) {
    exibirLogNoTerminal("[WIFI] Nenhum IP selecionado. Para usar Wi-Fi, selecione o IP.");
    return false;
  }

  exibirLogNoTerminal(`[WIFI] Tentando conectar automaticamente a ${ip}...`);
  try {
    const ok = await window.deviceManager.conectarWifi(ip);
    if (ok) {
      window.wifiConectado = true;
      window.deviceManagerIP = ip;
      exibirLogNoTerminal(`[WIFI] Conectado em ${ip}`);
      // NUNCA MUDAR O ESTADO DO BOTÃO DE CONEXÃO AQUI. A função conectarWifi() gerencia o estado da UI.
      return true;
    } else {
      exibirLogNoTerminal("[WIFI] Conexão retornou falso.");
      return false;
    }
  } catch (err) {
    exibirLogNoTerminal(`[WIFI] Falha ao conectar: ${err.message}`);
    return false;
  }
}

// ----------------------------------------------------------------------------
// ----------- Lógica de Executar Código do blocos ----------------------------
// ----------------------------------------------------------------------------
async function executarCodigo() {
  const preElement = document.getElementById("areaCodigo");
  const areaCodigo = preElement?.textContent?.trim();

  if (!areaCodigo || areaCodigo.includes("Nenhum código gerado")) {
    alert("Nenhum código Javascript válido foi gerado.");
    return;
  }

  // Tenta garantir conexão Wi-Fi (se houver IP selecionado).
  try {
    await garantirConexaoWifi();
  } catch (e) {
    console.warn("garantirConexaoWifi falhou:", e?.message || e);
  }

  // Limpar o terminal antes de começar a execução
  const terminalElement = document.getElementById("terminal");
  if (terminalElement) {
    terminalElement.innerHTML = ""; // Limpa o terminal
  }

  try {
    const resultado = await window.electronAPI.executarCodigo(areaCodigo);

    if (!resultado.status) {
      exibirLogNoTerminal(`[ERRO] ${resultado.mensagem || "Falha desconhecida"}`);
    }

    // Exibir logs no console e no terminal
    if (Array.isArray(resultado.logs)) {
      resultado.logs.forEach((log) => {
        // Exibe no terminal da interface
        exibirLogNoTerminal(log);
      });
    }
  } catch (err) {
    exibirLogNoTerminal(`[ERRO] Falha ao executar código: ${err.message}`);
  }
}


// Limpar Terminal
document.getElementById("limparTerminalBtn")?.addEventListener("click", () => {
  const terminalElement = document.getElementById("terminal");
  if (terminalElement) {
    terminalElement.innerHTML = ''; // Limpa o terminal
  }
});


async function ajudaLinkOpen(e) {
  e.preventDefault(); // Previne o comportamento padrão (abrir no próprio window)
  const url = "http://zoy.com.br";
  const response = await window.electronAPI.openExternal(url);

  if (!response.ok) {
    console.error("Falha ao abrir o link:", response.reason);
  }
}

// ----------------------------------------------------------
// --- EVENTOS PRINCIPAIS(DOMloading)------------------------
// ----------------------------------------------------------
// Inicialização do app quando DOM estiver pronta
window.addEventListener("DOMContentLoaded", async () => {
  await initializeImports(); // Importa CSS, Bootstrap e Blockly
  await preloadImages(); // carrega as imagens e popula o carousel

  // Configura o modal de prompt ANTES de criar o workspace
  configurarPromptVariaveis();

  //Inicializa blocos básicos (efetua define dos blocos e constrói toolboxbasicBlocks)
  if (window.basicBlocks) window.basicBlocks();
  //Cria workspace com SOMENTE toolbox básico (isso garante que ao abrir só apareça o básico)
  await createWorkspace(window.toolboxbasicBlocks);

  configurarAtualizacaoCodigo();

  // Atualiza workspace ao selecionar uma placa
  const selectPlaca = document.getElementById("selectPlaca");
  await atualizarWorkspace(selectPlaca);

  // Expandir área do código Javascript
  const pre = document.getElementById("areaCodigo");
  pre.addEventListener("click", function () {
    const preElement = document.getElementById("areaCodigo");
    preElement.classList.toggle("expanded");
  });

  // Eventos de escuta do serial vindos do Electron
  window.electronAPI.onStatusSerial((data) => {
    log(data.mensagem, "sistema");

    // Atualiza layout sempre que houver mudança
    if (data.status === "conectado") {
      atualizarLayoutConexao(true, "Dispositivo conectado! (Serial)", "usb-conectado");
    } else if (data.status === "desconectado") {
      atualizarLayoutConexao(false, "Dispositivo desconectado! (Serial)", "usb-desconectado");
    }
  });
  window.electronAPI.onDadosSerial((data) => log(data, "normal"));
  window.electronAPI.onErroSerial((data) => log(data.mensagem, "erro"));

  // Botão listar portas
  listarPortas();
  document
    .getElementById("btnListarPortas")
    .addEventListener("click", listarPortas);

  const btnConectar = document.getElementById("btnConectar");
  btnConectar.addEventListener("click", toggleConexao);
  
  // Adiciona o evento de clique no botão executar código
  const btnExecutarCodigo = document.getElementById("btnExecutarCodigo");
  if (btnExecutarCodigo) {
    btnExecutarCodigo.addEventListener("click", executarCodigo);
  }

  // Adiciona o evento de clique no link
  const ajudaLink = document.getElementById("ajuda-link"); // Seu botão de ajuda
  if (ajudaLink) {
    ajudaLink.addEventListener("click", ajudaLinkOpen);
  }
  
  // -----------------------------------------------------
  // --- LISTENERS E INICIALIZAÇÃO DA NOVA INTERFACE WIFI
  // -----------------------------------------------------

  // const btnBuscarIPs = document.getElementById("btnBuscarIPs");
  // if (btnBuscarIPs) {
  //     btnBuscarIPs.onclick = buscarIPsWifi;
  // }
  
  // const btnConectarWifi = document.getElementById("btnConectarWifi");
  // if (btnConectarWifi) {
  //     btnConectarWifi.onclick = conectarWifi;
  // }

  // // Inicia a busca automaticamente
  // buscarIPsWifi(); 
});


async function enviarComando(cmd) {
    try {
        const r = await window.deviceManager.enviar(cmd);
        exibirLogNoTerminal("(OK) " + cmd);
    } catch (e) {
        exibirLogNoTerminal("(ERRO) " + e.message);
    }
}

// Receber status
window.wifiAPI?.onStatusWifi((data) => {
    exibirLogNoTerminal(`[WIFI] ${data.mensagem}`);
});

// Receber dados do robô
window.wifiAPI?.onDadosWifi((msg) => {
    exibirLogNoTerminal(`[Robo Wi-Fi] ${msg}`);
});