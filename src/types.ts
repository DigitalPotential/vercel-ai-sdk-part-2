import { z } from "zod";

export const RequestSchema = z.object({
  topic: z.string(),
  audience: z.string(),
  tone: z.enum(["formal", "casual", "humorous"]),
  length: z.enum(["short", "medium", "long"]),
});

export type GenerateContentRequest = z.infer<typeof RequestSchema>;

export const ResponseSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export type GeneratedContent = z.infer<typeof ResponseSchema>;
