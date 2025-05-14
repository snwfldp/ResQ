'use server';
/**
 * @fileOverview An AI agent to assess patient condition from voice input.
 *
 * - assessCondition - A function that handles the patient condition assessment process.
 * - AssessConditionInput - The input type for the assessCondition function.
 * - AssessConditionOutput - The return type for the assessCondition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessConditionInputSchema = z.object({
  voiceInput: z
    .string()
    .describe('Voice input describing the patient\'s condition.'),
});
export type AssessConditionInput = z.infer<typeof AssessConditionInputSchema>;

const AssessConditionOutputSchema = z.object({
  patientState: z
    .string()
    .describe(
      'The classification of the patient\'s condition/state based on the voice input.'
    ),
});
export type AssessConditionOutput = z.infer<typeof AssessConditionOutputSchema>;

export async function assessCondition(
  input: AssessConditionInput
): Promise<AssessConditionOutput> {
  return assessConditionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessConditionPrompt',
  input: {schema: AssessConditionInputSchema},
  output: {schema: AssessConditionOutputSchema},
  prompt: `You are an expert medical professional. Please analyze the following voice input describing a patient\'s condition and classify the patient\'s state.\n\nVoice Input: {{{voiceInput}}}\n\nPatient State: `,
});

const assessConditionFlow = ai.defineFlow(
  {
    name: 'assessConditionFlow',
    inputSchema: AssessConditionInputSchema,
    outputSchema: AssessConditionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
