"use client";

import { useState, type FormEvent } from "react";
import { assessCondition, type AssessConditionInput, type AssessConditionOutput } from "@/ai/flows/condition-assessment";
import { advancedTriage, type AdvancedTriageInput, type AdvancedTriageOutput } from "@/ai/flows/advanced-triage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Mic, Send, Sparkles, Thermometer, ClipboardList, StethoscopeIcon, Activity, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function ConditionAssessmentPage() {
  const [voiceInput, setVoiceInput] = useState<string>("");
  const [assessmentResult, setAssessmentResult] = useState<AssessConditionOutput | null>(null);
  const [triageResult, setTriageResult] = useState<AdvancedTriageOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTriageLoading, setIsTriageLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 고급 중증도 분류를 위한 상태
  const [patientDescription, setPatientDescription] = useState<string>("");
  const [heartRate, setHeartRate] = useState<string>("");
  const [bloodPressure, setBloodPressure] = useState<string>("");
  const [respiratoryRate, setRespiratoryRate] = useState<string>("");
  const [temperature, setTemperature] = useState<string>("");
  const [oxygenSaturation, setOxygenSaturation] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");

  // 기본 상태 평가 처리
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!voiceInput.trim()) {
      setError("Voice input cannot be empty.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAssessmentResult(null);

    try {
      const input: AssessConditionInput = { voiceInput };
      const result = await assessCondition(input);
      setAssessmentResult(result);
      toast({
        title: "Assessment Complete",
        description: "Patient condition has been assessed by AI.",
      });
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to assess condition: ${errorMessage}`);
      toast({
        title: "Assessment Failed",
        description: `Error: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 고급 중증도 분류(Triage) 처리
  const handleTriageSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!patientDescription.trim()) {
      setError("환자 상태 설명은 필수입니다.");
      return;
    }

    setIsTriageLoading(true);
    setError(null);
    setTriageResult(null);

    try {
      const input: AdvancedTriageInput = { 
        patientDescription,
        vitalSigns: {
          heartRate: heartRate ? Number(heartRate) : undefined,
          bloodPressure: bloodPressure || undefined,
          respiratoryRate: respiratoryRate ? Number(respiratoryRate) : undefined,
          temperature: temperature ? Number(temperature) : undefined,
          oxygenSaturation: oxygenSaturation ? Number(oxygenSaturation) : undefined
        },
        age: age ? Number(age) : undefined,
        gender: gender || undefined
      };
      
      const result = await advancedTriage(input);
      setTriageResult(result);
      toast({
        title: "중증도 분류 완료",
        description: "AI가 KTAS 레벨과 잠재적 질환을 평가했습니다.",
      });
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
      setError(`중증도 분류 실패: ${errorMessage}`);
      toast({
        title: "중증도 분류 실패",
        description: `오류: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsTriageLoading(false);
    }
  };

  // KTAS 레벨에 따른 색상 반환
  const getKtasColor = (level: number) => {
    switch(level) {
      case 1: return "bg-red-500 text-white";
      case 2: return "bg-orange-500 text-white";
      case 3: return "bg-yellow-500";
      case 4: return "bg-green-500 text-white";
      case 5: return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="basic" className="text-base py-3">
            <Thermometer className="h-5 w-5 mr-2" />
            기본 상태 평가
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-base py-3">
            <ClipboardList className="h-5 w-5 mr-2" />
            고급 중증도 분류 (KTAS)
          </TabsTrigger>
        </TabsList>

        {/* 기본 상태 평가 탭 */}
        <TabsContent value="basic">
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Thermometer className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">AI-Powered Condition Assessment</CardTitle>
              </div>
              <CardDescription>
                Enter the operator's voice input transcription to classify the patient's state using AI.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="voiceInput" className="text-lg font-medium">Operator Input (Transcription)</Label>
                  <div className="relative">
                    <Textarea
                      id="voiceInput"
                      placeholder="E.g., 'Patient is a 45-year-old male, complaining of severe chest pain and difficulty breathing...'"
                      value={voiceInput}
                      onChange={(e) => setVoiceInput(e.target.value)}
                      rows={6}
                      className="pr-12 py-3 text-base"
                      disabled={isLoading}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                      disabled={isLoading}
                      aria-label="Record audio (simulated)"
                      onClick={() => toast({ title: "Feature not available", description: "Voice recording simulation is not implemented."})}
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Simulate voice input by typing the transcribed text.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isLoading} className="px-8 py-3 text-base">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Assessing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Assess Condition
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {assessmentResult && (
            <Card className="max-w-2xl mx-auto mt-8 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <CardTitle className="text-2xl">Clinical Assessment Report</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-2">Primary Assessment</h3>
                    <div className="relative">
                      <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary rounded-full"></div>
                      <p className="text-xl p-4 pl-6 bg-secondary/30 rounded-md border border-secondary text-secondary-foreground font-medium">
                        {assessmentResult.patientState}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-primary/10 p-4 rounded-md border border-primary/20">
                      <h4 className="text-xs uppercase tracking-wide font-bold text-primary mb-1">Severity</h4>
                      <p className="text-sm font-medium">
                        {assessmentResult.patientState.includes("severe") || assessmentResult.patientState.includes("critical") 
                          ? "CRITICAL" 
                          : assessmentResult.patientState.includes("moderate") 
                            ? "MODERATE" 
                            : "STABLE"}
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                      <h4 className="text-xs uppercase tracking-wide font-bold text-yellow-700 mb-1">Care Recommendation</h4>
                      <p className="text-sm font-medium">
                        {assessmentResult.patientState.includes("severe") || assessmentResult.patientState.includes("critical") 
                          ? "IMMEDIATE MEDICAL INTERVENTION" 
                          : assessmentResult.patientState.includes("moderate") 
                            ? "URGENT MEDICAL ATTENTION" 
                            : "ROUTINE MEDICAL CARE"}
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                      <h4 className="text-xs uppercase tracking-wide font-bold text-blue-700 mb-1">Monitoring Requirement</h4>
                      <p className="text-sm font-medium">
                        {assessmentResult.patientState.includes("severe") || assessmentResult.patientState.includes("critical") 
                          ? "CONTINUOUS MONITORING" 
                          : assessmentResult.patientState.includes("moderate") 
                            ? "FREQUENT MONITORING" 
                            : "REGULAR MONITORING"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm text-gray-600 flex items-start">
                    <Info className="h-4 w-4 text-gray-400 mr-2 mt-0.5 shrink-0" />
                    <p>
                      This assessment is based on AI analysis of the provided symptoms and conditions.
                      Always verify with established medical protocols and clinical judgment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 고급 중증도 분류 탭 */}
        <TabsContent value="advanced">
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">AI 기반 중증도 분류 (KTAS)</CardTitle>
              </div>
              <CardDescription>
                환자 상태와 생체 징후를 입력하여 KTAS 레벨 및 잠재적 질환을 평가합니다.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleTriageSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="patientDescription" className="text-lg font-medium">환자 상태 설명 <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="patientDescription"
                    placeholder="예: '45세 남성 환자가 30분 전부터 시작된 흉통과 호흡곤란을 호소합니다. 땀을 많이 흘리고 있으며 과거 심장질환 이력이 있다고 합니다...'"
                    value={patientDescription}
                    onChange={(e) => setPatientDescription(e.target.value)}
                    rows={4}
                    className="py-3 text-base"
                    disabled={isTriageLoading}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="heartRate" className="font-medium">맥박 (bpm)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      placeholder="예: 85"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      disabled={isTriageLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bloodPressure" className="font-medium">혈압 (mmHg)</Label>
                    <Input
                      id="bloodPressure"
                      type="text"
                      placeholder="예: 120/80"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                      disabled={isTriageLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="respiratoryRate" className="font-medium">호흡수 (회/분)</Label>
                    <Input
                      id="respiratoryRate"
                      type="number"
                      placeholder="예: 18"
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(e.target.value)}
                      disabled={isTriageLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="temperature" className="font-medium">체온 (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="예: 37.5"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      disabled={isTriageLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="oxygenSaturation" className="font-medium">산소포화도 (%)</Label>
                    <Input
                      id="oxygenSaturation"
                      type="number"
                      placeholder="예: 98"
                      value={oxygenSaturation}
                      onChange={(e) => setOxygenSaturation(e.target.value)}
                      disabled={isTriageLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age" className="font-medium">환자 나이</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="예: 45"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      disabled={isTriageLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">환자 성별</Label>
                  <RadioGroup
                    value={gender}
                    onValueChange={setGender}
                    disabled={isTriageLoading}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="남성" id="male" />
                      <Label htmlFor="male">남성</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="여성" id="female" />
                      <Label htmlFor="female">여성</Label>
                    </div>
                  </RadioGroup>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>오류</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isTriageLoading} className="px-8 py-3 text-base">
                  {isTriageLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <ClipboardList className="mr-2 h-5 w-5" />
                      중증도 분류 실행
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {triageResult && (
            <Card className="max-w-2xl mx-auto mt-8 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-8 w-8 text-primary" />
                    <CardTitle className="text-2xl">중증도 분류 결과</CardTitle>
                  </div>
                  <Badge className={`text-lg px-4 py-2 ${getKtasColor(triageResult.ktasLevel)}`}>
                    KTAS {triageResult.ktasLevel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">KTAS 레벨 판정 근거:</h3>
                  <p className="text-base p-4 bg-secondary/30 rounded-md border border-secondary">
                    {triageResult.ktasReasoning}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">잠재적 질환/상태:</h3>
                  <div className="space-y-3">
                    {triageResult.potentialConditions.map((condition, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-md border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-base">{condition.condition}</h4>
                          <Badge className="bg-primary">{condition.probability}% 가능성</Badge>
                        </div>
                        <div className="mb-3">
                          <Progress value={condition.probability} className="h-2" />
                        </div>
                        <h5 className="text-sm font-medium mb-1 text-gray-600">핵심 지표:</h5>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 pl-2">
                          {condition.keyIndicators.map((indicator, i) => (
                            <li key={i}>{indicator}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="recommended-tests">
                    <AccordionTrigger className="text-lg font-semibold">
                      병원 도착 후 권장 검사
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        {triageResult.recommendedTests.map((test, idx) => (
                          <li key={idx} className="text-base">{test}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="mt-4 p-4 rounded-md bg-primary/10 border border-primary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <StethoscopeIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-primary">권장 치료 시작 시간:</h3>
                  </div>
                  <p className="text-lg font-medium">{triageResult.timeToTreatmentRecommendation}</p>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  이 분석은 AI의 평가를 기반으로 합니다. 항상 전문 의료진의 판단으로 확인하세요.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
