import { genkit } from '@genkit-ai/core';
import {googleAI} from '@genkit-ai/googleai';

export const ai = (genkit as any).genkit({
  plugins: [googleAI()],
});
