import express from "express";
import dotenv from "dotenv";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";

dotenv.config();

//cors
import cors from "cors";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

// Define zod request schema
const RequestSchema = z.object({
  topic: z.string(),
  audience: z.string(),
  tone: z.enum(["formal", "casual", "humorous"]),
  length: z.enum(["short", "medium", "long"]),
});

type GenerateContentRequest = z.infer<typeof RequestSchema>;

// Define zodresponse schema
const responseSchema = z.object({
  title: z.string(),
  content: z.string(),
});

async function generateContent(
  params: GenerateContentRequest,
  res: express.Response
) {
  const { topic, audience, tone, length } = RequestSchema.parse(params);

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
    schema: responseSchema,
  });

  // Set headers for streaming
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Stream the partial objects
  for await (const partialObject of partialObjectStream) {
    res.write(`data: ${JSON.stringify(partialObject)}\n\n`);
  }

  res.write("data: [DONE]\n\n");
  res.end();
}

app.post("/generate-content", async (req, res) => {
  try {
    const params = RequestSchema.parse(req.body);
    await generateContent(params, res);
  } catch (error) {
    console.error("Ett fel har inträffat:", error);
    res.status(500).json({ error: "Ett internt serverfel inträffade" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server körs på port ${PORT}`);
});
