import os
import numpy as np
from sentence_transformers import SentenceTransformer
from threading import Lock

class Chatbot:
    def __init__(self):
        self.lock = Lock()
        # Carrega embeddings pré-calculados
        npz_path = 'faq_embeddings.npz'
        data = np.load(npz_path, allow_pickle=True)
        self.faq_embeddings = np.array(data['embeddings'])
        self.faq_respostas = data['respostas']
        # Modelo apenas para novas perguntas fora do FAQ
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def normalize(self, text):
        return text.lower().strip()
    
    def buscar_resposta(self, pergunta):
        pergunta_norm = self.normalize(pergunta)
        with self.lock:
            pergunta_emb = self.model.encode(pergunta_norm)
            # Similaridade coseno
            scores = np.dot(self.faq_embeddings, pergunta_emb) / (np.linalg.norm(self.faq_embeddings, axis=1) * np.linalg.norm(pergunta_emb))
            idx = np.argmax(scores)
            if scores[idx] > 0.5:
                return self.faq_respostas[idx]
            return "Ainda não sei responder isso, mas logo vou aprender."

# Para testes diretos
if __name__ == "__main__":
    bot = Chatbot()
    while True:
        pergunta = input("Você: ")
        print("Zoy+GPT:", bot.buscar_resposta(pergunta))
