/*************************************************************************
 * File Name           : zoy_steam_firmware.ino
 * Author              : Oliveira, Majela
 *                     : Lourenço, Moises
 *                     : Correia, Felipe
 * Updated             : Correia, Felipe
 * Version             : v0.9.1 
 * Date                : 18/12/2025
 * Description         : Firmware desenvolvido exclusivamente para o robô educacional Zoy STEAM
 * MODIFICADO          : Otimização com bibliotecas de Servo.h e Ultrasonic
 * License             : Licença Pública Geral Menor GNU(LGPL)
 * Copyright (C) 2025 Zoy Educa. All right reserved.
 * http://www.zoy.com.br/
 **************************************************************************/
#include <Arduino.h>
#include <Wire.h> // I2C além dos pinos 0 e 1
#include <SoftwareSerial.h>
#include <Servo.h>
#include <Ultrasonic.h>

// ==== CONFIGURAÇÕES GERAIS ====
const int LED_LEFT = 15;
const int LED_RIGHT = 16;
const int LED_13 = 13;

const int MOTOR_E1 = 3;
const int MOTOR_E2 = 5;
const int MOTOR_D1 = 6;
const int MOTOR_D2 = 11;

const int ZOY_MAX_SERVOS = 6;   // Quantidade máxima de servos simultâneos

// ==== ESTRUTURAS DE CONTROLE ====

// Controle assíncrono do LED_LEFT
bool piscaLeftAtivo = false;
int piscaLeftRestantes = 0;
unsigned long tempoAnteriorLeft = 0;
bool estadoLedLeft = LOW;
const unsigned long intervaloLedLeft = 300;

// Controle assíncrono do LED_RIGHT
bool piscaRightAtivo = false;
int piscaRightRestantes = 0;
unsigned long tempoAnteriorRight = 0;
bool estadoLedRight = LOW;
const unsigned long intervaloLedRight = 300;

// Controle assíncrono do LED_13
bool pisca13Ativo = false;
int pisca13Restantes = 0;
unsigned long tempoAnterior13 = 0;
bool estadoLed13 = LOW;
const unsigned long intervaloLed13 = 300;

// === CONTROLE ASSÍNCRONO DE SOM ===
bool somAtivo = false;
unsigned long tempoFimSom = 0;
int pinoSomAtual = -1;

// Estrutura para gerenciar Servos (360 e Angulares)
struct ZoyServo {
 Servo objetoServo;
 int pino = -1;    // -1 indica slot livre
 bool ativo = false;
};

ZoyServo listaServos[ZOY_MAX_SERVOS]; // Array para gerenciar múltiplos servos

// Variáveis para Movimento Progressivo da Garra (A e C)
// Nota: Usaremos um "Slot Reservado" ou lógica dedicada para a animação da garra
int garraPino = -1;
int garraAnguloAtual = -1;
int garraAnguloAlvo = -1;
unsigned long garraUltimoMovimento = 0;
const int garraTempoPasso = 20; // Velocidade da animação (ms)
const int garraPassoGraus = 5; // Suavidade

// Variáveis Globais de Fluxo
String buffer = "";
bool pausaAtiva = false; // TRUE se AGUARDA/PAUSA foi ativado
unsigned long tempoFimPausa = 0;

// Protótipos, devem ser chamados antes de ser definido
void processarComando(String cmd);
ZoyServo* obterServo(int pino);
void desanexarServo(int pino); // Adicionei para consistência

// === LEITURA ULTRASSOM (Ultrasonic) ===
float ler_ultrassom(int trigPin, int echoPin) {
 // Instancia localmente para permitir pinos dinâmicos
 Ultrasonic sonar(trigPin, echoPin);

 // read() retorna a distância em centímetros (cm). Pode retornar 0 se muito perto ou erro.
 long distancia_cm = sonar.read(CM); // Ultrasonic retorna long no .read()

 // Se a distância for 0, geralmente indica fora de alcance ou erro.
 // Poderíamos tratar como 0 ou um valor máximo, como 400cm, dependendo da necessidade.
 // Aqui, retornamos a leitura como float
 return (float)distancia_cm;
}

