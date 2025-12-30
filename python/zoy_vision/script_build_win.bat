@REM Dar permissão de execução no script (Linux/Mac)
@REM chmod +x script_build_linux.sh

@echo off
echo 🔧 ATIVANDO VENV...
call ..\..\venv\Scripts\activate

echo 🛠️ GERANDO vision.exe...
pyinstaller vision.spec

echo ✔️ Executável gerado em python/zoy_vision/dist/vision/
pause
deactivate