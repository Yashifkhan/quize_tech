// import dotenv from "dotenv";
// dotenv.config(); // Move this to the very top
// import Tesseract from "tesseract.js";

// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { Pinecone } from "@pinecone-database/pinecone";
// import fs from "fs";

// // Now this will correctly see your API Key
// const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });


// export const startChatController = async (req, res) => {
//   // setupPinecone();
//   const filePath = req.file?.path; // Store path for cleanup
//   try {
//     const { text } = req.body;
//     const apiKey = process.env.GEMINI_KEY;
//     const file = req.file;
//     if (!file) return res.status(400).send("No file uploaded.");
//     if (!apiKey) return res.status(500).json({ error: "API Key missing." });
//     const genAI = new GoogleGenerativeAI(apiKey);

//     // const visionModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
//     // const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
//     // const visionModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview" });

//     const imageParts = [{
//       inlineData: {
//         data: fs.readFileSync(filePath).toString("base64"),
//         mimeType: file.mimetype,
//       },
//     }];

//     const result = await Tesseract.recognize(filePath, "eng");
// const extractedText = result.data.text;

//     const visionPrompt = `Extract all text and describe visual elements. Context: ${text}`;
//     // const visionResult = await visionModel.generateContent([visionPrompt, ...imageParts]);
//     // const extractedDescription = visionResult.response.text();

//     // const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
//     // const embeddingResult = await embeddingModel.embedContent(text);
//     // const vectorValues = embeddingResult.embedding.values;

//     // console.log("vectorValues",vectorValues);
//     const index = pc.index(process.env.PINECONE_INDEX);
//     console.log("text", text);

//     // const queryResponse = await index.query({
//     //   vector: vectorValues,
//     //   topK: 3,                // Number of results to return (top 3 matches)
//     //   includeMetadata: true,   // This returns the original text/description you stored
//     // });

//     const matches = queryResponse.matches.map(match => ({
//       score: match.score,
//       text: match.metadata.description,
//       fileName: match.metadata.fileName
//     }));

//     const contextText = queryResponse.matches
//       .map(match => match.metadata.description)
//       .join("\n\n---\n\n");

//     const finalPrompt = `
//   You are an expert career consultant and resume reviewer. 
//   Below is the data retrieved from a resume database. 
//   Use ONLY this context to answer the user's question.

//   ---
//   CONTEXT:
//   ${contextText}
//   ---

//   USER QUESTION: 
//   ${text}

//   INSTRUCTIONS:
//   - If the user asks for a score, evaluate the skills, projects, and education.
//   - Be professional and encouraging.
//   - If the information is not in the context, say "I don't have enough information in the documents to answer that."
// `;

//     // const result = await visionModel.generateContent(finalPrompt);
//     // console.log("Final Response:", result.response.text());
//     console.log("finalAnswer", finalAnswer);
//     // console.log("matches result",matches);

//     // await index.upsert([{
//     //   id: `${Date.now()}-${file.originalname}`,
//     //   values: vectorValues,
//     //   metadata: {
//     //     description: extractedDescription,
//     //     fileName: file.originalname
//     //   }
//     // }]);

//     res.status(200).json({
//       success: true,
//       // description: extractedDescription,
//     });

//   } catch (error) {
//     console.error("Gemini Error:", error);
//     res.status(500).json({ error: error.message });
//   } finally {
//     // Always delete the file, even if the try block fails
//     if (filePath && fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }
//   }
// };











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

    if (!file) return res.status(400).json({ error: "Image is required" });
    if (!text) return res.status(400).json({ error: "Question is required" });

    // =====================
    // STEP 1: IMAGE → TEXT (GEMINI VISION)
    // =====================
    


  const ocrResult = await Tesseract.recognize(filePath, "eng");
const extractedText = ocrResult.data.text;


    // =====================
    // STEP 2: DOCUMENT → EMBEDDING (GEMINI)
    // =====================
    const embeddingModel = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });

    const docEmbedding = await embeddingModel.embedContent(extractedText);

    // =====================
    // STEP 3: STORE IN PINECONE
    // =====================
    const index = pc.index(process.env.PINECONE_INDEX);

    await index.upsert([
      {
        id: `${Date.now()}-${file.originalname}`,
        values: docEmbedding.embedding.values,
        metadata: {
          description: extractedText,
          fileName: file.originalname,
        },
      },
    ]);

    // =====================
    // STEP 4: QUERY → EMBEDDING
    // =====================
    const queryEmbedding = await embeddingModel.embedContent(text);


    // =====================
    // STEP 5: VECTOR SEARCH
    // =====================
    const searchResult = await index.query({
      vector: queryEmbedding.embedding.values,
      topK: 3,
      includeMetadata: true,
    });

    const context = searchResult.matches
      .map((m) => m.metadata.description)
      .join("\n\n---\n\n");

      console.log("content",context);
      
    // =====================
    // STEP 6: FINAL ANSWER (GROQ LLM)
    // =====================
    const finalPrompt = `
You are a document-based assistant.
Answer ONLY using the context below.

CONTEXT:
${context}

USER QUESTION:
${text}

If the answer is not present, say:
"I don't have enough information in the document."
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: finalPrompt }],
    });

    const finalAnswer = completion.choices[0].message.content;

    // =====================
    // RESPONSE
    // =====================
    res.status(200).json({
      success: true,
      answer: finalAnswer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    // CLEANUP
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

    const embeddingModel = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });

    const queryEmbedding = await embeddingModel.embedContent(text);

    const indexName = process.env.PINECONE_INDEX;
    if (!indexName) {
      throw new Error("PINECONE_INDEX is missing");
    }

    const index = pc.index(indexName);

    const searchResult = await index.query({
      vector: queryEmbedding.embedding.values,
      topK: 3,
      includeMetadata: true,
    });

    if (!searchResult.matches.length) {
      return res.json({ answer: "No related data found." });
    }

    const context = searchResult.matches
      .map(m => m.metadata.description)
      .join("\n\n---\n\n");

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `
Context:
${context}

Question:
${text}
`
      }],
    });

    res.status(200).json({
      success: true,
      answer: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};



