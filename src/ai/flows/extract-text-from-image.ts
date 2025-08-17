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
import {autoCorrectOcr} from './auto-correct-ocr';
import {enhanceDataInterpretation} from './enhance-data-interpretation';

const ExtractTextFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
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
  prompt: `You are an expert at extracting tabular data from images and PDFs.
  Extract the text from the following document and return it as a CSV-formatted string.
  The first line of the CSV should be the header row.

  Pay close attention to numerical data and ensure it is extracted with the highest accuracy.
  If the rows in the image are prefixed with a serial number or index, create a separate column named "S.No." for these numbers. Do not include the numbers in the adjacent column.
  Ensure that the output is a valid CSV format, properly quoting fields that contain commas or newlines.

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
    const { correctedText } = await autoCorrectOcr({ ocrText: output.extractedText });

    // Since enhanceDataInterpretation expects JSON, we need to provide a dummy JSON for now.
    // This part can be improved later to convert CSV to JSON and get meaningful suggestions.
    const interpretationResult = await enhanceDataInterpretation({ jsonData: '{}' });
    console.log('Data interpretation suggestions:', interpretationResult.columnInterpretations);
    
    return { extractedText: correctedText };
  }
);
