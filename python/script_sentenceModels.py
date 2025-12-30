from sentence_transformers import SentenceTransformer  

# Carrega o modelo (vai baixar do Hugging Face se ainda não tiver) 
model = SentenceTransformer('all-MiniLM-L6-v2')  
# Salva o modelo na pasta local do projeto 
model.save('./models/all-MiniLM-L6-v2')  
print("✅ Modelo salvo em ./models/all-MiniLM-L6-v2")