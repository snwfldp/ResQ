'use server';
/**
 * @fileOverview 환자 중증도 분류(Triage) 시스템 고도화 - 보다 정교한 중증도 분류 기능
 *
 * - advancedTriage - 환자 상태 및 생체 신호를 기반으로 KTAS 레벨 및 잠재적 질환 평가
 * - AdvancedTriageInput - advancedTriage 함수의 입력 타입
 * - AdvancedTriageOutput - advancedTriage 함수의 반환 타입
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdvancedTriageInputSchema = z.object({
  patientDescription: z.string().describe('환자 상태 설명'),
  vitalSigns: z.object({
    heartRate: z.number().optional().describe('맥박'),
    bloodPressure: z.string().optional().describe('혈압 (수축기/이완기)'),
    respiratoryRate: z.number().optional().describe('호흡수'),
    temperature: z.number().optional().describe('체온'),
    oxygenSaturation: z.number().optional().describe('산소포화도')
  }).optional(),
  age: z.number().optional().describe('환자 나이'),
  gender: z.string().optional().describe('환자 성별')
});
export type AdvancedTriageInput = z.infer<typeof AdvancedTriageInputSchema>;

const AdvancedTriageOutputSchema = z.object({
  ktasLevel: z.number().describe('KTAS 레벨 (1-5)'),
  ktasReasoning: z.string().describe('KTAS 레벨 판정 근거'),
  potentialConditions: z.array(z.object({
    condition: z.string().describe('가능성 있는 질환/상태'),
    probability: z.number().describe('확률 (0-100%)'),
    keyIndicators: z.array(z.string()).describe('핵심 지표')
  })),
  recommendedTests: z.array(z.string()).describe('병원 도착 후 권장 검사'),
  timeToTreatmentRecommendation: z.string().describe('권장 치료 시작 시간')
});
export type AdvancedTriageOutput = z.infer<typeof AdvancedTriageOutputSchema>;

export async function advancedTriage(
  input: AdvancedTriageInput
): Promise<AdvancedTriageOutput> {
  return advancedTriageFlow(input);
}

const advancedTriagePrompt = ai.definePrompt({
  name: 'advancedTriagePrompt',
  input: {schema: AdvancedTriageInputSchema},
  output: {schema: AdvancedTriageOutputSchema},
  prompt: `당신은 응급의학 전문의로, KTAS(Korean Triage and Acuity Scale) 분류에 능숙합니다. 
환자 상태 및 생체 징후를 분석하여 정확한 중증도 분류와 잠재적 질환을 평가해야 합니다.

환자 상태: {{{patientDescription}}}
{{#if vitalSigns}}
생체 징후:
{{#if vitalSigns.heartRate}} - 맥박: {{{vitalSigns.heartRate}}} bpm{{/if}}
{{#if vitalSigns.bloodPressure}} - 혈압: {{{vitalSigns.bloodPressure}}} mmHg{{/if}}
{{#if vitalSigns.respiratoryRate}} - 호흡수: {{{vitalSigns.respiratoryRate}}} 회/분{{/if}}
{{#if vitalSigns.temperature}} - 체온: {{{vitalSigns.temperature}}} °C{{/if}}
{{#if vitalSigns.oxygenSaturation}} - 산소포화도: {{{vitalSigns.oxygenSaturation}}}%{{/if}}
{{/if}}
{{#if age}} - 나이: {{{age}}}세{{/if}}
{{#if gender}} - 성별: {{{gender}}}{{/if}}

KTAS 레벨 기준:
1단계(즉시 소생술): 생명이나 사지가 위험한 상태, 즉각적인 처치가 필요
2단계(매우 응급): 생명 위협 잠재, 10-15분 내 의료진의 초기 평가 필요
3단계(응급): 생명 위협은 낮으나 30분 내 평가 필요
4단계(준응급): 잠재적으로 심각, 1시간 내 평가 필요
5단계(비응급): 급성기는 지났으나 2시간 내 평가 필요

다음을 체계적으로 평가하세요:
1. KTAS 레벨(1-5)과 그 판정 근거
2. 가능성 있는 질환/상태 목록(신뢰도 % 포함)
3. 병원 도착 후 권장되는 검사 목록
4. 권장 치료 시작 시간

환자의 안전을 최우선으로 하고, 불확실한 경우 더 높은 중증도로 분류하세요.`,
});

const advancedTriageFlow = ai.defineFlow(
  {
    name: 'advancedTriageFlow',
    inputSchema: AdvancedTriageInputSchema,
    outputSchema: AdvancedTriageOutputSchema,
  },
  async input => {
    const {output} = await advancedTriagePrompt(input);
    return output!;
  }
); 