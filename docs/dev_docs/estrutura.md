zoyblocks/
├── build/                         # recursos para build do electron-builder
│
├── dist/                          # gerado automaticamente (output do builder)
│
├── docs/                     # documentação de suporte
│   ├── dev_docs/             # documentação de suporte para devs(arquiteturas, tutoriais ...)
│   │   ├── estrutura.md     # Estrutura do projeto / arvore de diretorios
│   │   └── ...
│   ├── manual.json            # manual para gerar faq de perguntas e resposta para o chatbot
│   └── ...
│
├── python/                         # scripts auxiliares em Python
│   │   ├── chatbot/                         # scripts auxiliares em Python
│   │   │   ├── chatbot.py                  # script principal do chatbot
│   │   │   ├──chatbot_fast.py
│   │   │   └── precompute_embeddings.py
│   │   └── zoy_vision/
│   │   │   ├── dist/  
│   │   │   ├── vision.py     
│   │   │   ├── vision.spec    
│
├── node_modules/                  # ambiente node
|
├── src/                           # estrutura-fonte principal
│   ├── assets/               # arquivos estáticos globais
│   │   ├── blocks/           # conjunto de blocos para modo gravar e live
│   │   │   ├── arduino/
│   │   │   │   ├── nano_blocks/
│   │   │   │   └── uno_blocks/
│   │   │   ├── basic_blocks/       #blocos básicos presente em todos os dispositivos
│   │   │   │   ├── cates/
│   │   │   │   │   ├── controle.js
│   │   │   │   │   ├── funcao.js
│   │   │   │   │   └──  outras.js
│   │   │   │   └──  basic_blocks.js
│   │   │   │   └── zoy/
│   │   │   │   │   ├── zoy_maker_blocks/
│   │   │   │   │   └── zoy_steam_blocks/
│   │   ├── icons/
│   │   ├── imgs/
│   │   ├── libs/
│   │   │   ├── phaser/        # arquivos da biblioteca phaser
│   │   │   ├── blockly/       #arquivo copiado da node_module por script
│   │   │   └── bootstrap/     # bootstrap local
│   │   └── styles/
│   │   │   └── base.css       #Estilo global
│   │
│   ├── main/                           # processo principal do Electron
│   │   ├── main.js
│   │   ├── services/                   # lógica de negócio e comunicação
│   │   │   ├── blockly-service.js      # regras dos blocos
│   │   │   └── serial-service.js
│   │   └── preload/
│   │       └── preload.js
│   │
│   ├── renderer/                 # interface gráfica
│   │   ├── views/                # telas da IDE(separadas por html,css e js)
│   │   │   ├── home/             # tela principal
│   │   │   │   ├── home.html
│   │   │   │   ├── home.css
│   │   │   │   └── home.js
│   │   │   ├── terminal/ 
│   │   │   ├── blockly_Games/ 
│   │   │   ├── zoygpt/ 
│   │   │   └── zoyjogos/
│   │   └── utils/                # funções de utilitarios para o front end
│   │   │   └── assetLoader.js    # trata tipos de importação(css,js,img ...)
│
├── venv/                  # ambiente virtual Python
│   ├── Scripts/           # (Windows)
│   └── bin/               # (Linux/macOS)
│
├── .gitignore
├── .env
├── LICENSE
├── package-lock.json
├── package.json
├── packageBackup.json         # copia do package.json que funcion, caso o original seja alterado
├── requirements.txt          # dependencias do venv
└── README.md



Atualização da biblioteca blockly
rode o script `npm run copy-blockly` que está presente no package.json