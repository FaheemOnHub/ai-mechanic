import dotenv from "dotenv";
import OpenAI from "openai";
import express from "express";
import mongoose, { model } from "mongoose";
import cors from "cors";
import fs from "fs/promises";
import ModelClient from "@azure-rest/ai-inference";
import { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import multer from "multer";
dotenv.config();
const token = process.env.GITHUB_TOKEN;

const endpoint = "https://models.inference.ai.azure.com";
const modelName = "text-embedding-3-small";
const client = new OpenAI({ baseURL: endpoint, apiKey: token });
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
app.use(express.json());
import OBDCode from "./models/OBDcodes.js";
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const azureClient = new ModelClient(endpoint, new AzureKeyCredential(token));
const openAIClient = new OpenAI({ baseURL: endpoint, apiKey: token });

async function batchEmbedAndInsert() {
  try {
    const data = await fs.readFile("data.json", "utf8");
    const obdData = JSON.parse(data);

    const textsToEmbed = obdData.map(
      (item) =>
        `OBD_CODE: ${item.OBD_Code}\n` +
        `Meaning: ${item.Meaning}\n` +
        `Cause: ${item.Cause.join(", ")}\n` +
        `Symptoms: ${item.Symptoms.join(", ")}`
    );

    const response = await azureClient.path("/embeddings").post({
      body: {
        input: textsToEmbed,
        model: modelName,
      },
    });

    if (isUnexpected(response)) {
      throw new Error(`Unexpected response: ${response.status}`);
    }

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
    console.error("Error in batchEmbedAndInsert:", error);
    throw error;
  }
}

app.get("/", (req, res) => {
  res.status(200).send("OBD Code Server is running");
});

app.get("/run-batch", async (req, res) => {
  try {
    await batchEmbedAndInsert();
    res.status(200).json({ message: "Batch process completed successfully" });
  } catch (error) {
    console.error("Error in /run-batch:", error);
    res
      .status(500)
      .json({ error: "An error occurred during the batch process" });
  }
});
app.post("/query-with-image", upload.single("image"), async (req, res) => {
  try {
    let { userInput, conversationHistory = [] } = req.body;
    conversationHistory = JSON.parse(conversationHistory);
    const imageBuffer = req.file.buffer;
    console.log("query-with-image is called");
    let imageDescription = "";
    if (imageBuffer) {
      const imageRecognitionResponse = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert car mechanic AI assistant with comprehensive knowledge of OBD-II codes, their meanings, and potential diagnoses.
              The user has provided an image which may be a part of a vehicle or image related to vehicle, Gather as much information from that as you can later user may ask questions related to that image.Based on the context above and the user's input, please provide:
        1. An explanation of the most likely issue, using simple language.
        2. Possible causes of the issue.
        3. Suggested diagnostic steps.
        4. Recommended solutions.
         If the user asks about the image or its description, make sure to give detailed and accurate information about the components in the image, and avoid saying that you cannot analyze the image directly.
        Make your response clear and helpful, and avoid using overly technical language. If the user's input doesn't seem to match any of the provided OBD codes, please say so and offer general automotive troubleshooting advice instead.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userInput,
              },
              {
                type: "image_url",
                image_url: {
                  url: getImageDataUrl(imageBuffer, "jpeg"),
                  details: "low", // Change if needed
                },
              },
            ],
          },
        ],
        model: "gpt-4o-mini",
      });
      imageDescription = imageRecognitionResponse.choices[0].message.content;

      const imageOutput = {
        role: "assistant",
        content: imageDescription,
      };

      // console.log(imageDescription);
      // const userInputEmbedding = await azureClient.path("/embeddings").post({
      //   body: {
      //     input: userInput + imageDescription,
      //     model: modelName,
      //   },
      // });

      // if (isUnexpected(userInputEmbedding)) {
      //   throw new Error(`Unexpected response: ${userInputEmbedding.status}`);
      // }

      // const userEmbedding = userInputEmbedding.body.data[0].embedding;
      // const allOBDCodes = await OBDCode.find({});

      // const similarityScores = allOBDCodes.map((obdCode) => ({
      //   obdCode,
      //   similarity: cosineSimilarity(obdCode.embedding, userEmbedding),
      // }));

      // similarityScores.sort((a, b) => b.similarity - a.similarity);
      // const topSimilarOBDs = similarityScores.slice(0, 3);

      // const context = topSimilarOBDs
      //   .map(
      //     ({ obdCode }) =>
      //       `OBD Code: ${obdCode.OBD_CODE}\n` +
      //       `Meaning: ${obdCode.Meaning}\n` +
      //       `Cause: ${obdCode.Cause.join(", ")}\n` +
      //       `Symptoms: ${obdCode.Symptoms.join(", ")}`
      //   )
      //   .join("\n\n");

      // const systemMessage = {
      //   role: "system",
      //   content: `You are an expert car mechanic AI assistant with comprehensive knowledge of OBD-II codes, their meanings, and potential diagnoses. You are also capable of analyzing image descriptions provided by the user.\n' +
      // 'If the user mentions an uploaded image or asks about it, check for the image description and answer based on that. Do not state that you cannot analyze images directly.\n' +
      // 'Using semantic search, the database found the following problems similar to what the user described:

      //   ${context}
      //   Additionally, the user described an image with the following description: "${imageDescription}"
      //   Based on the context above and the user's input, please provide:
      //   1. An explanation of the most likely issue, using simple language.
      //   2. Possible causes of the issue.
      //   3. Suggested diagnostic steps.
      //   4. Recommended solutions.
      //    'If the user asks about the image or its description, make sure to give detailed and accurate information about the components in the image, and avoid saying that you cannot analyze the image directly.'
      //   Make your response clear and helpful, and avoid using overly technical language. If the user's input doesn't seem to match any of the provided OBD codes, please say so and offer general automotive troubleshooting advice instead.`,
      // };

      const userMessage = {
        role: "user",
        content: `A vehicle user reported the following problem: "${userInput}"`,
      };

      const messages = [...conversationHistory, imageOutput, userMessage];
      console.log(messages);
      // const response = await openAIClient.chat.completions.create({
      //   messages: messages,
      //   temperature: 0.4,
      //   top_p: 1.0,
      //   max_tokens: 1000,
      //   model: "gpt-4o-mini",
      // });

      // const generatedText = response.choices[0].message.content;
      const assistantMessage = {
        role: "assistant",
        content: imageDescription,
      };

      res.status(200).json({
        response: imageDescription,
      });
    }
  } catch (error) {
    console.error("Error in /query-with-image:", error);
    res
      .status(500)
      .json({ error: "An error occurred during the query process" });
  }
});

