// This file is intended for server-side use only.
import { genkit } from '@genkit-ai/core';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
});
