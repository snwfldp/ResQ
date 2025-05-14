// 'use server'
'use server';
/**
 * @fileOverview This file defines a Genkit flow for recommending the 5 most suitable hospitals
 * based on the patient's condition, ambulance location, and hospital capacity.
 *
 * - smartHospitalRecommendation - A function that handles the hospital recommendation process.
 * - SmartHospitalRecommendationInput - The input type for the smartHospitalRecommendation function.
 * - SmartHospitalRecommendationOutput - The return type for the smartHospitalRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartHospitalRecommendationInputSchema = z.object({
  patientCondition: z.string().describe('Description of the patient\'s condition.'),
  ambulanceLocation: z.string().describe('Current GPS coordinates of the ambulance.'),
  hospitalData: z.array(
    z.object({
      hospitalName: z.string().describe('Name of the hospital.'),
      hospitalLocation: z.string().describe('GPS coordinates of the hospital.'),
      capacity: z.number().describe('Current capacity of the hospital.'),
      specialties: z.array(z.string()).describe('List of medical specialties offered by the hospital.'),
    })
  ).describe('An array of hospital objects, including name, location, capacity and specialties.'),
});
export type SmartHospitalRecommendationInput = z.infer<typeof SmartHospitalRecommendationInputSchema>;

const SmartHospitalRecommendationOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      hospitalName: z.string().describe('Name of the recommended hospital.'),
      estimatedArrivalTime: z.string().describe('Estimated time of arrival at the hospital.'),
      suitabilityScore: z.number().describe('A numerical score indicating the suitability of the hospital (higher is better).'),
      reasoning: z.string().describe('The AI\'s reasoning for recommending this hospital.'),
    })
  ).describe('An array of recommended hospitals, including name, ETA, suitability score, and reasoning.'),
});
export type SmartHospitalRecommendationOutput = z.infer<typeof SmartHospitalRecommendationOutputSchema>;

export async function smartHospitalRecommendation(input: SmartHospitalRecommendationInput): Promise<SmartHospitalRecommendationOutput> {
  return smartHospitalRecommendationFlow(input);
}

const smartHospitalRecommendationPrompt = ai.definePrompt({
  name: 'smartHospitalRecommendationPrompt',
  input: {schema: SmartHospitalRecommendationInputSchema},
  output: {schema: SmartHospitalRecommendationOutputSchema},
  prompt: `You are an expert medical dispatch assistant. Given the patient's condition, ambulance location, and real-time hospital data, recommend the 5 most suitable hospitals.

Patient Condition: {{{patientCondition}}}
Ambulance Location: {{{ambulanceLocation}}}
Hospital Data: {{#each hospitalData}}{{{hospitalName}}} (Location: {{{hospitalLocation}}}, Capacity: {{{capacity}}}, Specialties: {{#each specialties}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}){{#unless @last}}\n{{/unless}}{{/each}}

For each recommended hospital, provide:
- hospitalName: The name of the hospital.
- estimatedArrivalTime: The estimated time of arrival (ETA) at the hospital, considering current traffic conditions (make up a reasonable time based on proximity).
- suitabilityScore: A numerical score (out of 100) indicating the suitability of the hospital (higher is better), factoring in patient condition, hospital specialties and capacity.
- reasoning: Explain your reasoning for recommending this hospital, including how the patient's condition aligns with the hospital's specialties and capacity.

Format your output as a JSON array of hospital recommendations.`,
});

const smartHospitalRecommendationFlow = ai.defineFlow(
  {
    name: 'smartHospitalRecommendationFlow',
    inputSchema: SmartHospitalRecommendationInputSchema,
    outputSchema: SmartHospitalRecommendationOutputSchema,
  },
  async input => {
    const {output} = await smartHospitalRecommendationPrompt(input);
    return output!;
  }
);