void setup()
{
  Serial.begin(9600);
  // Inicialização de pinos
  pinMode(LED_LEFT, OUTPUT);
  pinMode(LED_RIGHT, OUTPUT);
  pinMode(MOTOR_E1, OUTPUT);
  pinMode(MOTOR_E2, OUTPUT);
  pinMode(MOTOR_D1, OUTPUT);
  pinMode(MOTOR_D2, OUTPUT);
  pinMode(LED_13, OUTPUT);

  // Sinal para reconhecer firmware instalado
  Serial.println("ZOY_FIRMWARE_V0.9.1"); // Versão atualizada
  // Sinal com 3 piscadas rápidas e 2 piscadas lentas e movimentos leves com motores
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_13, HIGH);
    digitalWrite(LED_LEFT, HIGH);
    digitalWrite(LED_RIGHT, HIGH);
    // Remove dancinha dos motores para Zoy STEAM - Habilitar apenas em enventos especiais
    // digitalWrite(MOTOR_E1, LOW);
    // analogWrite(MOTOR_E2, 100);
    // analogWrite(MOTOR_D1, 100);
    // digitalWrite(MOTOR_D2, LOW);
    delay(100);
    
    digitalWrite(LED_13, LOW);
    digitalWrite(LED_LEFT, LOW);
    digitalWrite(LED_RIGHT, LOW);
    // analogWrite(MOTOR_E1, 100);
    // digitalWrite(MOTOR_E2, LOW);
    // digitalWrite(MOTOR_D1, LOW);
    // analogWrite(MOTOR_D2, 100);
    delay(100);
  }
  // Garante Motores estejam desligados no início
  digitalWrite(MOTOR_E1, LOW);
  digitalWrite(MOTOR_E2, LOW);
  digitalWrite(MOTOR_D1, LOW);
  digitalWrite(MOTOR_D2, LOW);
  
  for (int i = 0; i < 2; i++) {
    digitalWrite(LED_13, HIGH);
    digitalWrite(LED_LEFT, HIGH);
    digitalWrite(LED_RIGHT, HIGH);
    delay(500);
    digitalWrite(LED_13, LOW);
    digitalWrite(LED_LEFT, LOW);
    digitalWrite(LED_RIGHT, LOW);
    delay(500);
  }

  // Garante que os LEDs estejam desligados no início
  digitalWrite(LED_LEFT, LOW);
  digitalWrite(LED_RIGHT, LOW);
  digitalWrite(LED_13, LOW);
}

