/*************************************************************************
Modelo enxuto(esqueleto) para criar novos blocos
nesse modelo temos a função led pisca e digital write para referência
**************************************************************************/
#include <Arduino.h>
#include <Wire.h> // I2C além dos pinos 0 e 1
#include <SoftwareSerial.h>



//const int EXEMPLO = pino; // Exemplo de declaração de pino(MOTORES,LEDS,BUZZER ...)
/*************************************************************************
Se necessario Crie a declaração do seu novo bloco aqui
**************************************************************************/




const int LED_13 = 13;





// Controle assíncrono
/*************************************************************************
 se seu bloco precisar de um controle assicrono declare aqui no inicio do código,
 controle assincrono é comum para funções que utilizam status, eventos.
 Geralmente verificado dentro do loop().
**************************************************************************/
/*************************************************************************
Se necessario Crie o crontrole assicrono do seu novo bloco aqui
**************************************************************************/




// Controle assíncrono do LED_13
bool pisca13Ativo = false;
int pisca13Restantes = 0;
unsigned long tempoAnterior13 = 0;
bool estadoLed13 = LOW;
const unsigned long intervaloLed13 = 300;

// Variáveis globais para o buffer serial.
String buffer = "";

// Protótipo da função processarComando, pois é chamada antes de ser definida
void processarComando(String cmd);

void setup()
{
  Serial.begin(9600);
  // Inicialização de pinos
  pinMode(LED_13, OUTPUT);

  // Garante que os LEDs estejam desligados no início
  digitalWrite(LED_13, LOW);
}

void loop()
{
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
        buffer = ""; // Limpa o buffer para o próximo comando
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
        }
      }
    }
  }



  /*************************************************************************
  Se necessario Crie o controle assicrono do seu novo bloco aqui
  **************************************************************************/


  
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
  
  // === NOVO: DIGITAL_WRITE (pinos digitais) ===
  // Comando esperado do Python: <DIGITAL_WRITE:PINO,NIVEL> ex:<DIGITAL_WRITE: 3, HIGH>
  if (comando_temp == "DIGITAL_WRITE") {
      int sep_arg = argumentos_temp.indexOf(',');
      if (sep_arg == -1) {
          Serial.println("ERRO:ARG_INVALIDO_DIGITAL_WRITE");
          return;
      }
      String pinoStr = argumentos_temp.substring(0, sep_arg);
      String nivelStr = argumentos_temp.substring(sep_arg + 1);

      pinoStr.trim();
      nivelStr.trim();

      // Converte o pino para int (ex: "D3" -> 3; "13" -> 13)
      int pino = -1;
      if (pinoStr.startsWith("D")) {
          pino = pinoStr.substring(1).toInt();
      } else {
          pino = pinoStr.toInt();
      }

      int nivel = -1; // HIGH=1, LOW=0
      if (nivelStr == "HIGH") {
          nivel = HIGH;
      } else if (nivelStr == "LOW") {
          nivel = LOW;
      }

      // Verifica se o pino e o nível são válidos
      // (Para pinos digitais, números inteiros geralmente entre 0 e 13 para Arduino UNO/Nano)
      if (pino != -1 && (nivel == HIGH || nivel == LOW)) {
          pinMode(pino, OUTPUT); // Garante que o pino está configurado como OUTPUT
          digitalWrite(pino, nivel);
          Serial.println("OK");
      } else {
          Serial.println("ERRO:PARAMETROS_DIGITAL_WRITE_INVALIDOS");
      }
      return;
  }

  // === LED_TREZE ===
  // Comando esperado do Python: <LED_TREZE:VEZES> ex: <LED_TREZE:5>
  if (comando_temp == "LED_TREZE")
  {
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




  /*************************************************************************
  Crie a Função do seu novo bloco aqui
  essa função deve receber <COMANDO:ARGUMENTO>
  use os exemplos LED_TREZE e DIGITAL_WRITE de referência
  **************************************************************************/


  

  // Se o comando não foi reconhecido
  Serial.println("ERRO:COMANDO_INVALIDO");
}
