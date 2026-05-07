import os
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from dotenv import load_dotenv

load_dotenv()

def ingest_docs():
    # 1. Load PDFs from data folder
    print("Loading documents...")
    loader = DirectoryLoader('./data', glob="./*.pdf", loader_cls=PyPDFLoader)
    documents = loader.load()

    # 2. Chunking (size 500, overlap 50)
    print("Chunking documents...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        add_start_index=True
    )
    chunks = text_splitter.split_documents(documents)

    # 3. Vector DB Setup (Chroma)
    print(f"Creating embeddings and storing in Chroma for {len(chunks)} chunks...")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    
    vector_db = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="./chroma_db"
    )
    print("Ingestion complete. Database saved to ./chroma_db")

if __name__ == "__main__":
    # Ensure data directory exists
    if not os.path.exists('./data'):
        os.makedirs('./data')
        print("Please place your 10 PDFs in the /data folder.")
    else:
        ingest_docs()
