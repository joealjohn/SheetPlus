'use server';

/**
 * @fileOverview A Genkit flow that enhances data interpretation by detecting column data types and suggesting formatting.
 *
 * - enhanceDataInterpretation - A function that takes a JSON data structure and suggests data types and formatting for each column.
 * - EnhanceDataInterpretationInput - The input type for the enhanceDataInterpretation function, which is a JSON string.
 * - EnhanceDataInterpretationOutput - The return type for the enhanceDataInterpretation function, which includes data type suggestions and formatting suggestions for each column.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceDataInterpretationInputSchema = z.object({
  jsonData: z
    .string()
    .describe('A JSON string representing the tabular data to be interpreted.'),
});
export type EnhanceDataInterpretationInput = z.infer<typeof EnhanceDataInterpretationInputSchema>;

const EnhanceDataInterpretationOutputSchema = z.object({
  columnInterpretations: z.record(
    z.object({
      dataType: z.string().describe('The detected data type of the column (e.g., number, date, text).'),
      suggestedFormat: z
        .string()
        .describe('A suggested format for the column based on the detected data type.'),
    })
  ),
});
export type EnhanceDataInterpretationOutput = z.infer<typeof EnhanceDataInterpretationOutputSchema>;

export async function enhanceDataInterpretation(input: EnhanceDataInterpretationInput): Promise<EnhanceDataInterpretationOutput> {
  return enhanceDataInterpretationFlow(input);
}

const enhanceDataInterpretationPrompt = ai.definePrompt({
  name: 'enhanceDataInterpretationPrompt',
  input: {schema: EnhanceDataInterpretationInputSchema},
  output: {schema: EnhanceDataInterpretationOutputSchema},
  prompt: `You are an AI assistant that analyzes tabular data provided in JSON format and suggests the data type and appropriate formatting for each column.

  Analyze the following JSON data:
  {{{jsonData}}}

  For each column, determine the most appropriate data type (e.g., number, date, text, boolean) and suggest a suitable formatting string.

  Return a JSON object where each key is the column name and the value is an object containing the "dataType" and "suggestedFormat" for that column.

  Example:
  {
    "column1": {
      "dataType": "number",
      "suggestedFormat": "#,##0.00"
    },
    "column2": {
      "dataType": "date",
      "suggestedFormat": "yyyy-MM-dd"
    },
    "column3": {
      "dataType": "text",
      "suggestedFormat": "@"
    }
  }
  Ensure the JSON is parsable.
  `,
});

const enhanceDataInterpretationFlow = ai.defineFlow(
  {
    name: 'enhanceDataInterpretationFlow',
    inputSchema: EnhanceDataInterpretationInputSchema,
    outputSchema: EnhanceDataInterpretationOutputSchema,
  },
  async input => {
    const {output} = await enhanceDataInterpretationPrompt(input);
    return output!;
  }
);
