import { VertexAI, GenerativeModel } from "@google-cloud/vertexai";

// 環境変数から設定を取得
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID;
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "asia-northeast1";

if (!PROJECT_ID) {
  throw new Error("GOOGLE_CLOUD_PROJECT または GCP_PROJECT_ID 環境変数を設定してください");
}

// Vertex AI クライアントを初期化
const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
});

// Gemini モデルを取得
export function getGenerativeModel(modelName: string = "gemini-2.0-flash-001"): GenerativeModel {
  return vertexAI.getGenerativeModel({
    model: modelName,
  });
}

// テキスト生成
export async function generateText(prompt: string): Promise<string> {
  const model = getGenerativeModel();
  const result = await model.generateContent(prompt);
  const response = result.response;

  if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
    return response.candidates[0].content.parts[0].text;
  }

  throw new Error("レスポンスの取得に失敗しました");
}

// JSON形式でパース結果を取得
export async function generateJSON<T>(prompt: string): Promise<T> {
  const model = getGenerativeModel();
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const response = result.response;

  if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
    return JSON.parse(response.candidates[0].content.parts[0].text) as T;
  }

  throw new Error("JSONレスポンスの取得に失敗しました");
}

export { vertexAI };
