'use server';

/**
 * @deprecated This file is deprecated. AI initialization is now handled in /src/ai/index.ts
 * All flows should import from '@/ai' instead.
 */
import { genkit } from 'genkit';

export const ai = genkit();
