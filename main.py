import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SWS AI RAG Chatbot")

# Initialize Vector DB
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
vector_db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
retriever = vector_db.as_retriever(search_kwargs={"k": 5})

# Define LLM
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)

# System Prompt for Zero Hallucination
system_prompt = (
    "You are an assistant for question-answering tasks focusing on SWS AI company policies. "
    "Use the following pieces of retrieved context to answer the question. "
    "If you don't know the answer or the information is not in the context, "
    "say 'I don't have that information in the company documents.' "
    "Do not hallucinate or use outside knowledge. "
    "Keep the answer concise and professional."
    "\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

class ChatRequest(BaseModel):
    question: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        response = rag_chain.invoke({"input": request.question})
        
        # Extract unique sources
        sources = list(set([doc.metadata.get("source", "Unknown") for doc in response["context"]]))
        # Clean source paths to show only filenames
        sources = [os.path.basename(s) for s in sources]

        return {
            "answer": response["answer"],
            "sources": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
