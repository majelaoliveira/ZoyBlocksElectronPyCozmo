import sys
import json
import pycozmo

def log(msg):
    print(json.dumps(msg), flush=True)

cli = pycozmo.Client()
cli.start()
cli.connect()
cli.wait_for_robot()

log({"status": "ready"})

try:
    for line in sys.stdin:
        data = json.loads(line)

        cmd = data.get("cmd")

        if cmd == "move":
            speed = data.get("speed", 50)
            duration = data.get("duration", 1)
            cli.drive_wheels(speed, speed, duration=duration)
            log({"status": "ok", "cmd": "move"})

        elif cmd == "stop":
            cli.drive_wheels(0, 0)
            log({"status": "ok", "cmd": "stop"})

        else:
            log({"status": "error", "msg": "unknown command"})

except Exception as e:
    log({"status": "fatal", "error": str(e)})

finally:
    cli.disconnect()
    cli.stop()
