import sys
import json
import pycozmo
import time

def log(msg):
    """Envia feedback para o Node.js via stdout em formato JSON"""
    print(json.dumps(msg), flush=True)

# Inicialização do Cliente PyCozmo
cli = pycozmo.Client()
cli.start()
cli.connect()
cli.wait_for_robot()

# Calibração inicial e sinal de pronto
cli.set_head_angle(0.0)
cli.set_lift_height(0.0)
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
                cli.drive_wheels(speed, speed, duration=duration)
                log({"status": "ok", "cmd": "move"})

            elif cmd == "turn":
                angle = data.get("angle", 0)
                turn_speed = 30 
                duration = abs(angle) / 85.0 
                if angle > 0:
                    cli.drive_wheels(-turn_speed, turn_speed, duration=duration)
                else:
                    cli.drive_wheels(turn_speed, -turn_speed, duration=duration)
                log({"status": "ok", "cmd": "turn", "angle": angle})

            elif cmd == "head":
                angle_deg = data.get("angle", 0)
                if angle_deg > 44: angle_deg = 44
                if angle_deg < -25: angle_deg = -25
                angle_rad = (angle_deg * 3.14159) / 180.0
                cli.set_head_angle(angle_rad)
                time.sleep(0.3)
                log({"status": "ok", "cmd": "head", "angle": angle_deg})

            elif cmd == "lift":
                height_percent = data.get("height", 0)
                
                # Feedback Visual para sabermos que o comando CHEGOU
                cli.set_all_backpack_lights(pycozmo.lights.blue_light)
                
                # Se a altura for maior que 0, vamos dar um "impulso" para cima
                if height_percent > 0:
                    # Aplica potência máxima por 0.8 segundos
                    cli.drive_robot_motors(l_wheel_speed=0, r_wheel_speed=0, lift_speed=1.0)
                    time.sleep(0.8)
                else:
                    # Aplica potência para baixo
                    cli.drive_robot_motors(l_wheel_speed=0, r_wheel_speed=0, lift_speed=-1.0)
                    time.sleep(0.6)
                
                # IMPORTANTE: Desliga o motor para ele não ficar forçando no final
                cli.drive_robot_motors(0, 0, 0)
                
                # Volta a luz para verde
                cli.set_all_backpack_lights(pycozmo.lights.green_light)
                log({"status": "ok", "cmd": "lift", "height": height_percent})

            elif cmd == "stop":
                cli.stop_all_motors()
                log({"status": "ok", "cmd": "stop"})

            else:
                log({"status": "error", "msg": f"comando desconhecido: {cmd}"})

        except json.JSONDecodeError:
            log({"status": "error", "msg": "json invalido"})
        except Exception as e:
            log({"status": "error", "msg": str(e)})

except KeyboardInterrupt:
    pass
except Exception as e:
    log({"status": "fatal", "error": str(e)})

finally:
    cli.stop_all_motors()
    cli.disconnect()
    cli.stop()