# Descriptin: this code loads the json data, splits it into chunks, embeds the chunk, save it in vector database
import os
import json
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
import torch


def load_json(path:str):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)
    
def chunk_and_embed(
    data: list[dict],
    chunk_size: int=1000,
    chunk_overlap: int=200,
    index_dir: str='faiss_index',    
):
    #  1- initialize the text splitter
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n","\n",".","، "," "],
    )
    
    texts: list[str] = []
    metadatas: list[dict] = []
    
    # 2- chunk each arabic document
    for doc in data:
        if doc.get("lang") != "ar":
            print(f"Skipping document with lang {doc.get('lang')}")
            continue
        chunks = splitter.split_text(doc["content"])
        for chunk in chunks:
            texts.append(chunk)
            metadatas.append({
                "source": doc["url"],
                "lang": doc["lang"],
            })
    # 3- create the embeddings using free model from huggingface
    embedder = HuggingFaceEmbeddings(
        model_name="intfloat/multilingual-e5-base",
        model_kwargs={
            "device": "cuda" if torch.cuda.is_available() else "cpu",
        },
    )
    
    # 4. BUILD FAISS INDEX
    vectorstore = FAISS.from_texts(texts, embedding=embedder, metadatas=metadatas)
    
    # 5. save the index to disk
    os.makedirs(index_dir, exist_ok=True)
    vectorstore.save_local(index_dir)
    print(f"Indexed {len(texts)} chunks into FAISS at ./{index_dir}")

if __name__ == "__main__":
    try:
        DATA_PATH = r"scraped_data\bop_website_cleaned.json"
        data = load_json(DATA_PATH)
        chunk_and_embed(data)
    except Exception as e:
        print(f"Error: {e}")
        raise e