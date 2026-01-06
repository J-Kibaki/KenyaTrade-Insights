# KenyaTrade Insights

Real-time analytics for Kenyan online purchasing trends and AI-driven import recommendations from China.

## Features

- **Market Dashboard**: Visualizes top online shopping categories in Kenya using real-time data gathered via Google Search Grounding.
- **Import Recommendations**: AI-powered suggestions for profitable items to import from China to Kenya. Includes analysis on estimated margins, demand levels, and logistics.
- **Search Grounding**: Uses the latest Google Search results to provide up-to-date information on market trends, product pricing, and consumer behavior.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Models Used**: `gemini-3-flash-preview` with Google Search Tool
- **Visualization**: Recharts
- **Icons**: Lucide React

## Setup & Configuration

1. **API Key**: This application requires a Google Cloud API Key with access to the Gemini API and Google Search Grounding.
2. **Environment Variable**: The API key must be available in the environment as `API_KEY`.

## Usage

1. **Market Data Tab**: 
   - View the current breakdown of e-commerce categories in Kenya.
   - Read an AI-generated summary of the latest consumer trends.

2. **Import Ideas Tab**: 
   - Search for specific niches (e.g., "Solar accessories", "Baby products") or leave blank for general trends.
   - Receive a list of 6 profitable items to import from China, complete with estimated profit margins and reasoning.
