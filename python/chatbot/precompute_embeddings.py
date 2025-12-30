import json
import os
import numpy as np
from sentence_transformers import SentenceTransformer

# Diretório atual do script
current_dir = os.path.dirname(os.path.abspath(__file__))

# Caminho da raiz do projeto (sobe dois níveis: chatbot → python → raiz)
BASE_PATH = os.path.abspath(os.path.join(current_dir, "..", ".."))

# Caminho do manual na raiz/docs/
manual_path = os.path.join(BASE_PATH, "docs", "manual.json")

# Caminho do modelo local
MODEL_PATH = os.path.join(BASE_PATH, "python", "models", "all-MiniLM-L6-v2")

# Caminho onde o NPZ será salvo (na pasta chatbot)
OUTPUT_NPZ = os.path.join(current_dir, "faq_embeddings.npz")

# --- Carrega manual ---
with open(manual_path, 'r', encoding='utf-8') as f:
    manual = json.load(f)

# --- Função para extrair perguntas e respostas ---
def coletar_conteudo(obj):
    resultados = []
    for chave, valor in obj.items():
        if isinstance(valor, str):
            resultados.append({'texto': valor})
        elif isinstance(valor, list):
            for item in valor:
                if isinstance(item, dict) and 'pergunta' in item and 'resposta' in item:
                    resultados.append({'pergunta': item['pergunta'], 'resposta': item['resposta']})
                elif isinstance(item, dict):
                    resultados.extend(coletar_conteudo(item))
        elif isinstance(valor, dict):
            resultados.extend(coletar_conteudo(valor))
    return resultados

conteudos = coletar_conteudo(manual)
faq_items = [item for item in conteudos if 'pergunta' in item and 'resposta' in item]

# --- Carrega modelo local ---
model = SentenceTransformer(MODEL_PATH)

# --- Calcula embeddings das perguntas ---
embeddings = [model.encode(item['pergunta']).tolist() for item in faq_items]

# --- Salva o arquivo ---
np.savez_compressed(
    OUTPUT_NPZ,
    embeddings=embeddings,
    respostas=[item['resposta'] for item in faq_items]
)

print(f"Embeddings pré-calculados salvos com sucesso em: {OUTPUT_NPZ}")
