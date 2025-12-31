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

            elif cmd == "stop":
                cli.stop_all_motors()
                log({"status": "ok", "cmd": "stop"})

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