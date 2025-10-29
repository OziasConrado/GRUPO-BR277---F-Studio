// This file is intended for server-side use only.
import { genkit } from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// O plugin googleCloud não é necessário para a funcionalidade atual e está causando erro.
// import {googleCloud} from '@genkit-ai/google-cloud';

// A inicialização global foi removida para ser feita sob demanda em cada fluxo.
// Isso evita problemas de timing com o carregamento de variáveis de ambiente.
export const ai = genkit();
