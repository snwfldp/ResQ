
"use client";

import { useState, type FormEvent, useEffect } from "react";
import { assessCondition, type AssessConditionInput, type AssessConditionOutput } from "@/ai/flows/condition-assessment";
import { smartHospitalRecommendation, type SmartHospitalRecommendationInput, type SmartHospitalRecommendationOutput } from "@/ai/flows/smart-hospital-recommendation";
import type { HospitalDataForAI } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MapPin, Send, Sparkles, Stethoscope, Clock, Info, ListOrdered, CheckCircle, Zap, Thermometer, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Mock hospital data for Seoul Tertiary Hospitals
const mockSeoulHospitalData: HospitalDataForAI[] = [
  { hospitalName: "서울대학교병원", hospitalLocation: "서울특별시 종로구 대학로 101", capacity: 90, specialties: ["응급의학", "외상센터", "심뇌혈관센터", "중환자실"] , id: "HOS_SNUH" },
  { hospitalName: "세브란스병원", hospitalLocation: "서울특별시 서대문구 연세로 50-1", capacity: 85, specialties: ["응급의학", "심장내과", "신경외과", "소아응급"] , id: "HOS_SEVERANCE"},
  { hospitalName: "서울아산병원", hospitalLocation: "서울특별시 송파구 올림픽로43길 88", capacity: 95, specialties: ["응급의학", "외상센터", "암센터", "장기이식"] , id: "HOS_ASAN"},
  { hospitalName: "삼성서울병원", hospitalLocation: "서울특별시 강남구 일원로 81", capacity: 88, specialties: ["응급의학", "뇌졸중센터", "심장센터", "중환자실"] , id: "HOS_SAMSUNG"},
  { hospitalName: "서울성모병원", hospitalLocation: "서울특별시 서초구 반포대로 222", capacity: 82, specialties: ["응급의학", "혈액내과", "순환기내과", "뇌신경센터"], id: "HOS_STMARY" },
  { hospitalName: "고려대학교 안암병원", hospitalLocation: "서울특별시 성북구 고려대로 73", capacity: 75, specialties: ["응급의학", "외상외과", "소화기내과"] , id: "HOS_KUANAM"},
  { hospitalName: "경희대학교병원", hospitalLocation: "서울특별시 동대문구 경희대로 23", capacity: 70, specialties: ["응급의학", "한방협진", "관절류마티스"] , id: "HOS_KHU"},
];

