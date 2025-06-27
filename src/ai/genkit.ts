import * as genkitCore from '@genkit-ai/core';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkitCore.genkit({
  plugins: [googleAI()],
});
