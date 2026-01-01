import dotenv from "dotenv";
dotenv.config(); // Move this to the very top

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import fs from "fs";

// Now this will correctly see your API Key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });


export const startChatController = async (req, res) => {
  const filePath = req.file?.path; // Store path for cleanup

  try {
    const { text } = req.body;
    const apiKey = process.env.GEMINI_KEY;
    const file = req.file;

    if (!file) return res.status(400).send("No file uploaded.");
    if (!apiKey) return res.status(500).json({ error: "API Key missing." });

    const genAI = new GoogleGenerativeAI(apiKey);

    
    // 1. Vision Extraction
    // const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const visionModel = genAI.getGenerativeModel({model: "gemini-3-flash-preview" });
    
    // console.log("gen ai visionModel ",visionModel);
    
    const imageParts = [{
      inlineData: {
        data: fs.readFileSync(filePath).toString("base64"),
        mimeType: file.mimetype,
      },
    }];

    const visionPrompt = `Extract all text and describe visual elements. Context: ${text}`;
    const visionResult = await visionModel.generateContent([visionPrompt, ...imageParts]);
    const extractedDescription = visionResult.response.text();

    // 2. Embedding Generation
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await embeddingModel.embedContent(extractedDescription);
    const vectorValues = embeddingResult.embedding.values;

    // 3. Pinecone Upsert
    const index = pc.index(process.env.PINECONE_INDEX);
    await index.upsert([{
      id: `${Date.now()}-${file.originalname}`,
      values: vectorValues,
      metadata: { 
        description: extractedDescription, 
        fileName: file.originalname 
      }
    }]);

    res.status(200).json({
      success: true,
      description: extractedDescription,
    });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    // Always delete the file, even if the try block fails
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};