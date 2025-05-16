// 오디오 버퍼를 받아 STT 및 환자 상태 분석을 수행하는 함수 예시
// 실제 Genkit/재미나이 API 연동 부분은 환경에 맞게 수정 필요

import { SpeechClient } from '@google-cloud/speech';
import { assessCondition } from './flows/condition-assessment'; // 기존 Genkit 환자상태 분석 함수

const speechClient = new SpeechClient();

export async function analyzeVoiceWithGenkit(audioBuffer: Buffer): Promise<{ transcript: string, patientState: string }> {
  // 1. Google STT로 음성 → 텍스트
  const [response] = await speechClient.recognize({
    audio: { content: audioBuffer.toString('base64') },
    config: {
      encoding: 'WEBM_OPUS', // MediaRecorder 기본 포맷
      sampleRateHertz: 48000,
      languageCode: 'ko-KR',
    },
  });

  const transcript = response.results?.map(r => r.alternatives?.[0]?.transcript).join(' ') || '';

  // 2. Genkit(재미나이)로 환자 상태 분석
  const result = await assessCondition({ voiceInput: transcript });
  return { transcript, patientState: result.patientState };
} 