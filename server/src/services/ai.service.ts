import OpenAI from "openai";
import { getPortfolioAIResponse } from "../utils/helpers";

export class AIService {
  private openai: OpenAI | null = null;
  private useOpenAI = false;

  constructor() {
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    const PORTFOLIO_MODE = process.env.PORTFOLIO_MODE !== "false";

    if (!PORTFOLIO_MODE && process.env.OPENAI_API_KEY?.startsWith("sk-")) {
      try {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.useOpenAI = true;
        console.log("🚀 OpenAI initialized - LIVE MODE");
      } catch (error) {
        console.log("❌ OpenAI failed, falling back to PORTFOLIO MODE");
        this.useOpenAI = false;
      }
    }
  }

  async getAIResponse(
    question: string,
    conversationKey: string,
    userName: string,
    otherUserName: string
  ): Promise<string> {
    if (!this.useOpenAI || !this.openai) {
      return getPortfolioAIResponse(question);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant in a chat between ${userName} and ${otherUserName}. Be brief and friendly.`,
          },
          {
            role: "user",
            content: `${userName}: ${question}`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      return (
        completion.choices[0]?.message?.content?.trim() ||
        getPortfolioAIResponse(question)
      );
    } catch (error) {
      console.error("OpenAI failed, using portfolio AI:", error);
      return getPortfolioAIResponse(question);
    }
  }

  getMode(): string {
    return this.useOpenAI ? "LIVE (OpenAI)" : "PORTFOLIO (Demo AI)";
  }
}

export const aiService = new AIService();