app.post("/query", async (req, res) => {
  console.log("queryx is called");
  try {
    const { userInput, conversationHistory = [] } = req.body;

    const userInputEmbedding = await azureClient.path("/embeddings").post({
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

    const similarityScores = allOBDCodes.map((obdCode) => ({
      obdCode,
      similarity: cosineSimilarity(obdCode.embedding, userEmbedding),
    }));

    similarityScores.sort((a, b) => b.similarity - a.similarity);
    const topSimilarOBDs = similarityScores.slice(0, 3);

    const context = topSimilarOBDs
      .map(
        ({ obdCode }) =>
          `OBD Code: ${obdCode.OBD_CODE}\n` +
          `Meaning: ${obdCode.Meaning}\n` +
          `Cause: ${obdCode.Cause.join(", ")}\n` +
          `Symptoms: ${obdCode.Symptoms.join(", ")}`
      )
      .join("\n\n");

    const systemMessage = {
      role: "system",
      content: `You are an expert car mechanic AI assistant with comprehensive knowledge of OBD-II codes, their meanings, and potential diagnoses.
    
      Using semantic search, the database found the following problems similar to what the user described:
      
      ${context}
      
      Based on the context above and the user's input, please provide:
      1. An explanation of the most likely issue, using simple language.
      2. Possible causes of the issue.
      3. Suggested diagnostic steps.
      4. Recommended solutions.
      
      Make your response clear and helpful, and avoid using overly technical language. If the user's input doesn't seem to match any of the provided OBD codes, please say so and offer general automotive troubleshooting advice instead.`,
    };

    const userMessage = {
      role: "user",
      content: `A vehicle user reported the following problem: "${userInput}"`,
    };

    const messages = [...conversationHistory, systemMessage, userMessage];

    const response = await openAIClient.chat.completions.create({
      messages: messages,
      temperature: 0.7,
      top_p: 1.0,
      max_tokens: 1000,
      model: "gpt-4o-mini",
    });

    const generatedText = response.choices[0].message.content;
    const assistantMessage = {
      role: "assistant",
      content: generatedText,
    };

    res.status(200).json({
      response: generatedText,
    });
  } catch (error) {
    console.error("Error in /query:", error);
    res
      .status(500)
      .json({ error: "An error occurred during the query process" });
  }
});
function getImageDataUrl(imageBuffer, imageFormat) {
  const imageBase64 = imageBuffer.toString("base64");
  return `data:image/${imageFormat};base64,${imageBase64}`;
}
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
