"use client";

import { useState, type FormEvent, useEffect, useRef } from "react";
import { assessCondition, type AssessConditionInput, type AssessConditionOutput } from "@/ai/flows/condition-assessment";
import { advancedTriage, type AdvancedTriageInput, type AdvancedTriageOutput } from "@/ai/flows/advanced-triage";
import { smartHospitalRecommendation, type SmartHospitalRecommendationInput, type SmartHospitalRecommendationOutput } from "@/ai/flows/smart-hospital-recommendation";
import type { HospitalDataForAI, PatientAdmissionRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MapPin, Send, Sparkles, Stethoscope, Clock, Info, ListOrdered, CheckCircle, Zap, Thermometer, Mic, Bell, Hospital, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { hospitalNotificationService, type HospitalNotification } from "@/lib/hospital-notification";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Mock hospital data for Seoul Tertiary Hospitals
const mockSeoulHospitalData: HospitalDataForAI[] = [
  { hospitalName: "서울대학교병원", hospitalLocation: "서울특별시 종로구 대학로 101", capacity: 90, specialties: ["Emergency Medicine", "Trauma Center", "Cardio-Cerebrovascular Center", "ICU"] },
  { hospitalName: "세브란스병원", hospitalLocation: "서울특별시 서대문구 연세로 50-1", capacity: 85, specialties: ["Emergency Medicine", "Cardiology", "Neurosurgery", "Pediatric Emergency"] },
  { hospitalName: "서울아산병원", hospitalLocation: "서울특별시 송파구 올림픽로43길 88", capacity: 95, specialties: ["Emergency Medicine", "Trauma Center", "Cancer Center", "Organ Transplantation"] },
  { hospitalName: "삼성서울병원", hospitalLocation: "서울특별시 강남구 일원로 81", capacity: 88, specialties: ["Emergency Medicine", "Stroke Center", "Heart Center", "ICU"] },
  { hospitalName: "서울성모병원", hospitalLocation: "서울특별시 서초구 반포대로 222", capacity: 82, specialties: ["Emergency Medicine", "Hematology", "Cardiovascular Medicine", "Neuroscience Center"] },
  { hospitalName: "고려대학교 안암병원", hospitalLocation: "서울특별시 성북구 고려대로 73", capacity: 75, specialties: ["Emergency Medicine", "Trauma Surgery", "Gastroenterology"] },
  { hospitalName: "경희대학교병원", hospitalLocation: "서울특별시 동대문구 경희대로 23", capacity: 70, specialties: ["Emergency Medicine", "Korean Medicine Collaboration", "Rheumatology"] },
];

export default function EmergencyDispatchPage() {
  const [voiceInput, setVoiceInput] = useState<string>("");
  const [ambulanceLocation, setAmbulanceLocation] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const [assessedConditionResult, setAssessedConditionResult] = useState<AssessConditionOutput | null>(null);
  const [hospitalRecommendations, setHospitalRecommendations] = useState<SmartHospitalRecommendationOutput | null>(null);
  const [triageResult, setTriageResult] = useState<AdvancedTriageOutput | null>(null);
  
  const [isLoadingCondition, setIsLoadingCondition] = useState<boolean>(false);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState<boolean>(false);
  const [isTriageLoading, setIsTriageLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 병원 알림 상태 추가
  const [hospitalNotifications, setHospitalNotifications] = useState<HospitalNotification[]>([]);
  const [hasNewNotification, setHasNewNotification] = useState<boolean>(false);
  // 확정된 이송 병원 정보
  const [confirmedTransport, setConfirmedTransport] = useState<{ hospitalId: string; patientId: string; timestamp: string } | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // 위치 갱신 함수
    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setAmbulanceLocation(`${latitude}° N, ${longitude}° E`);
          },
          (error) => {
            setAmbulanceLocation("위치 정보를 가져올 수 없습니다.");
          }
        );
      }
    };

    // 최초 1회 위치 갱신
    updateLocation();

    // 10초마다 위치 갱신
    intervalId = setInterval(updateLocation, 10000);

    // 언마운트 시 인터벌 해제
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);
  
  // 병원 알림 구독을 위한 useEffect 추가
  useEffect(() => {
    // 초기 알림 로드
    const loadNotifications = () => {
      const storedNotifications = hospitalNotificationService.getNotifications();
      if (storedNotifications.length > 0) {
        setHospitalNotifications(storedNotifications);
      }
    };
    
    loadNotifications();
    
    // 병원 알림 서비스 구독
    const unsubscribe = hospitalNotificationService.subscribe((notification) => {
      // 새로운 알림 추가 
      setHospitalNotifications(prev => {
        // 중복 알림 방지를 위한 확인
        if (!prev.some(n => n.id === notification.id)) {
          return [notification, ...prev.slice(0, 9)];
        }
        return prev;
      });
      setHasNewNotification(true);
      
      // 알림 타입에 따른 토스트 메시지 표시
      if (notification.type === 'ACCEPTED') {
        toast({
          title: "병원 수락 알림",
          description: `${notification.request.hospitalId}에서 환자 이송 요청을 수락했습니다.`,
          variant: "default",
        });
      } else if (notification.type === 'REJECTED') {
        toast({
          title: "병원 거부 알림",
          description: `${notification.request.hospitalId}에서 환자 이송 요청을 거부했습니다. ${notification.request.rejectionReason ? `사유: ${notification.request.rejectionReason}` : ''}`,
          variant: "destructive",
        });
      }
    });
    
    // 스토리지 변경 이벤트를 위한 리스너 추가
    const handleStorageChange = () => {
      loadNotifications();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 컴포넌트 언마운트 시 구독 및 이벤트 리스너 해제
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [toast]);

  // 병원 이송 확정 함수
  const confirmTransport = (notification: HospitalNotification) => {
    if (notification.type !== 'ACCEPTED') return;
    
    // 이송 확정 정보 설정
    setConfirmedTransport({
      hospitalId: notification.request.hospitalId,
      patientId: notification.request.id,
      timestamp: new Date().toISOString()
    });
    
    // 알림을 읽음 상태로 변경
    hospitalNotificationService.markAsRead(notification.id);
    
    // 해당 알림 표시 변경
    setHospitalNotifications(prev => 
      prev.map(n => n.id === notification.id ? {...n, isRead: true} : n)
    );
    
    // 신규 알림 표시 제거
    setHasNewNotification(false);
    
    // 성공 메시지 표시
    toast({
      title: "이송 확정 완료",
      description: `${notification.request.hospitalId}로 환자 이송이 확정되었습니다.`,
      variant: "default",
    });
  };

  // 음성 인식 시작
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast({ title: "지원되지 않는 브라우저", description: "이 브라우저는 음성 인식을 지원하지 않습니다.", variant: "destructive" });
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceInput(transcript);
      setIsListening(false);
      setIsLoadingCondition(true);
      setError(null);
      setAssessedConditionResult(null);
      setHospitalRecommendations(null);
      if (timerRef.current) clearTimeout(timerRef.current);
      // Genkit로 분석
      assessCondition({ voiceInput: transcript }).then((result) => {
        setAssessedConditionResult(result);
        toast({ title: "상태 분석 완료", description: "환자 상태가 AI에 의해 분석되었습니다." });
        
        // 중증도 분류 실행
        setIsTriageLoading(true);
        const triageInput: AdvancedTriageInput = {
          patientDescription: transcript
        };
        
        advancedTriage(triageInput).then((triageResult) => {
          setTriageResult(triageResult);
          toast({ title: "중증도 분류 완료", description: "KTAS 레벨과 잠재적 질환이 평가되었습니다." });
        }).catch((e) => {
          console.error("중증도 분류 오류:", e);
        }).finally(() => {
          setIsTriageLoading(false);
        });
        
        // 병원 추천
        setIsLoadingHospitals(true);
        const hospitalDataForAI = mockSeoulHospitalData.map(h => ({
          hospitalName: h.hospitalName,
          hospitalLocation: h.hospitalLocation,
          capacity: h.capacity,
          specialties: h.specialties,
        }));
        const recommendationInput = {
          patientCondition: result.patientState,
          ambulanceLocation,
          hospitalData: hospitalDataForAI,
        };
        smartHospitalRecommendation(recommendationInput).then((recommendationResult) => {
          setHospitalRecommendations(recommendationResult);
          toast({ title: "병원 추천 완료", description: "AI가 분석된 상태를 기반으로 병원을 추천했습니다." });
        }).finally(() => setIsLoadingHospitals(false));
      }).catch((e) => {
        setError("상태 분석 실패: " + (e?.message || "오류"));
        toast({ title: "상태 분석 실패", description: e?.message || "오류", variant: "destructive" });
      }).finally(() => setIsLoadingCondition(false));
    };
    recognition.onerror = () => {
      setIsListening(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    recognition.start();
    setIsListening(true);
    recognitionRef.current = recognition;
    // 10초 후 자동 종료
    timerRef.current = setTimeout(() => {
      recognition.stop();
      setIsListening(false);
      toast({ title: "음성 인식 종료", description: "10초간 음성 인식이 완료되었습니다." });
    }, 10000);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!voiceInput.trim() || !ambulanceLocation.trim()) {
      setError("Patient condition and ambulance location cannot be empty.");
      return;
    }

    setError(null);
    setAssessedConditionResult(null);
    setHospitalRecommendations(null);
    setTriageResult(null);
    setIsLoadingCondition(true);

    try {
      // 기본 상태 평가
      const conditionInput: AssessConditionInput = { voiceInput };
      const result = await assessCondition(conditionInput);
      setAssessedConditionResult(result);
      toast({
        title: "Assessment Complete",
        description: "Patient condition has been assessed.",
      });

      // 중증도 분류 평가
      setIsTriageLoading(true);
      const triageInput: AdvancedTriageInput = {
        patientDescription: voiceInput
      };
      
      const triageResult = await advancedTriage(triageInput);
      setTriageResult(triageResult);
      toast({ 
        title: "중증도 분류 완료", 
        description: "KTAS 레벨과 잠재적 질환이 평가되었습니다." 
      });

      // 병원 추천
      setIsLoadingHospitals(true);
      const hospitalDataForAI = mockSeoulHospitalData.map(h => ({
        hospitalName: h.hospitalName,
        hospitalLocation: h.hospitalLocation,
        capacity: h.capacity,
        specialties: h.specialties,
      }));
      const recommendationInput: SmartHospitalRecommendationInput = {
        patientCondition: result.patientState,
        ambulanceLocation,
        hospitalData: hospitalDataForAI,
      };
      const recommendationResult = await smartHospitalRecommendation(recommendationInput);
      setHospitalRecommendations(recommendationResult);
      toast({
        title: "Hospital Recommendations Ready",
        description: "Top hospitals have been ranked based on patient condition and location.",
      });
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Processing Failed: ${errorMessage}`);
      toast({
        title: "Processing Failed",
        description: `Error: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingCondition(false);
      setIsLoadingHospitals(false);
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
    <div className="container mx-auto py-8 space-y-8">
      {/* 알림 표시 영역 추가 */}
      {hospitalNotifications.length > 0 && (
        <Card className={`shadow-xl ${hasNewNotification ? 'border-primary' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className={`h-7 w-7 ${hasNewNotification ? 'text-primary' : 'text-muted-foreground'}`} />
                <CardTitle className="text-xl">병원 알림</CardTitle>
              </div>
              {hasNewNotification && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  신규 알림
                </Badge>
              )}
            </div>
            <CardDescription>
              병원 포털에서 수신된 최신 알림입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hospitalNotifications.map((notification, index) => (
                <Alert 
                  key={`${notification.request.id}-${notification.timestamp}`}
                  variant={notification.type === 'ACCEPTED' ? 'default' : 'destructive'}
                  className={`${index === 0 && hasNewNotification ? 'border-primary' : ''} ${notification.isRead ? 'opacity-70' : ''}`}
                  onClick={() => setHasNewNotification(false)}
                >
                  <AlertTitle className="flex items-center gap-2">
                    {notification.type === 'ACCEPTED' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    {notification.type === 'ACCEPTED' ? '수락됨' : '거부됨'} - {notification.request.id}
                  </AlertTitle>
                  <AlertDescription className="mt-2 text-sm">
                    <div className="font-medium">
                      {notification.request.hospitalId} ({formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })})
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      {notification.request.assessedCondition} - {notification.request.primarySymptoms}
                    </div>
                    {notification.request.rejectionReason && (
                      <div className="mt-1 text-red-600">
                        거부 사유: {notification.request.rejectionReason}
                      </div>
                    )}
                    
                    {/* 수락 알림에 대한 확정 버튼 추가 */}
                    {notification.type === 'ACCEPTED' && !notification.isRead && (
                      <div className="mt-3">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation(); // 버블링 방지
                            confirmTransport(notification);
                          }}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" /> 이 병원으로 이송 확정
                        </Button>
                      </div>
                    )}
                    
                    {/* 이미 확정된 알림인 경우 */}
                    {notification.type === 'ACCEPTED' && notification.isRead && (
                      <div className="mt-2 text-xs font-medium text-green-600">
                        ✓ 이 병원으로 이송이 확정되었습니다
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 확정된 이송 정보 표시 카드 */}
      {confirmedTransport && (
        <Card className="shadow-xl bg-green-50 border-2 border-green-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Hospital className="h-7 w-7 text-green-600" />
              <CardTitle className="text-xl text-green-700">이송 확정 정보</CardTitle>
            </div>
            <CardDescription className="text-green-600">
              다음 병원으로 환자 이송이 확정되었습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-md shadow-sm border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold">{confirmedTransport.hospitalId}</h3>
                </div>
                <Badge className="bg-green-600">이송 확정</Badge>
              </div>
              
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-medium w-24">환자 ID:</span>
                  <span>{confirmedTransport.patientId}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium w-24">확정 시간:</span>
                  <span>{new Date(confirmedTransport.timestamp).toLocaleString()}</span>
                </div>
                <div className="mt-4 border-t border-green-200 pt-4">
                  <p className="text-xs text-green-700 font-medium">
                    ✓ 병원에서 환자 이송을 수락하였으며 구급대에서 확정하였습니다.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Emergency Dispatch Console</CardTitle>
          </div>
          <CardDescription>
            Perform AI-based condition assessment and hospital matching. (Data: Seoul Based)
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="voiceInput" className="text-base font-medium flex items-center">
                  <Mic className="mr-2 h-5 w-5 text-muted-foreground" />
                  Control Room Comms (Voice-to-Text)
                </Label>
                <div className="relative">
                  <Textarea
                    id="voiceInput"
                    placeholder="마이크 버튼을 클릭하여 음성 입력을 시작하세요..."
                    value={voiceInput}
                    onChange={(e) => setVoiceInput(e.target.value)}
                    rows={5}
                    className="text-base pr-12"
                    disabled={isLoadingCondition || isLoadingHospitals}
                  />
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : "outline"}
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isLoadingCondition || isLoadingHospitals}
                  >
                    <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isListening ? '음성 인식 중...' : '마이크 버튼을 클릭하여 음성 입력을 시작하세요.'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ambulanceLocation" className="text-base font-medium flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                  Ambulance Current Location
                </Label>
                <Input
                  id="ambulanceLocation"
                  type="text"
                  placeholder="E.g., 'Gangnam-gu Teheran-ro 123' or GPS coordinates"
                  value={ambulanceLocation}
                  onChange={(e) => setAmbulanceLocation(e.target.value)}
                  className="text-base"
                  disabled={isLoadingCondition || isLoadingHospitals}
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoadingCondition || isLoadingHospitals} className="px-8 py-3 text-base w-full sm:w-auto">
              {(isLoadingCondition || isLoadingHospitals) ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Assess Condition & Find Hospitals
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
            <p className="text-muted-foreground">Assessing patient condition...</p>
          </CardContent>
        </Card>
      )}

      {assessedConditionResult && !isLoadingCondition && (
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Thermometer className="h-7 w-7 text-primary" />
              <CardTitle className="text-xl">Patient Condition Assessment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-semibold text-muted-foreground">CLINICAL ASSESSMENT</h3>
                <p className="text-lg font-medium p-3 bg-secondary/30 rounded-md border border-secondary text-secondary-foreground">
                  {assessedConditionResult.patientState}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-primary/10 rounded-md p-3 border border-primary/20">
                  <h4 className="text-xs font-semibold uppercase text-primary mb-1">Severity Level</h4>
                  <p className="text-sm font-medium">
                    {assessedConditionResult.patientState.includes("severe") || assessedConditionResult.patientState.includes("critical") 
                      ? "HIGH PRIORITY" 
                      : assessedConditionResult.patientState.includes("moderate") 
                        ? "MODERATE PRIORITY" 
                        : "STANDARD CARE"}
                  </p>
                </div>
                <div className="bg-secondary/10 rounded-md p-3 border border-secondary/20">
                  <h4 className="text-xs font-semibold uppercase text-secondary-foreground mb-1">Response Time</h4>
                  <p className="text-sm font-medium">
                    {assessedConditionResult.patientState.includes("severe") || assessedConditionResult.patientState.includes("critical") 
                      ? "IMMEDIATE" 
                      : assessedConditionResult.patientState.includes("moderate") 
                        ? "< 15 MINUTES" 
                        : "< 30 MINUTES"}
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground flex items-center">
                <Info className="h-3 w-3 mr-1" />
                Assessment based on AI analysis. Verify with standard medical protocols.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isLoadingHospitals && assessedConditionResult &&  (
         <Card className="shadow-xl">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2 mx-auto" />
            <p className="text-muted-foreground">Searching for suitable hospitals...</p>
          </CardContent>
        </Card>
      )}

      {/* 중증도 분류 결과가 있을 경우 */}
      {assessedConditionResult && triageResult && (
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-7 w-7 text-primary" />
                <CardTitle className="text-xl">환자 중증도 분류 (KTAS)</CardTitle>
              </div>
              <Badge className={`px-3 py-1 ${getKtasColor(triageResult.ktasLevel)}`}>
                KTAS 레벨 {triageResult.ktasLevel}
              </Badge>
            </div>
            <CardDescription>
              AI 평가에 기반한 환자 중증도 분류 및 잠재적 질환 평가 결과입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">KTAS 레벨 판정 근거:</h3>
                <p className="text-sm bg-secondary/20 p-3 rounded-md">{triageResult.ktasReasoning}</p>
              </div>
              
              <div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="potential-conditions">
                    <AccordionTrigger className="text-sm font-medium py-2">
                      잠재적 질환/상태 ({triageResult.potentialConditions.length}개)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 mt-1">
                        {triageResult.potentialConditions.slice(0, 3).map((condition, idx) => (
                          <div key={idx} className="p-2 bg-white rounded-md border border-gray-200 text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{condition.condition}</h4>
                              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                                {condition.probability}% 가능성
                              </Badge>
                            </div>
                            <Progress value={condition.probability} className="h-1 my-1" />
                          </div>
                        ))}
                        {triageResult.potentialConditions.length > 3 && (
                          <p className="text-xs text-muted-foreground italic">+ {triageResult.potentialConditions.length - 3}개 더 있음</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="recommended-tests">
                    <AccordionTrigger className="text-sm font-medium py-2">
                      권장 검사 ({triageResult.recommendedTests.length}개)
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside text-sm space-y-1 pl-2">
                        {triageResult.recommendedTests.map((test, idx) => (
                          <li key={idx}>{test}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              
              <div className="px-3 py-2 rounded-md bg-primary/10 border border-primary/30 flex items-center">
                <Clock className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm font-medium text-primary">권장 치료 시작: {triageResult.timeToTreatmentRecommendation}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {hospitalRecommendations && hospitalRecommendations.recommendations.length > 0 && !isLoadingHospitals && (
        <Card className="shadow-xl">
          <CardHeader>
             <div className="flex items-center gap-2">
                <ListOrdered className="h-7 w-7 text-primary" />
                <CardTitle className="text-xl">Recommended Hospitals List</CardTitle>
            </div>
            <CardDescription>Based on assessed condition ({assessedConditionResult?.patientState}), location, and hospital data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {hospitalRecommendations.recommendations.map((rec, index) => (
                <AccordionItem value={`item-${index}`} key={rec.hospitalName} className={`bg-card border rounded-lg shadow-sm ${confirmedTransport?.hospitalId === rec.hospitalName ? 'border-green-500 shadow-md bg-green-50' : ''}`}>
                  <AccordionTrigger className="p-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            <span className={`flex items-center justify-center h-8 w-8 rounded-full ${index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} text-sm font-bold ${confirmedTransport?.hospitalId === rec.hospitalName ? 'bg-green-500 text-white' : ''}`}>
                                {index + 1}
                            </span>
                            <h3 className={`text-lg font-semibold text-left ${confirmedTransport?.hospitalId === rec.hospitalName ? 'text-green-700' : ''}`}>
                              {rec.hospitalName}
                              {confirmedTransport?.hospitalId === rec.hospitalName && (
                                <span className="ml-2 text-xs text-green-600 font-medium">✓ 이송 확정됨</span>
                              )}
                            </h3>
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
                            <p><strong>Estimated Arrival Time:</strong> {rec.estimatedArrivalTime}</p>
                        </div>
                         <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <p><strong>Reasoning:</strong></p>
                                <p className="pl-1 text-muted-foreground">{rec.reasoning}</p>
                            </div>
                        </div>
                        
                        {confirmedTransport?.hospitalId === rec.hospitalName ? (
                          <div className="px-3 py-2 bg-green-100 rounded-md border border-green-300 mt-2">
                            <p className="text-green-800 text-sm font-medium flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1.5 text-green-600" /> 
                              이 병원으로 환자 이송이 확정되었습니다
                            </p>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2" 
                            disabled={!!confirmedTransport}
                            onClick={() => {
                              if (confirmedTransport) return;
                              
                              // 이송 요청 생성
                              const requestId = `DISPATCH-${Date.now()}`;
                              const mockRequest: PatientAdmissionRequest = {
                                id: requestId,
                                patientInfo: { 
                                  age: 50, 
                                  gender: "Unknown" 
                                },
                                primarySymptoms: assessedConditionResult?.patientState || "미상",
                                assessedCondition: assessedConditionResult?.patientState || "미상",
                                incidentLocation: ambulanceLocation,
                                ambulanceId: `AMB-${Date.now().toString().slice(-5)}`,
                                etaToHospital: rec.estimatedArrivalTime || "15 min",
                                requestTimestamp: new Date().toISOString(),
                                status: "pending", // 상태를 pending으로 설정
                                hospitalId: rec.hospitalName
                              };
                              
                              // 요청 상태 설정 (실제로는 이 데이터가 병원 포털로 전송되어야 함)
                              // 여기서는 병원 포털에서 이 요청을 볼 수 있도록 로컬 스토리지에 저장
                              localStorage.setItem(`hospital_request_${requestId}`, JSON.stringify(mockRequest));
                              
                              // 알림 표시 업데이트
                              toast({
                                title: "환자 이송 요청 완료",
                                description: `${rec.hospitalName}에 환자 이송 요청을 보냈습니다. 병원 응답을 기다리세요.`,
                                variant: "default",
                              });
                            }}
                          >
                            {rec.hospitalName}에 환자 이송 요청
                          </Button>
                        )}
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
                <p className="text-lg">No hospitals available for recommendation.</p>
                <p className="text-sm text-muted-foreground">Adjust criteria or ensure hospital data is up-to-date.</p>
            </CardContent>
        </Card>
       )}
    </div>
  );
}

    