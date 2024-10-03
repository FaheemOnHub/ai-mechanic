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
  const { userInput } = req.body;
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

  //   const prompt = `You have to  act as an expert car mechanic AI assistant with comprehensive knowledge of OBD-II codes, their meanings, and potential diagnoses. When presented with car-related issues, You will follow these steps:

  // Identify the specific OBD-II code (if provided) or issue based on the user's description.
  // Provide the name and a brief explanation of the code or issue.
  // Suggest possible causes and diagnostic steps.
  // Recommend potential solutions or next steps for the user.

  // You will prioritize safety and recommend professional inspection when dealing with critical systems like brakes or airbags.
  // Importantly, You will recognize that the user may or may not provide an OBD-II code. In cases where no code is given, You  will use the context provided and my knowledge base to offer the most accurate and helpful response possible. You will analyze the symptoms or issues described by the user to narrow down potential causes and provide relevant advice.
  // You are  ready to assist with car-related queries, whether they include specific OBD-II codes or just descriptions of problems or symptoms. You will do my best to provide accurate, helpful, and safety-conscious advice in all cases.
  // A vehicle user reported the following problem: "${userInput}". Provide a helpful response using the context below:\n${context}`;
  //   const generatedResponse = await client.path("/completions").post({
  //     body: {
  //       model: "gpt-4o",
  //       prompt,
  //       max_tokens: 300,
  //     },
  //   });
  //   const prompt = `
  // You are an expert car mechanic AI assistant with comprehensive knowledge of OBD-II codes, their meanings, and potential diagnoses. You help users with car-related issues and provide them with detailed but easy-to-understand explanations.

  // A vehicle user reported the following problem: "${userInput}".

  // Context:
  // OBD Code: ${mostSimilarOBD.OBD_CODE}
  // Meaning: ${mostSimilarOBD.Meaning}
  // Cause: ${mostSimilarOBD.Cause.join(", ")}
  // Symptoms: ${mostSimilarOBD.Symptoms.join(", ")}

  // Based on the context above, please provide:
  // 1. An explanation of the issue, using simple language.
  // 2. Possible causes of the issue.
  // 3. Suggested diagnostic steps.
  // 4. Recommended solutions.

  // Make your response clear and helpful, and avoid using overly technical language.
  // `;

  //   const generatedResponse = await client.path("/completions").post({
  //     body: {
  //       model: "gpt-4o-mini",
  //       prompt,
  //       max_tokens: 400, // Increased max_tokens for more detailed output
  //       temperature: 0.7, // Adjusted to control the creativity of the response
  //     },
  //   });

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
    messages: [
      {
        role: "system",
        content: `You are an expert car mechanic AI assistant with comprehensive knowledge of OBD-II codes, their meanings, and potential diagnoses. You help users with car-related issues and provide them with detailed but easy-to-understand explanations.



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
      },
      {
        role: "user",
        content: `A vehicle user reported the following problem: "${userInput}`,
      },
    ],
    temperature: 1.0,
    top_p: 1.0,
    max_tokens: 1000,
    model: "gpt-4o-mini",
  });
  //   if (isUnexpected(response)) {
  //     throw new Error(`Unexpected response: ${response.status}`);
  //   }
  //   const generatedText = generatedResponse.body.choices[0].text;
  const generatedText = response.choices[0].message.content;

  // Step 4: Send the response back to the user
  res.status(200).json({ response: generatedText });
});
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
app.listen(3000, () => console.log("Server is running on port 3000"));
