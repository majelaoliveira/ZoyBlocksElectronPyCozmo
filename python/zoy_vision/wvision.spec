# -*- mode: python ; coding: utf-8 -*-

import sys
import os
from PyInstaller.utils.hooks import collect_all

# --- COLETA COMPLETA DO MEDIAPIPE ---
# Gera: datas, binaries e hiddenimports
mp_datas, mp_binaries, mp_hiddenimports = collect_all('mediapipe')

# Caminho ABSOLUTO do site-packages (igual ao seu spec anterior)
site_packages = os.path.abspath(
    os.path.join('..', '..', 'venv', 'Lib', 'site-packages')
)

block_cipher = None

a = Analysis(
    ['vision.py'],
    pathex=[os.path.abspath('.')],   # mantém o padrão do spec de referência
    binaries=mp_binaries,            # binários do MediaPipe
    datas=[
        # --- OpenCV (importantíssimo para não quebrar) ---
        (os.path.join(site_packages, 'cv2'), 'cv2'),

        # --- NumPy (necessário para o OpenCV) ---
        (os.path.join(site_packages, 'numpy'), 'numpy'),
    ] + mp_datas,                     # adiciona dados do MediaPipe (.tflite, .binarypb)
    hiddenimports=[
        # OpenCV
        'cv2',
        'cv2.data',

        # NumPy imports usados internamente
        'numpy',
        'numpy.core._dtype',
        'numpy.core._methods',
        'numpy.core._exceptions',
    ] + mp_hiddenimports,            # imports ocultos do MediaPipe
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)


# --- ESTRUTURA "LIMPA" igual ao seu spec de referência ---
coll = COLLECT(
    EXE(
        pyz,
        a.scripts,
        [],  # binários ficam no COLLECT
        exclude_binaries=True,
        name='vision',
        debug=False,
        bootloader_ignore_signals=False,
        strip=False,
        upx=True,
        console=True,  # deixe True para ver logs, ou mude para False
        disable_windowed_traceback=False,
        argv_emulation=False,
        target_arch=None,
        codesign_identity=None,
        entitlements_file=None,
    ),
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='vision',
)
