


import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import Groq from "groq-sdk";
import Tesseract from "tesseract.js";
import { response } from "express";

// =====================
// INITIALIZE CLIENTS
// =====================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// =====================
// CONTROLLER
// =====================
export const startChatController = async (req, res) => {
  const filePath = req.file?.path;

  try {
    const { text } = req.body;
    const file = req.file;

    if (!text) {
      return res.status(400).json({ error: "Question is required" });
    }

    const SYSTEM_PROMPT_IMAGE = `
You are Aura AI.
The user has uploaded an IMAGE.
Answer strictly based on the content visible in the image.
Explain clearly in simple language.
Do NOT assume anything outside the image.
If something is unclear, say it explicitly.
`;

    const SYSTEM_PROMPT_TEXT = `
You are Aura AI, a document-based assistant.
Answer clearly and accurately using provided context only.
`;

    const embeddingModel = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });

    const index = pc.index(process.env.PINECONE_INDEX);

    let extractedText = "";

    /* -------------------------------------------
       STEP 1: IMAGE → OCR
    -------------------------------------------- */
    if (file) {
      const ocrResult = await Tesseract.recognize(filePath, "eng");
      extractedText = ocrResult?.data?.text?.trim() || "";
    }

    /* -------------------------------------------
       STEP 2: IMAGE + QUESTION → IMAGE QA
    -------------------------------------------- */
    if (file) {
      if (!extractedText || extractedText.length < 10) {
        return res.status(200).json({
          success: true,
          answer:
            "I can see an image, but I am unable to clearly read text from it. Please upload a clearer image or describe what you want to understand.",
          mode: "image-ocr-failed",
        });
      }

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT_IMAGE },
          {
            role: "user",
            content: `
Extracted text from image:
${extractedText}

User question:
${text}
            `,
          },
        ],
      });

      /* Optional: store image text for future retrieval */
      const imageEmbedding = await embeddingModel.embedContent(extractedText);

      await index.upsert([
        {
          id: `image-${Date.now()}`,
          values: imageEmbedding.embedding.values,
          metadata: {
            description: extractedText,
            source: "image",
            fileName: file.originalname,
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        answer: completion.choices[0].message.content,
        mode: "image-explain",
      });
    }

    /* -------------------------------------------
       STEP 3: TEXT ONLY → VECTOR SEARCH
    -------------------------------------------- */
    const queryEmbedding = await embeddingModel.embedContent(text);

    const searchResult = await index.query({
      vector: queryEmbedding.embedding.values,
      topK: 3,
      includeMetadata: true,
    });

    const matches = searchResult.matches || [];
    const bestMatch = matches[0];
    const SIMILARITY_THRESHOLD = 0.75;

    /* -------------------------------------------
       STEP 4: LOW SIMILARITY → DIRECT LLM
    -------------------------------------------- */
    if (!bestMatch || bestMatch.score < SIMILARITY_THRESHOLD) {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT_TEXT },
          { role: "user", content: text },
        ],
      });

      return res.status(200).json({
        success: true,
        answer: completion.choices[0].message.content,
        mode: "direct-llm",
      });
    }

    /* -------------------------------------------
       STEP 5: STRONG MATCH → RAG
    -------------------------------------------- */
    const context = matches
      .map(m => m.metadata?.description)
      .join("\n\n---\n\n");

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT_TEXT },
        {
          role: "user",
          content: `
Context:
${context}

Question:
${text}

Answer strictly from the context.
If not found, say:
"I don't have enough information in the document."
          `,
        },
      ],
    });

    return res.status(200).json({
      success: true,
      answer: completion.choices[0].message.content,
      mode: "rag",
      similarityScore: bestMatch.score,
    });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

export const chatTestController = async (req, res) => {
  try {
    const text = req.body.inputText;
    if (!text) {
      return res.status(400).json({ error: "Question is required" });
    }
    const SYSTEM_PROMPT = `
You are Aura AI, an intelligent coding assistant.

Branding rules:
- Aura AI is a product created and maintained by Yashif Khan.
- For branding and display purposes, refer to the creator as:
  "Yashif – AI/ML Engineer".
- Do NOT evaluate, correct, or debate this attribution.
`;

const isSystemQuery = (text) => {
  const systemPatterns = [
    "who are you",
    "what are you",
    "your name",
    "about you",
    "who developed you",
    "help",
    "hi",
    "hello",
  ];

  const lower = text.toLowerCase().trim();
  return systemPatterns.some(p => lower.includes(p));
};
    // 🧠 GATE 1: System / generic queries
    if (isSystemQuery(text)) {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
      });

      return res.status(200).json({
        success: true,
        answer: completion.choices[0].message.content,
        mode: "system-chat",
      });
    }

    // 🧠 GATE 2: Vector search only when needed
    const embeddingModel = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });

    const queryEmbedding = await embeddingModel.embedContent(text);
    const index = pc.index(process.env.PINECONE_INDEX);
    const searchResult = await index.query({
      vector: queryEmbedding.embedding.values,
      topK: 3,
      includeMetadata: true,
    });

    const bestMatch = searchResult.matches?.[0];
    const SIMILARITY_THRESHOLD = 0.75;

    // ❌ Weak or irrelevant match → Direct LLM
    if (!bestMatch || bestMatch.score < SIMILARITY_THRESHOLD) {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          // { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
      });

      return res.status(200).json({
        success: true,
        answer: completion.choices[0].message.content,
        mode: "direct-llm",
      });
    }

    // ✅ Strong match → RAG
    const context = searchResult.matches
      .map(m => m.metadata.description)
      .join("\n\n---\n\n");

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `
Context:
${context}

Question:
${text}
          `,
        },
      ],
    });

    return res.status(200).json({
      success: true,
      answer: completion.choices[0].message.content,
      mode: "rag",
    });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};



