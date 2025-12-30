#!/bin/bash
echo "🔧 Ativando venv..."
source ../../venv/bin/activate

echo "🛠️ Gerando executável Linux..."
pyinstaller vision.spec

echo "✔️ Executável gerado em python/zoy_vision/dist/vision/"
deactivate