
import json
import sys
import pycozmo

print("Iniciando cliente", flush=True)

cli = pycozmo.Client()
cli.start()
cli.connect()
cli.wait_for_robot()

print("COZMO READY", flush=True)

for line in sys.stdin:
    try:
        cmd = json.loads(line.strip())
        t = cmd["type"]
        p = cmd.get("params", {})

        if t == "drive_wheels":
            cli.drive_wheels(p["left"], p["right"])

    except Exception as e:
        print("ERRO:", e, flush=True)
