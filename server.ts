import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";

// LangChain imports
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";

dotenv.config();

const PORT = 3000;
const app = express();
app.use(cors());
app.use(express.json());

// Export for Vercel
export default app;

// Initialize RAG components
let vectorStore: MemoryVectorStore | null = null;
let ingestionStatus: "idle" | "loading" | "ready" | "error" = "idle";
let ingestionError: string | null = null;
let processedChunks = 0;
let totalFiles = 0;

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "embedding-001",
});

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "gemini-1.5-flash",
  temperature: 0,
});

// Initialize Vector Store
async function initVectorStore() {
  console.log("Initializing Vector Store from PDFs...");
  ingestionStatus = "loading";
  const dataDir = path.join(process.cwd(), "data");
  
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
      console.log("Created /data directory.");
    }

    const files = fs.readdirSync(dataDir);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith(".pdf"));
    totalFiles = pdfFiles.length;
    
    if (totalFiles === 0) {
      ingestionStatus = "ready"; // Ready but empty
      return;
    }

    const allDocs = [];
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    for (const file of pdfFiles) {
      try {
        const filePath = path.join(dataDir, file);
        const dataBuffer = fs.readFileSync(filePath);
        const pdf = (await import("pdf-parse")).default;
        const data = await pdf(dataBuffer);
        
        const docs = await textSplitter.createDocuments(
          [data.text],
          [{ source: file }]
        );
        allDocs.push(...docs);
        processedChunks += docs.length;
      } catch (err) {
        console.error(`Failed to load ${file}:`, err);
      }
    }

    if (allDocs.length > 0) {
      vectorStore = await MemoryVectorStore.fromDocuments(allDocs, embeddings);
      ingestionStatus = "ready";
    } else {
      ingestionStatus = "ready";
    }
  } catch (error) {
    ingestionStatus = "error";
    ingestionError = error instanceof Error ? error.message : String(error);
    console.error("Ingestion failed:", error);
  }
}

// API Routes
app.get("/api/status", (req, res) => {
  res.json({
    status: ingestionStatus,
    error: ingestionError,
    chunks: processedChunks,
    files: totalFiles,
    llmReady: !!process.env.GEMINI_API_KEY
  });
});

app.post("/api/chat", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    if (!vectorStore) {
      await initVectorStore();
    }

    const retriever = vectorStore!.asRetriever(5);
    
    const systemPrompt = `You are a helpful assistant for SWS AI employees. 
    Use the following pieces of retrieved context to answer the question. 
    If you don't know the answer or the information is not in the context, 
    say "I don't have that information in the company documents." 
    Do not hallucinate or use outside knowledge.
    
    Context: {context}`;

    const prompt = PromptTemplate.fromTemplate(`${systemPrompt}\n\nQuestion: {question}\nAnswer:`);

    const chain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const retrievedDocs = await retriever.getRelevantDocuments(question);
    const answer = await chain.invoke(question);
    
    const sources = Array.from(new Set(retrievedDocs.map(doc => doc.metadata.source)));

    res.json({ answer, sources });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Failed to process question" });
  }
});

// Vite Middleware
async function startServer() {
  // Init vector store in background
  initVectorStore().catch(console.error);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
