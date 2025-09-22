import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export async function generatePromoText(prompt: string) {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
  });

  const { textStream } = await streamText({
    model: google('models/gemini-1.5-flash-latest'),
    prompt,
  });

  return textStream;
}