export default function EmergencyDispatchPage() {
  const [voiceInput, setVoiceInput] = useState<string>("");
  const [ambulanceLocation, setAmbulanceLocation] = useState<string>("");
  
  const [assessedConditionResult, setAssessedConditionResult] = useState<AssessConditionOutput | null>(null);
  const [hospitalRecommendations, setHospitalRecommendations] = useState<SmartHospitalRecommendationOutput | null>(null);
  
  const [isLoadingCondition, setIsLoadingCondition] = useState<boolean>(false);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setAmbulanceLocation("강남역 부근"); // Default Seoul location
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!voiceInput.trim() || !ambulanceLocation.trim()) {
      setError("환자 상태 정보와 구급차 위치는 비워둘 수 없습니다.");
      return;
    }

    setError(null);
    setAssessedConditionResult(null);
    setHospitalRecommendations(null);
    setIsLoadingCondition(true);

    try {
      const conditionInput: AssessConditionInput = { voiceInput };
      const conditionResult = await assessCondition(conditionInput);
      setAssessedConditionResult(conditionResult);
      toast({
        title: "상태 평가 완료",
        description: "환자 상태가 초기 평가되었습니다.",
      });

      setIsLoadingCondition(false);
      setIsLoadingHospitals(true);

      // Pass hospital IDs along with other data for the AI flow
      const hospitalDataForAI = mockSeoulHospitalData.map(h => ({
        hospitalName: h.hospitalName,
        hospitalLocation: h.hospitalLocation,
        capacity: h.capacity,
        specialties: h.specialties,
        // id: h.id // Pass ID if your AI flow can use it for context or if recommendations should include it
      }));

      const recommendationInput: SmartHospitalRecommendationInput = {
        patientCondition: conditionResult.patientState,
        ambulanceLocation,
        hospitalData: hospitalDataForAI,
      };
      const recommendationResult = await smartHospitalRecommendation(recommendationInput);
      setHospitalRecommendations(recommendationResult);
      toast({
        title: "병원 추천 완료",
        description: "AI가 평가된 상태에 따라 병원을 추천했습니다.",
      });

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
      setError(`처리 실패: ${errorMessage}`);
      toast({
        title: "처리 실패",
        description: `오류: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingCondition(false);
      setIsLoadingHospitals(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">응급 출동 관제 콘솔</CardTitle>
          </div>
          <CardDescription>
            환자 정보 및 구급차 위치를 입력하여 AI 기반 상태 평가 및 병원 매칭을 수행합니다. (데이터: 서울시 기준)
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="voiceInput" className="text-base font-medium flex items-center">
                  <Mic className="mr-2 h-5 w-5 text-muted-foreground" />
                  상황실 교신 내용 (음성 텍스트 변환)
                </Label>
                <Textarea
                  id="voiceInput"
                  placeholder="예: 45세 남성, 극심한 흉통과 호흡 곤란 호소..."
                  value={voiceInput}
                  onChange={(e) => setVoiceInput(e.target.value)}
                  rows={5}
                  className="text-base"
                  disabled={isLoadingCondition || isLoadingHospitals}
                />
                 <p className="text-xs text-muted-foreground">
                  음성 입력을 시뮬레이션하여 텍스트를 입력합니다.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ambulanceLocation" className="text-base font-medium flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                  구급차 현재 위치
                </Label>
                <Input
                  id="ambulanceLocation"
                  type="text"
                  placeholder="예: '강남구 테헤란로 123' 또는 GPS 좌표"
                  value={ambulanceLocation}
                  onChange={(e) => setAmbulanceLocation(e.target.value)}
                  className="text-base"
                  disabled={isLoadingCondition || isLoadingHospitals}
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoadingCondition || isLoadingHospitals} className="px-8 py-3 text-base w-full sm:w-auto">
              {(isLoadingCondition || isLoadingHospitals) ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  상태 평가 및 병원 검색
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoadingCondition && (
        <Card className="shadow-xl">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2 mx-auto" />
            <p className="text-muted-foreground">환자 상태 평가 중...</p>
          </CardContent>
        </Card>
      )}

      {assessedConditionResult && !isLoadingCondition && (
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Thermometer className="h-7 w-7 text-primary" />
              <CardTitle className="text-xl">환자 상태 평가 결과</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h3 className="text-md font-semibold">AI 분류 환자 상태:</h3>
              <p className="text-lg p-3 bg-secondary/30 rounded-md border border-secondary text-secondary-foreground">
                {assessedConditionResult.patientState}
              </p>
              <p className="text-xs text-muted-foreground">
                이 분류는 AI 분석에 기반한 것입니다. 항상 의료 프로토콜을 확인하십시오.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isLoadingHospitals && assessedConditionResult &&  (
         <Card className="shadow-xl">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2 mx-auto" />
            <p className="text-muted-foreground">적합한 병원 검색 중...</p>
          </CardContent>
        </Card>
      )}

      {hospitalRecommendations && hospitalRecommendations.recommendations.length > 0 && !isLoadingHospitals && (
        <Card className="shadow-xl">
          <CardHeader>
             <div className="flex items-center gap-2">
                <ListOrdered className="h-7 w-7 text-primary" />
                <CardTitle className="text-xl">추천 병원 목록</CardTitle>
            </div>
            <CardDescription>평가된 상태({assessedConditionResult?.patientState}), 위치 및 병원 데이터를 기반으로 합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {hospitalRecommendations.recommendations.map((rec, index) => (
                <AccordionItem value={`item-${index}`} key={rec.hospitalName} className="bg-card border rounded-lg shadow-sm">
                  <AccordionTrigger className="p-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            <span className={`flex items-center justify-center h-8 w-8 rounded-full ${index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} text-sm font-bold`}>
                                {index + 1}
                            </span>
                            <h3 className="text-lg font-semibold text-left">{rec.hospitalName}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className={`h-5 w-5 ${rec.suitabilityScore >= 80 ? 'text-green-500' : rec.suitabilityScore >=60 ? 'text-yellow-500' : 'text-red-500'}`} />
                            <span>{rec.suitabilityScore}/100</span>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0 text-sm">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <p><strong>예상 도착 시간:</strong> {rec.estimatedArrivalTime}</p>
                        </div>
                         <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <p><strong>추천 사유:</strong></p>
                                <p className="pl-1 text-muted-foreground">{rec.reasoning}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => toast({title: `${rec.hospitalName}(으)로 이송 지시`, description: "이것은 시뮬레이션된 작업입니다."})}>
                            {rec.hospitalName}(으)로 이송
                        </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
      {hospitalRecommendations && hospitalRecommendations.recommendations.length === 0 && !isLoadingHospitals && (
        <Card className="shadow-xl">
            <CardContent className="pt-6 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground mb-3 mx-auto" />
                <p className="text-lg">추천 가능한 병원이 없습니다.</p>
                <p className="text-sm text-muted-foreground">조건을 조정하거나 병원 데이터가 최신인지 확인하십시오.</p>
            </CardContent>
        </Card>
       )}
    </div>
  );
}
