import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, ChartDataPoint, RecommendationItem, GroundingSource, LogisticsDetails } from "../types";

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
      1. An **Executive Summary** of current market trends, popular niches, and consumer behavior. 
         - Use Markdown formatting.
         - Use bold headings for key sections.
         - Use bullet points for lists.
         - Keep it concise and professional.
      2. A JSON array representing the "Top 5 Online Shopping Categories by Market Share (%)".
      
      Format the output as follows:
      [Executive Summary Markdown]
      
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

export const fetchImportRecommendations = async (specificCategory?: string, country: string = "Kenya"): Promise<AnalysisResult> => {
  try {
    const isSpecific = specificCategory && specificCategory.trim().length > 0;
    
    let prompt;

    if (isSpecific) {
      // Detailed Deep Dive Prompt
      prompt = `
        Act as a specialist import/export consultant for the "${specificCategory}" market.
        Using Google Search, perform a deep-dive analysis for importing ${specificCategory} products from China to ${country}.
        
        I need a comprehensive report containing:
        1. A Detailed Strategic Analysis:
           - Target Audience: Who buys ${specificCategory} in ${country}?
           - Market Gaps: What specific features or types are missing or overpriced locally?
           - Logistics & Customs: Specific considerations for ${specificCategory} (e.g., volumetric weight, fragile handling, duty rates).
           - Marketing Strategy: How to sell these effectively.
        
        2. A JSON array of 6 specific recommended products within this category.
        
        Format the output as follows:
        [Detailed Analysis Text]
        
        \`\`\`json
        [
          {
            "id": "1",
            "productName": "Specific Product Name",
            "category": "Sub-category",
            "estimatedMargin": "e.g. 150% (Buy $5, Sell $12.50)",
            "demandLevel": "High",
            "reasoning": "Detailed explanation of why this specific SKU is a winner. Include price arbitrage details and specific demand drivers."
          }
        ]
        \`\`\`
      `;
    } else {
      // General Overview Prompt
      prompt = `
        Act as an import/export consultant.
        Using Google Search, identify 6 highly profitable items to import from China to ${country} right now across popular trending categories.
        Consider: AliExpress/Alibaba pricing, shipping to major cities in ${country}, customs, and local ${country} resale prices.
        
        Output:
        1. A brief strategic overview of the import opportunity in ${country}.
        2. A JSON array of recommended items.
        
        Format the output as follows:
        [Analysis Text]

        \`\`\`json
        [
          {
            "id": "1",
            "productName": "Example Item",
            "category": "Electronics",
            "estimatedMargin": "50-70%",
            "demandLevel": "High",
            "reasoning": "Short explanation of why this sells well in ${country}."
          }
        ]
        \`\`\`
      `;
    }

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

export const fetchLogisticsDetails = async (productName: string, category: string, country: string): Promise<LogisticsDetails> => {
  try {
    const prompt = `
      Act as a logistics expert for importing goods from China to ${country}.
      Perform a Google Search to find the current customs duties, taxes, and shipping rates for "${productName}" (Category: ${category}).
      Also find top 3 reliable freight forwarders or shipping agents operating the China to ${country} route.
      
      Output a JSON object with specific details:
      \`\`\`json
      {
        "customsDuty": "e.g. 25%",
        "vat": "e.g. 16%",
        "airFreightCost": "e.g. $10-12 per kg",
        "seaFreightCost": "e.g. $400 per CBM",
        "topForwarders": ["Agent A", "Agent B", "Agent C"],
        "estimatedLandedCostText": "A brief text explanation calculating the total landed cost for a hypothetical batch (e.g. 10 units) of ${productName}. Estimate purchase price if needed. Include item cost + shipping + duty + vat."
      }
      \`\`\`
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "{}";
    const data = extractJson(text);
    
    if (!data) throw new Error("Failed to parse logistics data");

    return {
        customsDuty: data.customsDuty || "Unknown",
        vat: data.vat || "Unknown",
        airFreightCost: data.airFreightCost || "Unknown",
        seaFreightCost: data.seaFreightCost || "Unknown",
        topForwarders: Array.isArray(data.topForwarders) ? data.topForwarders : [],
        estimatedLandedCostText: data.estimatedLandedCostText || "No calculation available."
    };
 } catch (error) {
     console.error("Logistics API Error", error);
     throw new Error("Failed to fetch logistics details");
 }
};