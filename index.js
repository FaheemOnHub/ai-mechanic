import dotenv from "dotenv";
import OpenAI from "openai";
import express from "express";
import mongoose, { model } from "mongoose";
import cors from "cors";
import fs from "fs/promises";
import ModelClient from "@azure-rest/ai-inference";
import { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
dotenv.config();
const token = process.env.GITHUB_TOKEN;

const endpoint = "https://models.inference.ai.azure.com";
const modelName = "text-embedding-3-small";

const app = express();
app.use(cors());
app.use(express.json());
import OBDCode from "./models/OBDcodes.js";
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));
const client = new ModelClient(endpoint, new AzureKeyCredential(token));
const clientContext = new OpenAI({ baseURL: endpoint, apiKey: token });
async function batchEmbedAndInsert() {
  try {
    // Read the JSON file
    const data = await fs.readFile("data.json", "utf8");
    const obdData = JSON.parse(data);

    // Prepare data for embedding
    const textsToEmbed = obdData.map(
      (item) =>
        `OBD_CODE: ${item.OBD_Code}\n` +
        `Meaning: ${item.Meaning}\n` +
        `Cause: ${item.Cause.join(", ")}\n` +
        `Symptoms: ${item.Symptoms.join(", ")}`
    );

    // Perform batch embedding
    const response = await client.path("/embeddings").post({
      body: {
        input: textsToEmbed,
        model: modelName,
      },
    });
    if (isUnexpected(response)) {
      throw new Error(`Unexpected response: ${response.status}`);
    }
    // Insert data into the database
    const insertPromises = obdData.map((item, index) => {
      const doc = new OBDCode({
        OBD_CODE: item.OBD_CODE,
        Meaning: item.Meaning,
        Cause: item.Cause,
        Symptoms: item.Symptoms,
        embedding: response.body.data[index].embedding,
      });
      return doc.save();
    });

    await Promise.all(insertPromises);

    console.log(
      `Inserted ${obdData.length} OBD codes with embeddings into the database.`
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

app.get("/", (req, res) => {
  console.log("hello");
  res.status(200).send("hello i am alive");
});
app.get("/run-batch", async (req, res) => {
  try {
    await batchEmbedAndInsert();
    res.status(200).json({ message: "Batch process completed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred during the batch process" });
  }
});
app.post("/query", async (req, res) => {
  const { userInput, conversationHistory = [] } = req.body;
  const userInputEmbedding = await client.path("/embeddings").post({
    body: {
      input: userInput,
      model: modelName,
    },
  });
  if (isUnexpected(userInputEmbedding)) {
    throw new Error(`Unexpected response: ${userInputEmbedding.status}`);
  }
  const userEmbedding = userInputEmbedding.body.data[0].embedding;
  const allOBDCodes = await OBDCode.find({});
  const similarityScores = allOBDCodes.map((obdCode) => {
    const similarity = cosineSimilarity(obdCode.embedding, userEmbedding);
    return { obdCode, similarity };
  });
  similarityScores.sort((a, b) => b.similarity - a.similarity);
  const mostSimilarOBD = similarityScores[0].obdCode;

  const context =
    `OBD Code: ${mostSimilarOBD.OBD_CODE}\n` +
    `Meaning: ${mostSimilarOBD.Meaning}\n` +
    `Cause: ${mostSimilarOBD.Cause.join(", ")}\n` +
    `Symptoms: ${mostSimilarOBD.Symptoms.join(", ")}`;

  const systemMessage = {
    role: "system",
    content: `You are an expert car mechanic AI assistant with comprehensive knowledge of OBD-II codes, their meanings, and potential diagnoses.
    
    Using semantic search, the database found a problem similar to what the user described:
    Using semantic search the database found the problem given by user is similar to this OBD but not sure if this is correct:
OBD Code: ${mostSimilarOBD.OBD_CODE}
Meaning: ${mostSimilarOBD.Meaning}
Cause: ${mostSimilarOBD.Cause.join(", ")}
Symptoms: ${mostSimilarOBD.Symptoms.join(", ")}

    Based on the context above, please provide:
    1. An explanation of the issue, using simple language.
    2. Possible causes of the issue.
    3. Suggested diagnostic steps.
    4. Recommended solutions.

    Make your response clear and helpful, and avoid using overly technical language.`,
  };
  const userMessage = {
    role: "user",
    content: `A vehicle user reported the following problem: "${userInput}"`,
  };
  const messages = [...conversationHistory, systemMessage, userMessage];
  const response = await clientContext.chat.completions.create({
    messages: messages,
    temperature: 1.0,
    top_p: 1.0,
    max_tokens: 1000,
    model: "gpt-4o-mini",
  });

  const generatedText = response.choices[0].message.content;
  const assistantMessage = {
    role: "assistant",
    content: generatedText,
  };
  // Step 4: Send the response back to the user
  res.status(200).json({
    response: generatedText,
    conversationHistory: [...messages, assistantMessage],
  });
});
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
app.listen(3000, () => console.log("Server is running on port 3000"));
