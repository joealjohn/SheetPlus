'use server';

/**
 * @fileOverview A flow to extract text from an image using AI.
 *
 * - extractTextFromImage - A function that accepts an image data URI and returns the extracted text.
 * - ExtractTextFromImageInput - The input type for the extractTextFromImage function.
 * - ExtractTextFromImageOutput - The return type for the extractTextFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ExtractTextFromImageInput = z.infer<typeof ExtractTextFromImageInputSchema>;

const ExtractTextFromImageOutputSchema = z.object({
    extractedText: z.string().describe('The text extracted from the image, formatted as a CSV string.'),
});
export type ExtractTextFromImageOutput = z.infer<typeof ExtractTextFromImageOutputSchema>;

export async function extractTextFromImage(input: ExtractTextFromImageInput): Promise<ExtractTextFromImageOutput> {
  return extractTextFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTextFromImagePrompt',
  input: {schema: ExtractTextFromImageInputSchema},
  output: {schema: ExtractTextFromImageOutputSchema},
  prompt: `You are an expert at extracting tabular data from images and PDFs. You also have expertise in correcting common Optical Character Recognition (OCR) errors, particularly from handwritten documents.
  
  Your task is to:
  1. Extract the text from the following document.
  2. Meticulously analyze the extracted text and fix any inaccuracies. Pay close attention to common misinterpretations (e.g., 'l' vs. '1', 'O' vs. '0', 'S' vs. '5', 'G' vs. '6', 'B' vs. '8'). Preserve proper nouns as accurately as possible.
  3. Return the corrected data as a single, valid CSV-formatted string.
  4. The first line of the CSV must be the header row.
  5. If the rows in the image are prefixed with a serial number or index, create a separate column named "S.No." for these numbers. Do not include the numbers in the adjacent column.
  6. Ensure the output is a valid CSV format, properly quoting fields that contain commas or newlines.

Image: {{media url=imageDataUri}}`,
});

const extractTextFromImageFlow = ai.defineFlow(
  {
    name: 'extractTextFromImageFlow',
    inputSchema: ExtractTextFromImageInputSchema,
    outputSchema: ExtractTextFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to extract text from image.');
    }
    return { extractedText: output.extractedText };
  }
);
