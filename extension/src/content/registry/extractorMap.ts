import { extractChatGPT } from '../extractors/chatgpt';

export const extractorMap = {
  chatgpt: extractChatGPT,

} as const;

export type SupportedAI = keyof typeof extractorMap;
