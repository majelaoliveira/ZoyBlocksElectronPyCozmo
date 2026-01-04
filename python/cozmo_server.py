import sys
import json
import pycozmo
import os
import time
from PIL import Image
import io
import base64
import cv2
import numpy as np

# Carregar o detetor de rostos pré-treinado do OpenCV
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
# Inicializar o detetor de QR Code
qr_detector = cv2.QRCodeDetector()

def on_camera_image(cli, image):
    # 1. Converter imagem PIL para formato OpenCV (BGR)
    open_cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2GRAY)

    # --- DETEÇÃO DE ROSTO ---
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    for (x, y, w, h) in faces:
        # Desenha um retângulo no rosto (opcional, aparece no streaming)
        cv2.rectangle(open_cv_image, (x, y), (x+w, y+h), (255, 0, 0), 2)
        # Envia evento de rosto detetado para o Electron
        log({"type": "event", "event": "face_detected", "count": len(faces)})

    # --- DETEÇÃO DE QR CODE ---
    data, bbox, _ = qr_detector.detectAndDecode(open_cv_image)
    if data:
        # Se detetar um QR Code, envia o conteúdo lido
        log({"type": "event", "event": "qrcode_detected", "data": data})

    # 2. Converter de volta para enviar para o streaming do Electron
    _, buffer = cv2.imencode('.jpg', open_cv_image)
    img_str = base64.b64encode(buffer).decode()
    log({"type": "camera", "image": img_str})

def on_cliff_detected(cli, state):
    # state será True se o sensor detectar um "vão" (penhasco)
    # state será False se o robô estiver em terreno seguro
    log({"type": "cliff_event", "detected": state})

def log(msg):
    print(json.dumps(msg), flush=True)

# --- CONFIGURAÇÃO DE PORTABILIDADE (PLANO INFALÍVEL) ---
# Descobrimos o caminho da pasta onde o script está
base_path = os.path.dirname(os.path.abspath(__file__))

# FORÇAMOS o PyCozmo a olhar para a pasta do projeto
# O PyCozmo busca essa variável no sistema por padrão
os.environ["PYCOZMO_RESOURCES_PATH"] = base_path

# --- INICIALIZAÇÃO ---
cli = pycozmo.Client()
cli.start()
cli.connect()
cli.wait_for_robot()

cli.add_handler(pycozmo.event.EvtCliffDetectedChange, on_cliff_detected)

try:
    # Agora ele vai buscar a pasta 'animations' dentro do base_path
    cli.load_anims()
    log({"status": "info", "msg": "Animações carregadas via Variável de Ambiente!"})
except Exception as e:
    log({"status": "warning", "msg": f"Ainda sem acesso aos .bin: {e}"})

log({"status": "ready"})


