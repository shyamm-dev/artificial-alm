import { getServerSession } from "@/lib/get-server-session";
import { tryCatch } from "@/lib/try-catch";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

interface ResponseSchema {
  type: string;
  properties: Record<string, unknown>;
  required?: string[];
}

interface GenerationConfig {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  thinkingConfig?: { thinkingBudget: number };
  safetySettings?: Array<{ category: HarmCategory; threshold: HarmBlockThreshold }>;
  systemInstruction?: { parts: Array<{ text: string }> };
  responseMimeType?: string;
  responseSchema?: ResponseSchema;
}

interface GenerateContentRequest {
  contents: Array<{ role?: string; parts: Array<{ text: string }> }>;
  config?: GenerationConfig;
  model?: string;
}

class AIClient {
  private ai: GoogleGenAI;
  private model = 'gemini-2.5-flash';
  private defaultConfig: GenerationConfig = {
    maxOutputTokens: 65535,
    temperature: 1,
    topP: 0.95,
    thinkingConfig: { thinkingBudget: -1 },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.OFF },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.OFF },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.OFF },
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.OFF },
    ],
  };

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY!, vertexai: true });
  }

  public async generateContent(request: GenerateContentRequest) {
    return tryCatch(
      (async () => {
        const session = await getServerSession();
        if (!session) throw new Error("No valid session available");

        const config = { ...this.defaultConfig, ...request.config };
        if (request.config?.responseSchema) {
          config.responseMimeType = 'application/json';
        }

        const req = {
          model: request.model || this.model,
          contents: request.contents,
          config,
        };

        const response = await this.ai.models.generateContent(req);
        return response;
      })()
    );
  }
}

// Export singleton instance
export const aiClient = new AIClient();
