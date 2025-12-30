import sys
import os
import json
import numpy as np
# Importações Corretas para modelos de Embedding (Sentence Transformer)
from sentence_transformers import SentenceTransformer

# 1. Defina o nome da pasta do modelo
LOCAL_MODEL_NAME = "all-MiniLM-L6-v2"

# 2. CALCULA O CAMINHO BASE (A RAIZ DO PROJETO)
# current_dir é [RAIZ]/python/chatbot. Subir um '..' chega à [RAIZ]/python
current_dir = os.path.dirname(os.path.abspath(__file__))
BASE_PATHON = os.path.abspath(os.path.join(current_dir, "..")) 

# 3. CONSTRÓI OS CAMINHOS ABSOLUTOS FINAIS
# O modelo está em [RAIZ]/models/all-MiniLM-L6-v2
MODEL_PATH = os.path.join(BASE_PATHON, "models", LOCAL_MODEL_NAME)
# O NPZ está na raiz do projeto: [RAIZ]/faq_embeddings.npz
NPZ_PATH = os.path.join(current_dir, 'faq_embeddings.npz')


def normalize(text):
    """Função de normalização de texto."""
    return text.lower().strip()

def main():
    """
    Função principal que carrega os modelos e entra em um loop para processar perguntas.
    """
    
    # ----------------------------------------------------
    # 1. Carrega os Embeddings FAQ e Respostas
    # ----------------------------------------------------
    try:
        # Usa o caminho absoluto garantido
        data = np.load(NPZ_PATH, allow_pickle=True)
        faq_embeddings = np.array(data['embeddings'])
        faq_respostas = data['respostas']
        # ✔ log normal → stdout
        print(f"Embeddings FAQ carregados com sucesso de: {NPZ_PATH}")
    except FileNotFoundError:
        # erro mesmo → stderr
        print(f"ERRO CRÍTICO: Arquivo faq_embeddings.npz não encontrado em: {NPZ_PATH}", file=sys.stderr)
        print("Você precisa executar um script para gerar os embeddings FAQ antes de usar o chatbot.", file=sys.stderr)
        sys.exit(1) # Sai com erro
    except Exception as e:
        print(f"ERRO CRÍTICO: Erro ao carregar faq_embeddings.npz: {e}", file=sys.stderr)
        sys.exit(1)


    # ----------------------------------------------------
    # 2. Carrega o Modelo SentenceTransformer
    # ----------------------------------------------------
    try:
        if not os.path.exists(MODEL_PATH) or not os.listdir(MODEL_PATH):
            print(f"ERRO CRÍTICO: Pasta do modelo LLM vazia ou não encontrada em: {MODEL_PATH}", file=sys.stderr)
            print("Execute 'python download_model.py' ou verifique o caminho e conteúdo da pasta 'models'.", file=sys.stderr)
            sys.exit(1)

        # Carrega o modelo SentenceTransformer da pasta local
        model = SentenceTransformer(MODEL_PATH) 
        # ✔ log normal → stdout
        print(f"Modelo SentenceTransformer carregado com sucesso de: {MODEL_PATH}")
    except Exception as e:
        print(f"ERRO CRÍTICO: Erro ao carregar o modelo de: {MODEL_PATH} -> {e}", file=sys.stderr)
        print(f"Verifique se a pasta '{LOCAL_MODEL_NAME}' está completa e se as bibliotecas (torch, transformers, etc.) estão instaladas.", file=sys.stderr)
        sys.exit(1) # Sai com erro

    
    # ----------------------------------------------------
    # 3. Função de Busca por Similaridade
    # ----------------------------------------------------
    def buscar_resposta(pergunta):
        """Busca a resposta mais similar nos embeddings pré-calculados."""
        pergunta_emb = model.encode(normalize(pergunta))
        
        # O dot product de vetores normalizados é a similaridade de cosseno.
        scores = np.dot(faq_embeddings, pergunta_emb) 
        idx = np.argmax(scores)
        
        # Limite de similaridade (0.5 é um bom ponto de partida)
        SIMILARITY_THRESHOLD = 0.5 
        
        if scores[idx] > SIMILARITY_THRESHOLD: 
            return faq_respostas[idx]
            
        return "Ainda não sei responder a essa pergunta específica sobre o ZoyBlocks. Tente reformular."


    # ----------------------------------------------------
    # 4. Loop Principal de Comunicação
    # ----------------------------------------------------
    # ✔ log normal → stdout
    print("Pronto para receber perguntas do Node/Electron...")

    for line in sys.stdin:
        try:
            input_data = json.loads(line)
            pergunta = input_data.get("pergunta", "")
            
            if pergunta:
                resposta = buscar_resposta(pergunta)
                
                # Envia a resposta como um JSON para o stdout
                sys.stdout.write(json.dumps({"resposta": resposta}) + '\n')
                sys.stdout.flush() 
        except json.JSONDecodeError:
            print("Erro ao decodificar JSON. Ignorando linha.", file=sys.stderr)
            sys.stderr.flush()
        except Exception as e:
            print(f"Erro ao processar a pergunta: {e}", file=sys.stderr)
            sys.stderr.flush()

if __name__ == "__main__":
    main()