try:
    # Loop de escuta de comandos vindos do Node.js (stdin)
    for line in sys.stdin:
        if not line.strip():
            continue

        try:
            data = json.loads(line)
            cmd = data.get("cmd")

            if cmd == "move":
                speed = data.get("speed", 50)
                duration = data.get("duration", 1.0)
                # drive_wheels(roda_esquerda, roda_direita, tempo)
                cli.drive_wheels(speed, speed, duration=duration)
                log({"status": "ok", "cmd": "move"})

            elif cmd == "turn":
                angle = data.get("angle", 0)
                # Velocidade das rodas para o giro (uma positiva, outra negativa)
                turn_speed = 30 
                
                # Cálculo aproximado: Cozmo gira ~90 graus por segundo a 30 de velocidade
                # Ajuste o divisor (85.0) se ele girar demais ou de menos
                duration = abs(angle) / 85.0 
                
                if angle > 0:
                    # Girar para a esquerda
                    cli.drive_wheels(-turn_speed, turn_speed, duration=duration)
                else:
                    # Girar para a direita
                    cli.drive_wheels(turn_speed, -turn_speed, duration=duration)
                
                log({"status": "ok", "cmd": "turn", "angle": angle})

            elif cmd == "head":
                angle_deg = data.get("angle", 0)
    
                # O PyCozmo usa radianos. Convertemos graus para radianos:
                # 0 graus é a cabeça nivelada (horizontal)
                angle_rad = (angle_deg * 3.14159) / 180.0
    
                     # Comando PyCozmo para mover a cabeça
                cli.set_head_angle(angle_rad)

                log({"status": "ok", "cmd": "head", "angle": angle_deg})
           
            elif cmd == "lift":
                height_percent = data.get("height", 0)
                
                # Feedback Visual - Confirma que o Python recebeu o comando
                cli.set_all_backpack_lights(pycozmo.lights.blue_light)
                
                # Determina a direção da força
                # Se pedir 100, força para cima. Se pedir 0, força para baixo.
                speed = 1.0 if height_percent > 0 else -1.0
                
                # COMANDO BRUTO: Envia potência direta ao motor do braço
                # O parâmetro lift_speed é o "segredo" para destravar o hardware
                for _ in range(10): # Envia o pacote 10 vezes para garantir
                    cli.drive_robot_motors(l_wheel_speed=0, r_wheel_speed=0, lift_speed=speed)
                    time.sleep(0.05)
                
                # Mantém o motor ligado pelo tempo necessário para o curso total
                time.sleep(0.8)
                
                # PARA O MOTOR (Importante para não queimar)
                cli.drive_robot_motors(0, 0, 0)
                
                cli.set_all_backpack_lights(pycozmo.lights.green_light)
                log({"status": "ok", "cmd": "lift", "height": height_percent})


            elif cmd == "toggle_camera":
                enable = data.get("enable", False)
                if enable:
                    cli.enable_camera(enable=True, color=True)
                    # Adiciona o handler apenas se for ligar
                    cli.add_handler(pycozmo.event.EvtNewRawCameraImage, on_camera_image)
                    log({"status": "ok", "msg": "Camera ativada"})
                else:
                    cli.enable_camera(enable=False)
                    # Remove o handler para liberar memória
                    cli.remove_handler(pycozmo.event.EvtNewRawCameraImage, on_camera_image)
                    log({"status": "ok", "msg": "Camera desativada"})

            elif cmd == "expression":
                emotion = data.get("emotion", "HAPPY")
                
                # 1. Mapeamento único
                folders = {
                    "HAPPY": "face_bored_event_02",
                    "SURPRISED": "face_surprised_event_01",
                    "ANGRY": "face_angry_event_01"
                }
                
                folder_name = folders.get(emotion, "face_bored_event_02")
                
                # Verifique se o nome da pasta é faceAnmations ou faceAnimations 
                # (Use o que funcionou no seu PC)
                path = os.path.join(base_path, "assets", "faceAnimations", folder_name)

                if os.path.exists(path):
                    # 2. Busca e ordena todos os arquivos
                    all_files = sorted([f for f in os.listdir(path) if f.endswith('.png')])
                    
                    # 3. Define quais frames usar
                    # Se for HAPPY, usa do 0 ao 7. Se for outra, usa tudo [::2]
                    if emotion == "HAPPY":
                        frames_to_play = all_files[0:8]
                    else:
                        frames_to_play = all_files[::2]
                    
                    log({"status": "info", "msg": f"Executando {len(frames_to_play)} frames de {path}"})

                    # 4. Loop único de exibição
                    for file in frames_to_play:
                        img_path = os.path.join(path, file)
                        img = Image.open(img_path).convert('1').resize((128, 32))
                        cli.display_image(img)
                        time.sleep(0.06) 
                    
                    log({"status": "ok", "cmd": "expression", "emotion": emotion})
                else:
                    log({"status": "error", "msg": f"Caminho nao encontrado: {path}"})

            elif cmd == "stop":
               cli.stop_all_motors()
               log({"status": "ok", "cmd": "stop"})

            elif cmd == "get_distance":
            # O PyCozmo atualiza os sensores automaticamente
               dist = cli.proxi_sensor_mm
               log({"status": "ok", "distance": dist})

            elif cmd == "set_lights":
                color_name = str(data.get("color", "white")).lower()
                
                # Mapeamento que o PyCozmo entende
                colors = {
                    "red": pycozmo.lights.red_light,
                    "green": pycozmo.lights.green_light,
                    "blue": pycozmo.lights.blue_light,
                    "white": pycozmo.lights.white_light,
                    "off": pycozmo.lights.off_light
                }
                
                # Pega a cor escolhida
                selected_light = colors.get(color_name, pycozmo.lights.white_light)

                # USANDO A FUNÇÃO SIMPLES (A que funciona sem erro de argumentos)
                cli.set_all_backpack_lights(selected_light)
                
                # Um micro-tempo para o robô processar
                time.sleep(0.1)
                log({"status": "ok", "cmd": "lights", "color": color_name})
                        

            elif cmd == "blink_lights":
                color_name = data.get("color", "red")
                times = data.get("times", 3)
                
                colors = {
                    "red": pycozmo.lights.red_light,
                    "green": pycozmo.lights.green_light,
                    "blue": pycozmo.lights.blue_light
                }
                
                light = colors.get(color_name, pycozmo.lights.red_light)
                
                # Lógica de piscar
                for _ in range(times):
                    cli.set_all_backpack_lights(light)
                    time.sleep(0.3)
                    cli.set_all_backpack_lights(pycozmo.lights.off_light)
                    time.sleep(0.3)
                
                log({"status": "ok", "cmd": "blink"})
                
            elif cmd == "get_battery":
               volts = cli.battery_voltage
               log({"status": "ok", "level": volts})

            else:
               log({"status": "error", "msg": "unknown command: " + str(cmd)})

        except json.JSONDecodeError:
            log({"status": "error", "msg": "invalid json received"})
        except Exception as e:
            log({"status": "error", "msg": str(e)})

except KeyboardInterrupt:
    pass
except Exception as e:
    log({"status": "fatal", "error": str(e)})

finally:
    # Garante que o robô pare e a conexão feche ao sair
    cli.stop_all_motors()
    cli.disconnect()
    cli.stop()