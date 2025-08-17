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
  prompt: `You are an AI assistant with expertise in correcting common Optical Character Recognition (OCR) errors, particularly from handwritten documents.
Your task is to meticulously analyze the provided OCR text and fix any inaccuracies. Pay close attention to common misinterpretations (e.g., 'l' vs. '1', 'O' vs. '0', 'S' vs. '5', 'G' vs. '6', 'B' vs. '8', 'D' vs. 'O').
The input text might have names and other proper nouns which should be preserved as accurately as possible. For example, "Deepika" should be corrected to "Gopika" if the original handwriting suggests it.

Original OCR Text:
{{{ocrText}}}

Review the text carefully, correct the errors, and provide the clean, accurate version.`,
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
