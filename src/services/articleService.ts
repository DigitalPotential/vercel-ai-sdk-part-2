import { PrismaClient } from "@prisma/client";
import { GenerateContentRequest, GeneratedContent } from "../types.js";

const prisma = new PrismaClient();

export async function saveArticleToDatabase(
  requestData: GenerateContentRequest,
  generatedContent: GeneratedContent
) {
  try {
    const { topic, audience, tone, length } = requestData;
    const savedArticle = await prisma.article.create({
      data: {
        topic,
        audience,
        tone,
        length,
        title: generatedContent.title,
        content: generatedContent.content,
      },
    });
    console.log("Article saved successfully:", savedArticle.id);
    return savedArticle;
  } catch (error) {
    console.error("Error saving to database:", error);
    throw error;
  }
}