void loop()
{
  // 1. === GERENCIADOR DE PAUSA GLOBAL (AGUARDA/PAUSA) ===
  if (pausaAtiva) {
    if (millis() >= tempoFimPausa) {
      pausaAtiva = false; // Pausa concluída
      Serial.println("PAUSA_FIM"); // AVISO CRÍTICO PARA O NODE.JS (ACK de tempo)
    }
  }

  // 1.1 === GERENCIADOR DE SOM ===
  if (somAtivo && millis() >= tempoFimSom) {
    noTone(pinoSomAtual);
    somAtivo = false;
    Serial.println("SOM_FIM"); // ACK para Node.js / Blockly
  }
  
  // 2. === GERENCIADOR DE MOVIMENTO PROGRESSIVO DA GARRA (A/C) ===
  if (garraPino != -1 && garraAnguloAlvo != -1 && garraAnguloAtual != garraAnguloAlvo) {
    if (millis() - garraUltimoMovimento >= garraTempoPasso) {
     garraUltimoMovimento = millis();
  
     // Cálculo do próximo passo
     if (garraAnguloAtual < garraAnguloAlvo) {
      garraAnguloAtual += garraPassoGraus;
      if (garraAnguloAtual > garraAnguloAlvo) garraAnguloAtual = garraAnguloAlvo;
     } else {
      garraAnguloAtual -= garraPassoGraus;
      if (garraAnguloAtual < garraAnguloAlvo) garraAnguloAtual = garraAnguloAlvo;
     }
  
     // Move o servo físico
     ZoyServo* s = obterServo(garraPino);
     if (s) {
      s->objetoServo.write(garraAnguloAtual);
     }
  
     // Verifica fim do movimento
     if (garraAnguloAtual == garraAnguloAlvo) {
      garraAnguloAlvo = -1; // Movimento concluído (mantém posição)
      Serial.println("SERVO_FIM"); // Aviso para o Node.js
     }
    }
  }

  
  // Lógica de leitura serial para comandos
  while (Serial.available())
  {
    char c = Serial.read();
    if (c == '<') // Início de um novo comando
    {
      buffer = "";
      buffer += c;
    }
    else if (buffer.length() > 0) // Continua lendo o comando
    {
      buffer += c;
      if (c == '>') // Fim do comando
      {
        processarComando(buffer); // Processa o comando completo
        buffer = "";              // Limpa o buffer para o próximo comando
      }
    }
  }

  // --- Controle Assíncrono dos LEDs (permanecem no loop, pois são baseados em millis()) ---
  // Controle assíncrono do LED_13
  if (pisca13Ativo && pisca13Restantes > 0)
  {
    unsigned long agora = millis();
    if (agora - tempoAnterior13 >= intervaloLed13)
    {
      tempoAnterior13 = agora;
      estadoLed13 = !estadoLed13;
      digitalWrite(LED_13, estadoLed13 ? HIGH : LOW);
      if (!estadoLed13) // Decrementa a contagem quando o LED apaga
      {
        pisca13Restantes--;
        if (pisca13Restantes == 0)
        {
          pisca13Ativo = false;
          Serial.println("PAUSA_FIM");
        }
      }
    }
  }
  // Pisca LED_LEFT com millis()
  if (piscaLeftAtivo && millis() - tempoAnteriorLeft >= intervaloLedLeft)
  {
    tempoAnteriorLeft = millis();
    estadoLedLeft = !estadoLedLeft;
    digitalWrite(LED_LEFT, estadoLedLeft);
    if (!estadoLedLeft)
    {
      piscaLeftRestantes--;
      if (piscaLeftRestantes <= 0)
      {
        piscaLeftAtivo = false;
        digitalWrite(LED_LEFT, LOW);
        Serial.println("PAUSA_FIM");
      }
    }
  }

  
  // Pisca LED_RIGHT com millis()
  if (piscaRightAtivo && millis() - tempoAnteriorRight >= intervaloLedRight)
  {
    tempoAnteriorRight = millis();
    estadoLedRight = !estadoLedRight;
    digitalWrite(LED_RIGHT, estadoLedRight);
    if (!estadoLedRight)
    {
      piscaRightRestantes--;
      if (piscaRightRestantes <= 0)
      {
        piscaRightAtivo = false;
        digitalWrite(LED_RIGHT, LOW);
        Serial.println("PAUSA_FIM");
      }
    }
  }
}

// === FUNÇÕES AUXILIARES DE SERVO ===
// Busca um slot de servo já anexado ao pino ou aloca um novo
ZoyServo* obterServo(int pino) {
 // 1. Verifica se já existe esse pino configurado
 for (int i = 0; i < ZOY_MAX_SERVOS; i++) {
  if (listaServos[i].ativo && listaServos[i].pino == pino) {
   return &listaServos[i];
  }
 }
 // 2. Se não existe, pega o primeiro slot livre
 for (int i = 0; i < ZOY_MAX_SERVOS; i++) {
  if (!listaServos[i].ativo) {
   listaServos[i].pino = pino;
   listaServos[i].ativo = true;
   listaServos[i].objetoServo.attach(pino);
   return &listaServos[i];
  }
 }
 return NULL; // Sem slots disponíveis (limite atingido)
}

// Remove o servo da lista (opcional, para liberar slots)
void desanexarServo(int pino) {
 for (int i = 0; i < ZOY_MAX_SERVOS; i++) {
  if (listaServos[i].ativo && listaServos[i].pino == pino) {
   listaServos[i].objetoServo.detach();
   listaServos[i].ativo = false;
   listaServos[i].pino = -1;
  }
 }
}

// === Função para mapear pino analógico ===
int lerAnalogico(String pino)
{
 pino.trim();    // remove espaços extras
 pino.toUpperCase(); // // garante que "a0" funcione como "A0"

 // Verifica se começa com 'A' e tem um número válido depois
 if (!pino.startsWith("A"))
  return -1;

 int num = pino.substring(1).toInt(); // pega o número após 'A'

 // Garante apenas os pinos alnalogicos do uno: [A0, A1, A2, A3, A4, A5, A6 e A7]
 if (num < 0 || num > 7)
  return -1;

 return analogRead(A0 + num);
}

