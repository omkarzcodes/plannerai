import { GoogleGenAI, type Schema } from "@google/genai";
import { env } from "../config/env.js";
import { AppError } from "./errors.js";

const genai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export const GEMINI_MODEL = "gemini-2.5-flash";

export async function generateStructured<T>(params: {
  prompt: string;
  schema: Schema;
  systemInstruction?: string;
}): Promise<T> {
  try {
    const response = await genai.models.generateContent({
      model: GEMINI_MODEL,
      contents: params.prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: params.schema,
        ...(params.systemInstruction && {
          systemInstruction: params.systemInstruction,
        }),
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    return JSON.parse(text) as T;
  } catch (err) {
    console.error("Gemini request failed:", err);
    throw new AppError(
      "AI service is temporarily unavailable. Please try again.",
      502,
    );
  }
}
