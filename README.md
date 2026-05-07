# 🤖 SWS AI: Intelligent Policy Concierge
> **A High-Performance RAG Chatbot for Seamless Employee Onboarding & Policy Access.**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain)](https://langchain.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![Vector DB](https://img.shields.io/badge/ChromaDB-white?style=for-the-badge&logo=google-cloud&logoColor=red)](https://www.trychroma.com/)

---

## 🌟 Overview
**SWS AI Chatbot** solves the "Information Silo" problem. Instead of manually digging through 10+ complex HR and Security PDFs, employees can now ask natural language questions and get **grounded, hallucination-free answers** in seconds.

### 🎯 Key Highlights
- ⚡ **Real-time RAG:** Retrieval-Augmented Generation pipeline.
- 🛡️ **Zero Hallucination:** Strictly answers from provided company documents.
- 📂 **Source Attribution:** Every answer cites the specific PDF it came from.
- 🎨 **Sleek UI:** Minimalist blue-white design using the **Livvic** typography.

---

## 🏗️ System Architecture
The project follows a modular AI pipeline to ensure scalability and speed.



1.  **Ingestion:** Extracts text from 10 Policy PDFs.
2.  **Splitting:** Recursive chunking (500 chars, 50 overlap) for context retention.
3.  **Embedding:** Transforms text into vectors using Google Gemini `embedding-001`.
4.  **Vector Store:** ChromaDB manages semantic search.
5.  **Generation:** Gemini 1.5 Flash synthesizes answers based *only* on top-k retrieved chunks.

---

## 🛠️ Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Backend** | FastAPI (Python) |
| **Orchestration** | LangChain |
| **LLM** | Google Gemini 1.5 Flash |
| **Embeddings** | Google Generative AI |
| **Database** | ChromaDB (Vector Store) |
| **Frontend** | Vanilla JS, HTML5, CSS3 (Livvic Font) |

---

## 🚀 Getting Started

### 1️⃣ Clone & Install
```bash
git clone [https://github.com/your-username/sws-ai-rag-chatbot.git](https://github.com/your-username/sws-ai-rag-chatbot.git)
cd sws-ai-rag-chatbot
pip install -r requirements.txt
