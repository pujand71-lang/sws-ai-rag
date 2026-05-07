# <img src="[https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Robots/Robot.png](https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Robots/Robot.png)" alt="Robot" width="40" height="40" /> SWS AI: Enterprise RAG Intelligence

### *Elevating Employee Experience through Retrieval-Augmented Generation*

<p align="left">
  <img src="[https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)" />
  <img src="[https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)" />
  <img src="[https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)" />
  <img src="[https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)" />
  <img src="[https://img.shields.io/badge/ChromaDB-red?style=for-the-badge&logo=google-cloud&logoColor=white](https://img.shields.io/badge/ChromaDB-red?style=for-the-badge&logo=google-cloud&logoColor=white)" />
</p>

---

## 🌊 The Problem & The Solution
Manual policy searching is a productivity killer. **SWS AI Chatbot** acts as a bridge between static corporate PDFs and employee queries. It provides **Grounded Answers**, meaning it only speaks what the documents know—eliminating the risk of AI "hallucinations."

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| 🔍 **Semantic Search** | Uses vector embeddings to find meaning, not just keywords. |
| 🛡️ **Zero Hallucination** | Hard-coded system constraints to ensure 100% factual accuracy. |
| 📚 **Source Tracking** | Transparently displays which PDFs were used for the answer. |
| ⚡ **Async Processing** | Built on FastAPI for lightning-fast concurrent requests. |
| 🎨 **Modern UI** | A clean, executive blue-white interface optimized for readability. |

---

## 🏗️ Deep-Dive Architecture

The system is built on a high-performance RAG (Retrieval-Augmented Generation) pipeline:

### 1. The Ingestion Engine 📥
- **Extraction:** Utilizes `PyMuPDF` to parse 10 core company PDFs.
- **Chunking:** Implements `RecursiveCharacterTextSplitter`.
  - **Chunk Size:** 500 characters.
  - **Overlap:** 50 characters (preserves context between chunks).

### 2. The Neural Brain 🧠
- **Embeddings:** `models/embedding-001` by Google DeepMind.
- **Vector Store:** `ChromaDB` (Self-hosted/Local) for ultra-low latency retrieval.
- **LLM:** `Gemini 1.5 Flash` (The perfect balance of speed and intelligence).

### 3. The Retrieval Logic ⚙️
- **K-Value:** Fetches top-5 most relevant document segments.
- **System Prompting:** A strict "Context-Only" instruction set ensures zero data leakage from outside sources.

---

## 🛠️ Setup & Installation

### <img src="[https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Laptop.png](https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Laptop.png)" alt="Laptop" width="25" height="25" /> Step 1: Environment Setup
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
