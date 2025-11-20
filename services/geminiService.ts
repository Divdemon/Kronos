
import { GoogleGenAI } from "@google/genai";
import type { Metrics, TelemetryError } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const analyzeTelemetry = async (metrics: Metrics, errors: TelemetryError[]): Promise<string> => {
  const errorSummary = errors.length > 0
    ? errors.map(e => `- ${e.timestamp}: ${e.message} (Code: ${e.errorCode}) on ${e.metadata.platform}`).join('\n')
    : 'No errors reported in the last few minutes.';

  const prompt = `
    You are a senior telemetry analyst for a digital car key system. Your task is to analyze the following real-time data snapshot and identify potential anomalies, interesting trends, or areas that need further investigation.

    Present your findings as a concise, markdown-formatted list with brief explanations. Focus on actionable insights.

    **Current Telemetry Data:**
    - Total Keys Issued: ${metrics.totalKeys.toLocaleString()}
    - Active Keys: ${metrics.activeKeys.toLocaleString()}
    - Total Unlocks Today: ${metrics.unlocks.toLocaleString()}
    - Success Rate: ${metrics.successRate.toFixed(2)}%

    **Recent Errors (${errors.length} in the last few minutes):**
    ${errorSummary}

    Based on this data, what should I be looking at?
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing telemetry with Gemini:", error);
    return "Error: Could not retrieve insights from AI. Please check the console for more details.";
  }
};
