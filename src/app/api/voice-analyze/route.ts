import { NextRequest, NextResponse } from 'next/server';
import { analyzeVoiceWithGenkit } from '@/ai/voice-genkit'; // 실제 Genkit 연동 함수 필요

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: '오디오 파일이 필요합니다.' }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Genkit API로 오디오 전송 및 결과 수신
    const result = await analyzeVoiceWithGenkit(buffer);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'AI 분석 실패' }, { status: 500 });
  }
} 