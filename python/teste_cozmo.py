import pycozmo

print("Iniciando cliente")
cli = pycozmo.Client()
cli.start()
cli.connect()
cli.wait_for_robot()
print("Conectado")
cli.disconnect()
cli.stop()

