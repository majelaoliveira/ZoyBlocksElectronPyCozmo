# **Funções Cozmo**

## **Visão geral**

Cozmo é um sistema embarcado distribuído complexo com as seguintes partes principais:

* robô  
* cubos  
* plataforma de carregamento

O robô pode ser subdividido em:

* cabeça  
  * Controlador de comunicação Wi-Fi ([Espressif ESP8266](https://en.wikipedia.org/wiki/ESP8266))  
  * Controlador de processamento de imagem e tempo real (RTIP) ([NXP Kinetis K02](https://www.nxp.com/products/processors-and-microcontrollers/arm-microcontrollers/general-purpose-mcus/k-series-cortex-m4/k0x-entry-level/kinetis-k02-100-mhz-microcontrollers-mcus-with-optimized-features-based-on-arm-cortex-m4-core:K02_100))  
* corpo  
  * Controlador corporal ([Nórdico nRF51822](https://www.nordicsemi.com/Products/Low-power-short-range-wireless/nRF51822))

O controlador de comunicação Wi-Fi é responsável pelas seguintes funções:

* Comunicação Wi-Fi  
* atualizações de firmware over-the-air (OTA)  
* Armazenamento de RAM NV

Depois que o Cozmo é ligado, o controlador de comunicações permanece sempre ligado para manter a comunicação Wi-Fi.

Na conexão, o robô transmite seu número de série com o HardwareInfo mensagem e versão do firmware com o FirmwareSignature mensagem.

O controlador RTIP é responsável por:

* Decodificação de imagem de exibição OLED  
* decodificação de áudio do alto-falante  
* codificação de imagem da câmera  
* acelerômetros  
* giroscópio

O controlador do corpo é responsável por:

* motores de piso esquerdo e direito e codificadores codificadores  
* motor de cabeça e codificador  
* motor de elevação e codificador  
* LEDs de mochila  
* botão de mochila (somente em modelos mais novos)  
* Comunicação Bluetooth LE (para cubos e plataforma de carregamento)  
* LED IR  
* sensor de penhasco  
* carregamento de massa

O corpo é ligado com o Enable mensagem. O BodyInfo a mensagem comunica a versão do hardware do corpo, número de série e cor.

Os cubos usam o MCU nórdico nRF31512. Eles são comunicados via Bluetooth LE e fornecem acesso a:

* LEDs  
* Acelerômetros  
* Tensão da bateria

Algumas plataformas de carregamento (também conhecidas como “pads”) podem ser comunicadas via Bluetooth LE. Eles contêm 3 LEDs RGB que podem ser controlado, semelhante aos LEDs cúbicos.

As seções a seguir fornecem mais detalhes sobre o uso de cada função.

## **Wi-Fi**

O Wi-Fi é ativado automaticamente quando a placa principal é ligada. O robô opera no modo de ponto de acesso (AP).

cozmoclad define um SetBodyRadioMode mensagem que parece permitir alterar o canal Wi-Fi, mas não está clara como pode ser usado com o protocolo Cozmo.

WifiOff Shutdown

## **LEDs de mochila**

Os 5 LEDs da mochila podem ser controlados com 2 mensagens:

* lightStateCenter\- controla os LEDs RGB superior, médio e inferior.  
* LightStateSide\- controla os LEDs vermelhos esquerdo e direito.

Cada cor é definida por um valor de 5 bits para um total de 32.768 cores.

Ver examples/backpack\_lights.py por exemplo uso.

## **Botão de mochila**

Os modelos Cozmo v1.5 e mais recentes têm um botão de mochila.

Os eventos de pressionamento e liberação do botão são comunicados pelo ButtonPressed mensagem. Está imediatamente disponível em conexão e não requer Enable para ser usado.

O RobotState a mensagem tem um backpack\_touch\_sensor\_raw campo mas parece que seu valor não muda como resultado de pressionamentos de botões.

Ver examples/events.py por exemplo uso.

## **Rodas**

As velocidades do motor esquerdo e direito podem ser controladas diretamente usando o DriveWheels e TurnInPlaceAtSpeed mensagens. Os motores podem ser parados usando o StopAllMotors mensagem.

A velocidade real das rodas é medida com sensores magnéticos Hall. Os valores para cada roda podem ser leia através do lwheel\_speed\_mmps e rwheel\_speed\_mmps campos do RobotState mensagem.

Além disso, o e TurnInPlace a mensagem pode ser usada para girar em um ângulo específico.

## **Localização**

O robô mantém um quadro mundial internamente. Sua posição e orientação em relação a ele são transmitidas a cada 30 ms ou cerca de 33 vezes por segundo com o RobotState mensagem.

Se o robô não conseguir manter a posição e orientação corretas, por exemplo, porque é pego ou empurrado, ele comunicará isso com um RobotDelocalized mensagem.

A origem (0,0,0) do quadro mundial, bem como “ID da pose” podem ser definidas com o SetOrigin mensagem. Isso geralmente é feito na conexão inicial e ao receber um RobotDelocalized mensagem.

O carimbo de data/hora em RobotState as mensagens podem ser sincronizadas usando o SyncTime mensagem.

## **Rastreamento de caminho**

O robô pode percorrer caminhos compostos de linhas, arcos e curvas no lugar, descritos nas coordenadas do quadro mundial. O AppendPathSegLine, AppendPathSegArc, e AppendPathSegPointTurn mensagens podem ser usadas para construir caminhos.

O último caminho composto pode ser executado usando o ExecutePath mensagem. Um de seus argumentos pode ser usado para solicitar a recepção de PathFollowingEvent mensagem quando a travessia do caminho terminar.

O status arquivado do RobotState a mensagem tem um robot\_pathing bandeira que indica se o robô está atualmente atravessando um caminho. O curr\_path\_segment arquivado indica qual segmento está sendo percorrido.

O ClearPath a mensagem pode ser usada para destruir um caminho já composto. O TrimPath a mensagem pode ser usada para excluir segmentos de caminho do início ou do fim de um caminho composto.

Ver examples/path.py e examples/go\_to\_pose.py por exemplo uso.

## **Cabeça**

O motor principal pode ser controlado diretamente, usando o DriveHead e SetHeadAngle mensagens. SetHeadAngle é sempre seguido por um AcknowledgeAction mensagem antes que a cabeça comece a se mover.

O ângulo real da cabeça pode ser lido através do head\_angle\_rad campo do RobotState mensagem. O head\_in\_pos bandeira do status campo indica se a cabeça está em posição ou em movimento.

O motor pode ser parado usando o StopAllMotors mensagem.

O robô mede o ângulo da cabeça em relação à sua posição mais baixa possível. Esta medição é automática acionado na conexão. A cabeça pode ser forçada a um ângulo desconhecido, por exemplo, como resultado de uma queda. Nessas situações, o robô recalibra o motor principal automaticamente. A calibração também pode ser acionada mediante solicitação, usando o StartMotorCalibration mensagem. O MotorCalibration a mensagem indica se a calibração está em andamento.

Ver examples/extremes.py por exemplo uso.

## **Elevador**

O motor principal pode ser controlado diretamente, usando o DriveLift e SetLiftHeight mensagens. SetLiftHeight é sempre seguido por um AcknowledgeAction mensagem antes do elevador começar a se mover.

A altura real do elevador pode ser lida através do lift\_height\_mm campo do RobotState mensagem. O lift\_inpos bandeira do status campo indica se o elevador está em posição ou em movimento.

O motor pode ser parado usando o StopAllMotors mensagem.

O robô mede o ângulo do elevador em relação à sua posição mais baixa possível. É calibrado de forma semelhante ao motor de cabeça.

Ver examples/extremes.py por exemplo uso.

## **Tela OLED**

As imagens podem ser exibidas no display OLED 128x64 do robô usando o DisplayImage mensagem. Para reduzir o burn-in da tela, imagens consecutivas são intercaladas e apenas metade das linhas da exibição podem ser usadas por vez e a exibição efetiva a resolução é 128x32.

O protocolo Cozmo usa uma codificação especial de comprimento de execução para compactar imagens.

A exibição e o áudio são sincronizados por mensagens de áudio (OutputAudio e OutputSilence).

AnimationState mensagem que pode ser habilitada usando o EnableAnimationState mensagem fornece estatísticas em exibição uso.

Ver examples/display\_image.py e examples/display\_lines.py por exemplo uso.

## **Palestrante**

O OutputAudio a mensagem pode ser usada para transmitir 744 amostras de áudio por vez. As amostras são de 8 bits e [direito u](https://en.wikipedia.org/wiki/%CE%9C-law_algorithm) codificado.

O volume do alto-falante pode ser ajustado com o SetRobotVolume mensagem.

AnimationState mensagem que pode ser habilitada usando o EnableAnimationState mensagem fornece estatísticas sobre áudio uso.

Ver examples/audio.py por exemplo uso.

## **Câmera**

Cozmo pode enviar um fluxo de imagens de câmera em resolução 320x240 (QVGA) a uma taxa de \~15 quadros por segundo.

O EnableCamera a mensagem permite a recepção da imagem da câmera e o EnableColorImages mensagem permite alternar entre imagens em tons de cinza e coloridas.

O ganho da câmera, o tempo de exposição e a exposição automática podem ser controlados com o SetCameraParams mensagem.

As imagens são codificadas em formato JPEG e transmitidas como uma série de ImageChunk mensagens. O cabeçalho dos arquivos JPEG é não transmitido para economizar largura de banda.

O ImageImuData a mensagem fornece leituras do acelerômetro no momento da captura de cada imagem para permitir o movimento compensação de desfoque.

Ver examples/camera.py por exemplo uso.

## **LED IR**

O LED IR (também conhecido como farol) pode melhorar o desempenho da câmera em ambientes escuros.

O LED IR pode ser ligado e desligado usando o SetHeadLight mensagem.

## **Acelerômetros**

O RobotState a mensagem comunica leituras do acelerômetro que representam a aceleração ao longo dos eixos x, y e z.

Além disso, o robô detecta e comunica automaticamente 2 tipos de eventos. O RobotPoked a mensagem é enviada se o robô foi movido rapidamente por uma força externa ao longo dos eixos x ou y. O FallingStarted e FallingStopped as mensagens são enviadas se o robô estiver se movendo rapidamente ao longo do eixo z.

Ver examples/events.py por exemplo uso.

## **Giro**

O RobotState a mensagem comunica leituras do giroscópio que representam a velocidade angular em torno dos eixos x, y e z.

Ver examples/events.py por exemplo uso.

## **Sensor de penhasco**

O robô possui um “sensor de penhasco” que mede a distância ao solo abaixo do robô. Isso permite detectar falésias e detectando quando o robô está sendo recolhido ou abatido.

O RobotState a mensagem comunica as leituras brutas do sensor de penhasco.

Além disso, o robô pode parar automaticamente quando um penhasco é detectado com o EnableStopOnCliff mensagem.

Ver examples/events.py por exemplo uso.

## **Tensão da bateria**

O RobotState a mensagem comunica leituras brutas de tensão da bateria.

## **Armazenamento de RAM NV**

O robô fornece acesso a alguma quantidade de memória não volátil (também conhecida como RAM NV) destinada a armazenar dois tipos principais de dados:

* parâmetros específicos da unidade (ex. dados de calibração da câmera e IDs do cubo)  
* dados de aplicativos móveis (ex. faíscas e jogos e truques desbloqueados)

O armazenamento de RAM NV é apoiado pelo flash SPI externo do controlador ESP8266 da cabeça. É um flash NOR que aciona o seguintes especificidades para seu uso:

* uma operação de apagamento é necessária antes de uma operação de gravação  
* os dados são apagados nas páginas

O NvStorageOp mensagem permite executar operações de leitura, apagamento e gravação. Os dados são endereçados pelo tag campo e apenas os valores enumerados por NvEntryTag pode ser usado. Usar qualquer outro endereço resulta em um NV\_BAD\_ARGS. Etiquetas menores que 0x80000000 são endereços de memória flash NÃO diretos. Tags maiores que 0x80000000 são endereços virtuais que parecem estar armazenados no NVEntry\_FactoryBaseTagWithBCOffset área.

NvStorageOpResult as mensagens comunicam resultados de NvStorageOp operações.

Um backup através do aplicativo móvel preserva os dados por trás das seguintes teclas:

* NVEntry\_GameSkillLevels  
* NVEntry\_Onboarding  
* NVEntry\_GameUnlocks  
* NVEntry\_FaceEnrollData  
* NVEntry\_FaceAlbumData  
* NVEntry\_NurtureGameData  
* NVEntry\_Dados de inventário  
* NVEntry\_LabAssignments

Ver examples/nvram.py por exemplo uso.

## **Atualizações de firmware**

As atualizações de firmware do Cozmo são distribuídas em arquivos “cozmo.safe” que parecem conter imagens de firmware para todos os três Controladores Cozmos \- o controlador de comunicação Wi-Fi, o controlador RTIP e o controlador corporal.

Os arquivos “cozmo.safe” começam com uma assinatura de firmware no formato JSON:

{  
    **"version"**: 2381,  
    **"git-rev"**: "408d28a7f6e68cbb5b29c1dcd8c8db2b38f9c8ce",  
    **"date"**: "Tue Jan  8 10:27:05 2019",  
    **"time"**: 1546972025,  
    **"messageEngineToRobotHash"**: "9e4a965ace4e09d86997b87ba14235d5",  
    **"messageRobotToEngineHash"**: "a259247f16231db440957215baba12ab",  
    **"build"**: "DEVELOPMENT",  
    **"wifiSig"**: "69ca03352e42143d340f0f7fac02ed8ff96ef10b",  
    **"rtipSig"**: "36574986d76144a70e9252ab633be4617a4bc661",  
    **"bodySig"**: "695b59eff43664acd1a5a956d08c682b3f8bd2c8"  
}

Esta é a mesma assinatura, entregue com o FirmwareSignature mensagem sobre o estabelecimento inicial da conexão.

Ver docs/versions.md para mais exemplos.

Parece haver assinaturas individuais para cada controlador, mas a estrutura do cozmo.safe os arquivos não são conhecidos.

A imagem do firmware é transferida como está do motor para o robô, usando FirmwareUpdate mensagens. Está dividido em pedaços de 1024 B numerados consecutivamente, começando com 0\. Cada pedaço é confirmado pelo robô com um FirmwareUpdateResult mensagem com status campo definido como 0\.

A conclusão da transferência de firmware é indicada pelo mecanismo com e FirmwareUpdate mensagem com ID de bloco definido como 0xFFFF e conjunto de dados para todos os zeros. O robô confirma a conclusão da atualização do firmware enviando um FirmwareUpdateResult mensagem que repete o último ID do bloco e tem um status campo definido como 10\.

## **Bluetooth LE**

“Objetos”, que podem ser conectados via Bluetooth LE, anunciam sua disponibilidade com um ObjectAvailable mensagem periodicamente. O ObjectAvailable a mensagem contém o tipo de objeto (por exemplo, cubo de luz 1, 2, 3 ou almofada de carregamento) e o ID da fábrica de objetos que o identifica exclusivamente.

O ObjectConnect a mensagem é usada para iniciar ou encerrar uma conexão com objetos, usando seu ID de fábrica.

O estabelecimento e o término da conexão são anunciados com o ObjectConnectionState mensagem. Contém um temporário “ID do objeto” que é usado para identificar o objeto durante a conexão com ele.

## **LEDs de cubo**

Os cubos possuem 4 LEDs RGB que podem ser controlados individualmente.

Um cubo deve ser “selecionado” primeiro, usando o CubeId mensagem. Um subsequente CubeLights mensagem define o estado de todos 4 LEDs cúbicos.

Os cubos podem ser programados para executar animações simples de luz LED de forma autônoma usando o LightState estrutura e o CubeId.rotation\_period\_frames campo.

Ver examples/cube\_lights.py e examples/cube\_light\_animation.py por exemplo uso.

## **Tensão da bateria do cubo**

A tensão da bateria do cubo é comunicada periodicamente com ObjectPowerLevel mensagens.

## **Acelerômetros de cubo**

A recepção do valor do acelerômetro de cubo pode ser habilitada com o StreamObjectAccel mensagem e são comunicados a cada 30 ms com o ObjectAccel mensagem.

Além disso, o robô realiza o processamento básico do acelerômetro de cubo ata e fornece eventos básicos com o seguinte mensagens:

* ObjectMoved  
* ObjectStoppedMoving  
* ObjectUpAxisChnaged  
* ObjectTapped  
* ObjectTapFiltered

## **Animações**

Para reproduzir animações, AnimationState a mensagem deve ser habilitada primeiro usando o EnableAnimationState mensagem.

As animações são controladas com o StartAnimation, EndAnimation, e AbortAnimation mensagens.

Os quadros-chave são transferidos com o AnimHead, AnimLift, AnimBody, AnimBackpackLights, RecordHeading, TurnToRecordedHeading, e OutputAudio mensagens.

Ver examples/anim.py por exemplo uso.

[Próximo](https://pycozmo.readthedocs.io/en/stable/external/offboard_functions.html)   
[Anterior](https://pycozmo.readthedocs.io/en/stable/external/capturing.html)

