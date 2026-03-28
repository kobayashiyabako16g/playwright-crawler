import { GoogleGenAI } from "@google/genai";

// 環境変数から設定を取得
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID;
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
const MODEL_NAME = process.env.GENERATIVE_MODEL_NAME || "gemini-2.0-flash";

if (!PROJECT_ID) {
  throw new Error("GOOGLE_CLOUD_PROJECT または GCP_PROJECT_ID 環境変数を設定してください");
}

// Vertex AI クライアントを初期化
const vertexAI = new GoogleGenAI({
  vertexai: true,
  project: PROJECT_ID,
  location: LOCATION,
  apiVersion: "v1",
});

// テキスト生成
export async function generateText(prompt: string): Promise<string> {
  const response = await vertexAI.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });

  if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
    return response.candidates[0].content.parts[0].text;
  }

  throw new Error("レスポンスの取得に失敗しました");
}

// JSON形式でパース結果を取得
export async function generateJSON<T>(prompt: string): Promise<T> {
  const response = await vertexAI.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
    return JSON.parse(response.candidates[0].content.parts[0].text) as T;
  }

  throw new Error("JSONレスポンスの取得に失敗しました");
}

export { vertexAI };
