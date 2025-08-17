'use server';

/**
 * @fileOverview A flow to automatically correct OCR errors using AI.
 *
 * - autoCorrectOcr - A function that accepts OCR text and returns corrected text.
 * - AutoCorrectOcrInput - The input type for the autoCorrectOcr function.
 * - AutoCorrectOcrOutput - The return type for the autoCorrectOcr function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoCorrectOcrInputSchema = z.object({
  ocrText: z.string().describe('The text extracted by OCR that needs correction.'),
});
export type AutoCorrectOcrInput = z.infer<typeof AutoCorrectOcrInputSchema>;

const AutoCorrectOcrOutputSchema = z.object({
  correctedText: z.string().describe('The OCR text after AI-powered correction.'),
});
export type AutoCorrectOcrOutput = z.infer<typeof AutoCorrectOcrOutputSchema>;

export async function autoCorrectOcr(input: AutoCorrectOcrInput): Promise<AutoCorrectOcrOutput> {
  return autoCorrectOcrFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoCorrectOcrPrompt',
  input: {schema: AutoCorrectOcrInputSchema},
  output: {schema: AutoCorrectOcrOutputSchema},
  prompt: `You are an AI assistant specialized in correcting errors that typically occur during Optical Character Recognition (OCR).
  You will receive text extracted by OCR, which might contain mistakes due to unclear handwriting, image quality, or other factors.
  Your task is to identify and correct these errors to produce clean, accurate text.

  Original OCR Text: {{{ocrText}}}

  Corrected Text:`,
});

const autoCorrectOcrFlow = ai.defineFlow(
  {
    name: 'autoCorrectOcrFlow',
    inputSchema: AutoCorrectOcrInputSchema,
    outputSchema: AutoCorrectOcrOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
