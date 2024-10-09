import express from "express";
import dotenv from "dotenv";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { saveArticleToDatabase } from "./services/articleService.js";
import cors from "cors";
import { GenerateContentRequest, RequestSchema, ResponseSchema, GeneratedContent } from "./types.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

async function generateContent(
  requestData: GenerateContentRequest,
  res: express.Response
) {
  const { topic, audience, tone, length } = requestData;

  const systemPrompt = `
  Du är en expert på att skriva artiklar.
   `;

  const prompt = `
  Du ska skriva en artikel om ${topic}.
  Målgrupp: ${audience}
  ton: ${tone}
  längd: ${length}
  `;

  const { partialObjectStream } = await streamObject({
    model: openai("gpt-4o"),
    prompt: prompt,
    system: systemPrompt,
    schema: ResponseSchema,
  });

  // Set headers for streaming
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  let generatedContent: GeneratedContent = { title: "", content: "" };

  // Stream the partial objects
  for await (const partialObject of partialObjectStream) {
    res.write(`data: ${JSON.stringify(partialObject)}\n\n`);
    generatedContent = { ...generatedContent, ...partialObject };
  }

  // Save the data to the database
  try {
    await saveArticleToDatabase(requestData, generatedContent);
  } catch (error) {
    console.error("Failed to save article:", error);
  }

  res.write("data: [DONE]\n\n");
  res.end();
}

app.post("/generate-content", async (req, res) => {
  try {
    const requestData = RequestSchema.parse(req.body);
    await generateContent(requestData, res);
  } catch (error) {
    console.error("Ett fel har inträffat:", error);
    res.status(500).json({ error: "Ett internt serverfel inträffade" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server körs på port ${PORT}`);
});
