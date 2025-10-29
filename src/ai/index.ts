'use server';
/**
 * @fileOverview Centralized Genkit AI initialization.
 * This file configures and exports a singleton 'ai' instance for use across all server-side flows.
 * This pattern ensures that the API key is loaded correctly on the server and not exposed to the client.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin, providing the API key from environment variables.
// This is the single source of truth for the AI configuration.
export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
});
