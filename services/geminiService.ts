import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, ChartDataPoint, RecommendationItem, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to extract JSON from markdown code blocks
const extractJson = (text: string): any | null => {
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("Failed to parse extracted JSON", e);
    }
  }
  // Fallback: try to find the first '{' and last '}'
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    try {
      return JSON.parse(text.substring(start, end + 1));
    } catch (e) {
      console.error("Failed to parse loose JSON", e);
    }
  }
  
  // Array fallback
  const startArr = text.indexOf('[');
  const endArr = text.lastIndexOf(']');
  if (startArr !== -1 && endArr !== -1) {
    try {
      return JSON.parse(text.substring(startArr, endArr + 1));
    } catch (e) {
      console.error("Failed to parse loose JSON Array", e);
    }
  }
  return null;
};

export const fetchMarketInsights = async (): Promise<AnalysisResult> => {
  try {
    const prompt = `
      Act as a senior market analyst for the Kenyan e-commerce sector.
      Using Google Search, find the latest data on online purchasing behaviors in Kenya for this year.
      
      I need two things:
      1. A detailed text summary of the current market trends, popular niches, and consumer behavior.
      2. A JSON array representing the "Top 5 Online Shopping Categories by Market Share (%)".
      
      Format the output as follows:
      [Analysis Text]
      
      \`\`\`json
      [
        { "name": "Category Name", "value": 25 },
        ...
      ]
      \`\`\`
      
      Ensure the JSON values are numbers representing percentages.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // We do NOT set responseMimeType to JSON because we are using tools and want a text summary too.
      },
    });

    const text = response.text || "No response generated.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Filter chunks to get sources
    const sources: GroundingSource[] = chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({ web: c.web }));

    const extractedData = extractJson(text);
    const chartData: ChartDataPoint[] = Array.isArray(extractedData) ? extractedData : [];

    // Remove the JSON block from text for display purposes
    const cleanText = text.replace(/```json[\s\S]*?```/g, '').trim();

    return {
      text: cleanText,
      chartData,
      sources
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch market insights.");
  }
};

export const fetchImportRecommendations = async (specificCategory?: string): Promise<AnalysisResult> => {
  try {
    const categoryPrompt = specificCategory ? `focusing specifically on ${specificCategory}` : `across popular categories`;
    const prompt = `
      Act as an import/export consultant.
      Using Google Search, identify 6 highly profitable items to import from China to Kenya right now, ${categoryPrompt}.
      Consider: AliExpress/Alibaba pricing, shipping to Nairobi/Mombasa, customs, and local Kenyan resale prices.
      
      Output:
      1. A brief strategic overview of the import opportunity.
      2. A JSON array of recommended items.
      
      Format the JSON exactly like this:
      \`\`\`json
      [
        {
          "id": "1",
          "productName": "Example Item",
          "category": "Electronics",
          "estimatedMargin": "50-70%",
          "demandLevel": "High",
          "reasoning": "Short explanation of why this sells well in Kenya."
        }
      ]
      \`\`\`
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No recommendations generated.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: GroundingSource[] = chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({ web: c.web }));

    const extractedData = extractJson(text);
    const recommendations: RecommendationItem[] = Array.isArray(extractedData) ? extractedData : [];

    const cleanText = text.replace(/```json[\s\S]*?```/g, '').trim();

    return {
      text: cleanText,
      chartData: [],
      sources,
      recommendations
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch recommendations.");
  }
};