// === Função para processar comandos recebidos via Serial ===
void processarComando(String cmd)
{
  cmd.remove(0, 1);           // remove '<' do início
  cmd.remove(cmd.length() - 1); // remove '>' do final

  int sepCmdArg = cmd.indexOf(':');
  String comando_temp;
  String argumentos_temp;

  if (sepCmdArg == -1) // Se não houver ':'
  {
    comando_temp = cmd;
    argumentos_temp = "";
  }
  else
  {
    comando_temp = cmd.substring(0, sepCmdArg);
    argumentos_temp = cmd.substring(sepCmdArg + 1);
  }
  comando_temp.trim();
  argumentos_temp.trim();
  
  // ===  SERIAL_PRINT  - <SERIAL_PRINT:"Mensagem"> ===
  if (comando_temp == "SERIAL_PRINT") {
    argumentos_temp.trim();

    // Remove aspas se existirem
    if (argumentos_temp.startsWith("\"") && argumentos_temp.endsWith("\"")) {
      argumentos_temp.remove(0, 1);
      argumentos_temp.remove(argumentos_temp.length() - 1);
    }

    // Imprime o texto puro recebido
    Serial.println(argumentos_temp);

    // Opcional: sinal para o Node.js de fim de execução
    // Serial.println("PAUSA_FIM");
    return;
  }

  // === SOM (PIN, NOTA, TEMPO) ===
  if (comando_temp == "SOM") {
  
    int sep1 = argumentos_temp.indexOf(',');
    int sep2 = argumentos_temp.indexOf(',', sep1 + 1);
  
    // Verifica se existem dois separadores
    if (sep1 == -1 || sep2 == -1) {
      Serial.println("ERRO:ARG_INVALIDO_SOM");
      return;
    }
  
    String pinoStr  = argumentos_temp.substring(0, sep1);
    String notaStr  = argumentos_temp.substring(sep1 + 1, sep2);
    String tempoStr = argumentos_temp.substring(sep2 + 1);
  
    pinoStr.trim();
    notaStr.trim();
    tempoStr.trim();
  
    // === Converte pino ===
    int pino = -1;
    if (pinoStr.startsWith("D")) {
      pino = pinoStr.substring(1).toInt();
    } else {
      pino = pinoStr.toInt();
    }
  
    // === Converte nota e tempo ===
    unsigned int notaHz   = notaStr.toInt();   // frequência
    unsigned int tempoMs  = tempoStr.toInt();  // duração
  
    // === Validação ===
    if (pino < 0 || notaHz == 0 || tempoMs == 0) {
      Serial.println("ERRO:PARAMETROS_SOM_INVALIDOS");
      return;
    }
  
    pinMode(pino, OUTPUT);
    tone(pino, notaHz);

    pinoSomAtual = pino;
    somAtivo = true;
    tempoFimSom = millis() + tempoMs;
    
    Serial.println("OK_SOM_INICIO");
    return;
  }

  
  // === PAUSA (PIN + TEMPO) - NÃO-BLOQUEANTE ===
  if (comando_temp == "PAUSA") {
  
    int sep_arg = argumentos_temp.indexOf(',');
    if (sep_arg == -1) {
      Serial.println("ERRO:ARG_INVALIDO_PAUSA");
      return;
    }
  
    String pinoStr = argumentos_temp.substring(0, sep_arg);
    String tempoStr = argumentos_temp.substring(sep_arg + 1);
  
    pinoStr.trim();
    tempoStr.trim();
  
    // Converte pino (ex: "D3" -> 3, "12" -> 12)
    int pino = -1;
    if (pinoStr.startsWith("D")) {
      pino = pinoStr.substring(1).toInt();
    } else {
      pino = pinoStr.toInt();
    }
  
    // Converte tempo
    unsigned long valorTempo = tempoStr.toInt();
  
    // Validação básica
    if (pino < 0 || valorTempo == 0) {
      Serial.println("ERRO:PARAMETROS_PAUSA_INVALIDOS");
      return;
    }
  
    // Para qualquer som no pino informado
    noTone(pino);
  
    pausaAtiva = true;
    tempoFimPausa = millis() + valorTempo;
  
    Serial.println("OK_PAUSA_INICIO");
    return;
  }


  // === DIGITAL_WRITE (pinos digitais) ===
  if (comando_temp == "DIGITAL_WRITE") {
    int sep_arg = argumentos_temp.indexOf(',');
    if (sep_arg == -1)
    {
      Serial.println("ERRO:ARG_INVALIDO_DIGITAL_WRITE");
      return;
    }
    String pinoStr = argumentos_temp.substring(0, sep_arg);
    String nivelStr = argumentos_temp.substring(sep_arg + 1);

    pinoStr.trim();
    nivelStr.trim();

    // Converte o pino para int (ex: "D3" -> 3; "13" -> 13)
    int pino = -1;
    if (pinoStr.startsWith("D"))
    {
      pino = pinoStr.substring(1).toInt();
    }
    else
    {
      pino = pinoStr.toInt();
    }

    int nivel = -1; // HIGH=1, LOW=0
    if (nivelStr == "HIGH")
    {
      nivel = HIGH;
    }
    else if (nivelStr == "LOW")
    {
      nivel = LOW;
    }

    // Verifica se o pino e o nível são válidos
    // (Para pinos digitais, números inteiros geralmente entre 0 e 13 para Arduino UNO/Nano)
    if (pino != -1 && (nivel == HIGH || nivel == LOW))
    {
      pinMode(pino, OUTPUT); // Garante que o pino está configurado como OUTPUT
      digitalWrite(pino, nivel);
      Serial.println("OK");
      return;
    }
    else
    {
      Serial.println("ERRO:PARAMETROS_DIGITAL_WRITE_INVALIDOS");
      return;
    }
  }

  // === PWM_WRITE (pinos PWM) ===
  if (comando_temp == "PWM_WRITE") {
   int sep_arg = argumentos_temp.indexOf(',');
    if (sep_arg == -1)
    {
      Serial.println("ERRO:ARG_INVALIDO_PWM_WRITE");
      return;
    }
    String pinoStr = argumentos_temp.substring(0, sep_arg);
    String valorStr = argumentos_temp.substring(sep_arg + 1);

    pinoStr.trim();
    valorStr.trim();

    // Converte o pino para int (ex: "D3" -> 3; "9" -> 9)
    int pino = -1;
    if (pinoStr.startsWith("D"))
    {
      pino = pinoStr.substring(1).toInt();
    }
    else
    {
      pino = pinoStr.toInt();
    }

    int valor = valorStr.toInt();

    // Verifica se o valor PWM é válido (0-255)
    // (Pinos PWM geralmente 3, 5, 6, 9, 10, 11 no Arduino UNO/Nano)
    if (pino != -1 && valor >= 0 && valor <= 255)
    {
      pinMode(pino, OUTPUT); // Garante que o pino está configurado como OUTPUT
      analogWrite(pino, valor);
      Serial.println("OK");
    }
    else
    {
      Serial.println("ERRO:PARAMETROS_PWM_WRITE_INVALIDOS");
    }
    return;
  }

   // === LEITURA ULTRASSOM OTIMIZADA COM BIBLIOTECA ===
   if (comando_temp == "ULTRASSOM") {
    int sep = argumentos_temp.indexOf(',');
    if (sep != -1) {
     int trig = argumentos_temp.substring(0, sep).toInt();
     int echo = argumentos_temp.substring(sep + 1).toInt();
    
     float dist = ler_ultrassom(trig, echo);
     Serial.print("DISTANCIA:");
     Serial.println(dist, 2);
    } else {
     Serial.println("ERRO:ARG_ULTRASSOM");
    }
    return;
   }

  // ===  DIGITAL_READ (ler pino digital) ===
  // Comando esperado do Python: <DIGITAL_READ:PINO,MODO>
  // Ex: <DIGITAL_READ:2,INPUT> ou <DIGITAL_READ:13,INPUT_PULLUP>
  if (comando_temp == "DIGITAL_READ")
  {
    int sep_arg = argumentos_temp.indexOf(',');
    if (sep_arg == -1)
    {
      Serial.println("ERRO:ARG_INVALIDO_DIGITAL_READ");
      return;
    }
    String pinoStr = argumentos_temp.substring(0, sep_arg);
    String modoStr = argumentos_temp.substring(sep_arg + 1);

    pinoStr.trim();
    modoStr.trim();

    int pino = pinoStr.toInt(); // Pega o número do pino diretamente

    int modo = -1;
    if (modoStr == "INPUT")
    {
      modo = INPUT;
    }
    else if (modoStr == "INPUT_PULLUP")
    {
      modo = INPUT_PULLUP;
    }
    else
    {
      Serial.println("ERRO:MODO_INVALIDO");
      return;
    }

    // Valida o pino (geralmente pinos digitais de 0 a 19 para Nano/Uno, incluindo os analógicos como digitais)
    // Adapte este range conforme seu microcontrolador específico e pinos utilizados.
    if (pino >= 0 && pino <= 19 && modo != -1)
    {
      pinMode(pino, modo); // Configura o modo do pino
      int valor = digitalRead(pino);
      Serial.print("DIGITAL_VALOR:");
      Serial.println(valor); // Retorna 0 para LOW e 1 para HIGH
    }
    else
    {
      Serial.println("ERRO:PARAMETROS_DIGITAL_READ_INVALIDOS");
    }
    return; // Sai da função após processar o comando
  }

  // === LER SENSOR ANALÓGICO (IR, LDR, Potenciômetro, etc.) ===
  if (comando_temp == "ANALOG_READ")  {
  
    int valor = lerAnalogico(argumentos_temp);
    if (valor != -1)
    {                                // -1 significa pino inválido
      Serial.print("ANALOG_VALOR:"); // Resposta formatada para o Python
      Serial.println(valor);
      // REMOVIDO: Serial.println("OK"); para evitar linhas extras
    }
    else
    {
      Serial.println("ERRO:PINO_ANALOGICO_INVALIDO"); // Mensagem de erro mais específica
    }
    return; // Sai da função após processar o comando
  }
  
  // === LED_TREZE ===
  if (comando_temp == "LED_TREZE") {
  
    if (argumentos_temp == "HIGH")
    {
      digitalWrite(LED_13, HIGH);
      Serial.println("OK");
    }
    else if (argumentos_temp == "LOW")
    {
      digitalWrite(LED_13, LOW);
      Serial.println("OK");
    }
    else
    {
      int vezes = argumentos_temp.toInt();
      if (vezes > 0)
      {
        pisca13Restantes = vezes;
        pisca13Ativo = true;
        tempoAnterior13 = millis();
        estadoLed13 = LOW; // Começa apagado para o primeiro pisca
        digitalWrite(LED_13, estadoLed13);
        Serial.println("OK");
      }
      else
      {
        Serial.println("ERRO:ARG_INVALIDO");
      }
    }
    return;
  }
  
  // === LED LEFT ===
  if (comando_temp == "LED_LEFT")  {
    if (argumentos_temp == "HIGH")
    {
      digitalWrite(LED_LEFT, HIGH);
      Serial.println("OK");
    }
    else if (argumentos_temp == "LOW")
    {
      digitalWrite(LED_LEFT, LOW);
      Serial.println("OK");
    }
    else
    {
      Serial.println("ERRO:ARG_INVALIDO");
    }
    return;
  }
  
  // === LED RIGHT ===
  if (comando_temp == "LED_RIGHT")  {
    if (argumentos_temp == "HIGH")
    {
      digitalWrite(LED_RIGHT, HIGH);
      Serial.println("OK");
    }
    else if (argumentos_temp == "LOW")
    {
      digitalWrite(LED_RIGHT, LOW);
      Serial.println("OK");
    }
    else
    {
      Serial.println("ERRO:ARG_INVALIDO");
    }
    return;
  }
  
  // === ACIONA OS PINOS DO MOTOR (D3, D5, D6, D11) ===
  if (comando_temp == "D3" || comando_temp == "D5" || comando_temp == "D6" || comando_temp == "D11")  {
    int pinoAlvo = comando_temp.substring(1).toInt(); // Extrai o número do pino (ex: de "D3" pega 3)
    if (argumentos_temp == "HIGH")
    {
      digitalWrite(pinoAlvo, HIGH);
      Serial.println("OK");
    }
    else if (argumentos_temp == "LOW")
    {
      digitalWrite(pinoAlvo, LOW);
      Serial.println("OK");
    }
    else
    {
      Serial.println("ERRO:ARG_INVALIDO_PINO");
    }
    return;
  }
  
  // === MOTOR ESQUERDO_FRENTE ===
  if (comando_temp == "MOTOR_ESQUERDO_FRENTE")  {
    int velA = argumentos_temp.toInt();
    analogWrite(MOTOR_E1, velA);
    analogWrite(MOTOR_E2, 0);
    Serial.println("OK");
    return;
  }
  
  // === MOTOR ESQUERDO_TRAS ===
  if (comando_temp == "MOTOR_ESQUERDO_TRAS")  {
    int velA = argumentos_temp.toInt();
    analogWrite(MOTOR_E1, 0);
    analogWrite(MOTOR_E2, velA);
    Serial.println("OK");
    return;
  }
  
  // === MOTOR DIREITO_FRENTE ===
  if (comando_temp == "MOTOR_DIREITO_FRENTE")  {
     int velA = argumentos_temp.toInt();
    analogWrite(MOTOR_D1, velA);
    analogWrite(MOTOR_D2, 0);
    Serial.println("OK");
    return;
  }
  
  // === MOTOR DIREITO_TRAS ===
  if (comando_temp == "MOTOR_DIREITO_TRAS")  {
    int velA = argumentos_temp.toInt();
    analogWrite(MOTOR_D1, 0);
    analogWrite(MOTOR_D2, velA);
    Serial.println("OK");
    return;
  }
  
  // === MOTOR FRENTE ===
  if (comando_temp == "MOTOR_FRENTE")  {
   int sep = argumentos_temp.indexOf(',');
    if (sep == -1)
    {
      Serial.println("ERRO:ARGUMENTOS");
      return;
    }
    int velA = argumentos_temp.substring(0, sep).toInt();
    int velB = argumentos_temp.substring(sep + 1).toInt();
    analogWrite(MOTOR_E1, velA);
    analogWrite(MOTOR_E2, 0);
    analogWrite(MOTOR_D1, velB);
    analogWrite(MOTOR_D2, 0);
    Serial.println("OK");
    return;
  }
  
  // === MOTOR TRAS ===
  if (comando_temp == "MOTOR_TRAS")  {
    int sep = argumentos_temp.indexOf(',');
    if (sep == -1)
    {
      Serial.println("ERRO:ARGUMENTOS");
      return;
    }
    int velA = argumentos_temp.substring(0, sep).toInt();
    int velB = argumentos_temp.substring(sep + 1).toInt();
    analogWrite(MOTOR_E1, 0);
    analogWrite(MOTOR_E2, velA);
    analogWrite(MOTOR_D1, 0);
    analogWrite(MOTOR_D2, velB);
    Serial.println("OK");
    return;
  }
  
  // === PARAR TODOS OS MOTORES ===
  if (comando_temp == "PARAR")  {
    analogWrite(MOTOR_E1, 0);
    analogWrite(MOTOR_E2, 0);
    analogWrite(MOTOR_D1, 0);
    analogWrite(MOTOR_D2, 0);
    Serial.println("OK");
    return;
  }
  // === PARAR MOTOR Esquerdo ou Direito ===
  if (comando_temp == "PARAR_ESQUERDO")  {
    analogWrite(MOTOR_E1, 0);
    analogWrite(MOTOR_E2, 0);
    Serial.println("OK");
    return;
  }

  if (comando_temp == "PARAR_DIREITO")  {
    analogWrite(MOTOR_D1, 0);
    analogWrite(MOTOR_D2, 0);
    Serial.println("OK");
    return;
  }
  
  // === AGUARDA:N segundos - AGORA NÃO-BLOQUEANTE ===
  if (comando_temp == "AGUARDA")  {
    argumentos_temp.trim();
    float segundos = argumentos_temp.toFloat();  // Lê corretamente 1.5
    
    pausaAtiva = true;
    tempoFimPausa = millis() + (unsigned long)(segundos * 1000.0f); // converte para ms com fração
    
    Serial.println("OK_AGUARDA_INICIO");
    return;
  }

  // === AGUARDA:N MILISEGUNDOS - AGORA NÃO-BLOQUEANTE ===
  if (comando_temp == "AGUARDA_MS")  {
      argumentos_temp.trim();
      unsigned long milissegundos = (unsigned long)argumentos_temp.toInt();  // Lê corretamente o valor em milissegundos
      
      pausaAtiva = true;
      tempoFimPausa = millis() + milissegundos; // usa o valor em milissegundos diretamente
      
      Serial.println("OK_AGUARDA_MS_INICIO");
      return;
  }

  // === LED_PISCA_LEFT ===
  if (comando_temp == "LED_PISCA_LEFT") {
    int vezes = argumentos_temp.toInt();
    if (vezes > 0)
    {
      piscaLeftAtivo = true;
      piscaLeftRestantes = vezes;
      tempoAnteriorLeft = millis();
      estadoLedLeft = LOW; // Inicia apagado para piscar
      digitalWrite(LED_LEFT, estadoLedLeft);
      Serial.println("OK");
    }
    else
    {
      Serial.println("ERRO:ARG_INVALIDO");
    }
    return;
  }
  
  // === LED_PISCA_RIGHT ===
  if (comando_temp == "LED_PISCA_RIGHT")  {
    int vezes = argumentos_temp.toInt();
    if (vezes > 0)
    {
      piscaRightAtivo = true;
      piscaRightRestantes = vezes;
      tempoAnteriorRight = millis();
      estadoLedRight = LOW; // Inicia apagado para piscar
      digitalWrite(LED_RIGHT, estadoLedRight);
      Serial.println("OK");
    }
    else
    {
      Serial.println("ERRO:ARG_INVALIDO");
    }
    return;
  }

  // === COMANDOS DE SERVO MOTOR PROGRESSIVO (A/C) ===
  // Atualizado para usar lógica Servo.h sem travar
  if (comando_temp == "A") { // ABRIR
    int pino = argumentos_temp.toInt();
  
    // Configura o servo físico
    ZoyServo* s = obterServo(pino);
    if (!s) { Serial.println("ERRO:ZOY_MAX_SERVOS_LIMIT"); return; }
    
    // Define a animação global
    garraPino = pino;
    garraAnguloAtual = 170; // Começa fechada
    garraAnguloAlvo = 10;  // Vai para aberto
    
    // Seta posição inicial imediata para garantir
    s->objetoServo.write(garraAnguloAtual);
    
    garraUltimoMovimento = millis();
    Serial.println("OK_ABRIR_GARRA_INICIO");
    return;
  }
  
  if (comando_temp == "C") { // FECHAR
    int pino = argumentos_temp.toInt();
  
    ZoyServo* s = obterServo(pino);
    if (!s) { Serial.println("ERRO:ZOY_MAX_SERVOS_LIMIT"); return; }
    
    garraPino = pino;
    garraAnguloAtual = 10;  // Começa aberta
    garraAnguloAlvo = 170; // Vai para fechado
    
    s->objetoServo.write(garraAnguloAtual);
    
    garraUltimoMovimento = millis();
    Serial.println("OK_FECHAR_GARRA_INICIO");
    return;
  }
  
  // === COMANDOS SERVO 360 CONTINUO (HO, AH, P) ===
  // Agora suporta múltiplos servos (ex: roda esquerda D2, roda direita D3)
  
  if (comando_temp == "HO") { // Horário
    int sep = argumentos_temp.indexOf(',');
    int pino = argumentos_temp.substring(0, sep).toInt();
    int vel = argumentos_temp.substring(sep + 1).toInt(); // Espera valor em us (ex: 1300)
    
    ZoyServo* s = obterServo(pino);
    if (s) {
     s->objetoServo.writeMicroseconds(vel); // Controle preciso de pulso
     Serial.println("OK_SERVO_HO");
    }
    return;
  }
  
  if (comando_temp == "AH") { // Anti-Horário
    int sep = argumentos_temp.indexOf(',');
    int pino = argumentos_temp.substring(0, sep).toInt();
    int vel = argumentos_temp.substring(sep + 1).toInt();
    
    ZoyServo* s = obterServo(pino);
    if (s) {
     s->objetoServo.writeMicroseconds(vel);
     Serial.println("OK_SERVO_AH");
    }
    return;
  }
  
  if (comando_temp == "P") { // Parar Servo Específico
    int pino = argumentos_temp.toInt();
    ZoyServo* s = obterServo(pino);
    if (s) {
     s->objetoServo.writeMicroseconds(1500); // Sinal neutro (parada)
     // Opcional: Se quiser liberar o motor totalmente: desanexarServo(pino);
     Serial.println("OK_SERVO_PARADO");
    }
    return;
  }


  // === Comando ZOY de firmware ===
  if (comando_temp == "ZOY" && argumentos_temp == "ZOY") {
    Serial.println("FIRMWARE:ZOY_STEAM:v0.9.1"); // Versão atualizada
    return;
  }
  
  // Se o comando não foi reconhecido
  Serial.println("ERRO:COMANDO_INVALIDO");
}