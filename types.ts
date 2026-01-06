export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}

export interface RecommendationItem {
  id: string;
  productName: string;
  category: string;
  estimatedMargin: string;
  demandLevel: 'High' | 'Medium' | 'Low';
  reasoning: string;
}

export interface LogisticsDetails {
  customsDuty: string;
  vat: string;
  airFreightCost: string;
  seaFreightCost: string;
  topForwarders: string[];
  estimatedLandedCostText: string;
}

export interface AnalysisResult {
  text: string;
  chartData: ChartDataPoint[];
  sources: GroundingSource[];
  recommendations?: RecommendationItem[];
}

export interface GeminiError {
  message: string;
}