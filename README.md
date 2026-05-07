# SWS AI RAG Chatbot

Technical assessment project for SWS AI.

## Architecture
- **Backend**: FastAPI (Python)
- **RAG Framework**: LangChain
- **Vector DB**: ChromaDB (Local)
- **Embeddings**: Google Gemini (`models/embedding-001`)
- **LLM**: Google Gemini 1.5 Flash
- **Frontend**: HTML5/Vanilla JS with Livvic font

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   Create a `.env` file and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Ingest Documents**:
   Place your 10 company PDFs in the `/data` folder (they must end in `.pdf`).
   The server will automatically process them on startup.

4. **Run the Application**:
   ```bash
   npm run dev
   ```

5. **Open Frontend**:
   Open `index.html` in your browser.

## Logic Details
- **Chunking**: RecursiveCharacterTextSplitter (Size 500, Overlap 50).
- **Retrieval**: Top-5 most relevant chunks using semantic similarity.
- **Hallucination Control**: Custom system prompt forcing context-only answers.
