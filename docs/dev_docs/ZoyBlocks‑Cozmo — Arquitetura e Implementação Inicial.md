# **ZoyBlocks‑Cozmo — Arquitetura e Implementação Inicial**

## **1\. Objetivo deste documento**

Este documento descreve **o que foi construído**, **como foi construído** e **por que as decisões foram tomadas** no módulo **ZoyBlocks‑Cozmo**. Ele serve como referência técnica para a equipe da Zoy Educa na retomada pós‑recesso.

O foco desta fase foi **infraestrutura e arquitetura**, não UI nem experiência final do aluno.

---

## **2\. Visão geral do que foi alcançado**

Foi criado um **módulo funcional e isolado** capaz de:

* Integrar o robô **Cozmo** ao ecossistema ZoyBlocks  
* Utilizar **Electron** como orquestrador  
* Utilizar **Python \+ pycozmo** como middleware de robótica  
* Manter **isolamento de dependências** via ambiente virtual próprio  
* Estabelecer um **canal determinístico de comunicação** entre Electron e robô

O Cozmo foi tratado como **mais um backend robótico**, e não como um sistema especial.

---

## **3\. Arquitetura geral**

Blockly (futuro)  
   ↓  
Electron (main process)  
   ↓  JSON via STDIN  
Python (venv\_cozmo)  
   ↓  Protocolo nativo  
Cozmo (Wi‑Fi AP \+ firmware)

Pontos fundamentais:

* Blockly **não fala com hardware**  
* Renderer **não fala com Python diretamente**  
* Todo controle passa pelo **main process** do Electron

---

## **4\. Estrutura de pastas adotada**

ZoyBlocks\_Electron\_Cozmo/  
│  
├── docs/  
│  
├── python/  
│   ├── cozmo\_server.py  
│   └── teste\_cozmo.py  
│  
├── venv\_cozmo/  
│   └── (ambiente virtual Python 3.9)  
│  
├── src/  
│   └── main/  
│       └── main.js  
│  
├── requirements.txt  
├── package.json  
└── .env

Decisão central: **o Cozmo possui seu próprio venv**, separado do venv principal do ZoyBlocksLive.

---

## **5\. Ambiente Python (venv\_cozmo)**

### **5.1 Motivo do venv separado**

* `pycozmo` exige versões estáveis (Python 3.9)  
* Evita conflitos com Flask, IA, visão computacional  
* Permite adicionar outros robôs no futuro com novos venvs

### **5.2 Criação**

python3.9 \-m venv venv\_cozmo  
source venv\_cozmo/bin/activate  
pip install \--upgrade pip  
pip install pycozmo  
deactivate

---

## **6\. Arquivo: python/teste\_cozmo.py**

### **Função**

Teste mínimo de conectividade direta com o robô.

### **Conteúdo**

import pycozmo

print("Iniciando cliente")  
cli \= pycozmo.Client()  
cli.start()  
cli.connect()  
cli.wait\_for\_robot()  
print("Conectado")  
cli.disconnect()  
cli.stop()

Este arquivo foi usado para validar:

* Wi‑Fi direto notebook ↔ Cozmo  
* Funcionamento do pycozmo  
* Estabilidade do venv

---

## **7\. Arquivo: python/cozmo\_server.py**

### **Função**

Atuar como **servidor de controle do Cozmo**, recebendo comandos JSON via STDIN e executando ações no robô.

### **Papel arquitetural**

* Middleware robótico  
* Tradução de intenção → ação física  
* Processo persistente controlado pelo Electron

### **Conteúdo**

import sys  
import json  
import pycozmo

def log(msg):  
    print(json.dumps(msg), flush=True)

cli \= pycozmo.Client()  
cli.start()  
cli.connect()  
cli.wait\_for\_robot()

log({"status": "ready"})

try:  
    for line in sys.stdin:  
        data \= json.loads(line)  
        cmd \= data.get("cmd")

        if cmd \== "move":  
            speed \= data.get("speed", 50\)  
            duration \= data.get("duration", 1\)  
            cli.drive\_wheels(speed, speed, duration=duration)  
            log({"status": "ok", "cmd": "move"})

        elif cmd \== "stop":  
            cli.drive\_wheels(0, 0\)  
            log({"status": "ok", "cmd": "stop"})

        else:  
            log({"status": "error", "msg": "unknown command"})

except Exception as e:  
    log({"status": "fatal", "error": str(e)})

finally:  
    cli.disconnect()  
    cli.stop()

---

## **8\. Arquivo: src/main/main.js**

### **Função**

* Orquestrar a aplicação Electron  
* Subir o processo Python do Cozmo  
* Manter o processo vivo  
* Preparar o caminho para IPC com Blockly

### **Dependências já existentes**

require("dotenv").config();  
const fs \= require("fs/promises");  
const { spawn } \= require("child\_process");  
const path \= require("path");

### **Variável global criada**

let cozmoProcess \= null;

### **Função criada: startCozmo()**

function startCozmo() {  
  const pythonPath \= path.join(  
    \_\_dirname,  
    "../../venv\_cozmo/bin/python"  
  );

  const scriptPath \= path.join(  
    \_\_dirname,  
    "../../python/cozmo\_server.py"  
  );

  cozmoProcess \= spawn(  
    pythonPath,  
    \[scriptPath\],  
    { stdio: \["pipe", "pipe", "pipe"\] }  
  );

  cozmoProcess.stdout.on("data", (data) \=\> {  
    console.log("COZMO:", data.toString().trim());  
  });

  cozmoProcess.stderr.on("data", (data) \=\> {  
    console.error("COZMO ERR:", data.toString());  
  });  
}

### **Integração no ciclo do Electron**

app.whenReady().then(() \=\> {  
  startCozmo();  
  createWindow();  
});

### **Resultado esperado no terminal**

COZMO: {"status": "ready"}

---

## **9\. Comunicação estabelecida**

* Tipo: STDIN / STDOUT  
* Formato: JSON  
* Estado: persistente  
* Latência: mínima

Exemplo de comando:

{ "cmd": "move", "speed": 40, "duration": 1 }

---

## **10\. Entendimento correto do Cozmo (importante)**

* O Cozmo **atua como Access Point Wi‑Fi**  
* O notebook conecta diretamente à rede do robô  
* O robô é o servidor  
* O protocolo é binário e nativo  
* Não há WebSocket, HTTP ou REST

O módulo Wi‑Fi interno do Cozmo é baseado em **ESP8266**, conforme documentado no pycozmo, mas o firmware é fechado.

---

## **11\. Direção futura (não implementada ainda)**

* Exposição de IPC para o renderer  
* Criação de blocos Blockly  
* Tradução Blockly → JSON  
* Documentação pedagógica do protocolo  
* Aplicação do mesmo modelo ao **ZoyConnect**, com transparência de rede

---

## **12\. Princípios que devem ser mantidos**

* Um robô \= um ambiente isolado  
* Blockly gera intenção, não código embarcado  
* Electron é o único orquestrador  
* Python atua como middleware  
* Rede é explícita e compreensível

---

## **13\. Estado atual do projeto**

✔ Infraestrutura concluída  
✔ Comunicação validada  
✔ Arquitetura definida  
⏸ Desenvolvimento pausado conscientemente

---

Fim do documento.

