
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
  { hospitalName: "서울대학교병원", hospitalLocation: "서울특별시 종로구 대학로 101", capacity: 90, specialties: ["Emergency Medicine", "Trauma Center", "Cardio-Cerebrovascular Center", "ICU"] , id: "HOS_SNUH" },
  { hospitalName: "세브란스병원", hospitalLocation: "서울특별시 서대문구 연세로 50-1", capacity: 85, specialties: ["Emergency Medicine", "Cardiology", "Neurosurgery", "Pediatric Emergency"] , id: "HOS_SEVERANCE"},
  { hospitalName: "서울아산병원", hospitalLocation: "서울특별시 송파구 올림픽로43길 88", capacity: 95, specialties: ["Emergency Medicine", "Trauma Center", "Cancer Center", "Organ Transplantation"] , id: "HOS_ASAN"},
  { hospitalName: "삼성서울병원", hospitalLocation: "서울특별시 강남구 일원로 81", capacity: 88, specialties: ["Emergency Medicine", "Stroke Center", "Heart Center", "ICU"] , id: "HOS_SAMSUNG"},
  { hospitalName: "서울성모병원", hospitalLocation: "서울특별시 서초구 반포대로 222", capacity: 82, specialties: ["Emergency Medicine", "Hematology", "Cardiovascular Medicine", "Neuroscience Center"], id: "HOS_STMARY" },
  { hospitalName: "고려대학교 안암병원", hospitalLocation: "서울특별시 성북구 고려대로 73", capacity: 75, specialties: ["Emergency Medicine", "Trauma Surgery", "Gastroenterology"] , id: "HOS_KUANAM"},
  { hospitalName: "경희대학교병원", hospitalLocation: "서울특별시 동대문구 경희대로 23", capacity: 70, specialties: ["Emergency Medicine", "Korean Medicine Collaboration", "Rheumatology"] , id: "HOS_KHU"},
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
    setAmbulanceLocation("Near Gangnam Station"); // Default Seoul location
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!voiceInput.trim() || !ambulanceLocation.trim()) {
      setError("Patient condition and ambulance location cannot be empty.");
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
        title: "Assessment Complete",
        description: "Patient condition has been initially assessed.",
      });

      setIsLoadingCondition(false);
      setIsLoadingHospitals(true);

      const hospitalDataForAI = mockSeoulHospitalData.map(h => ({
        hospitalName: h.hospitalName,
        hospitalLocation: h.hospitalLocation,
        capacity: h.capacity,
        specialties: h.specialties,
      }));

      const recommendationInput: SmartHospitalRecommendationInput = {
        patientCondition: conditionResult.patientState,
        ambulanceLocation,
        hospitalData: hospitalDataForAI,
      };
      const recommendationResult = await smartHospitalRecommendation(recommendationInput);
      setHospitalRecommendations(recommendationResult);
      toast({
        title: "Hospital Recommendations Ready",
        description: "AI has recommended hospitals based on the assessed condition.",
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

  return (
    <div className="container mx-auto py-8 space-y-8">
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
                <Textarea
                  id="voiceInput"
                  placeholder="E.g., '45-year-old male, complaining of severe chest pain and difficulty breathing...'"
                  value={voiceInput}
                  onChange={(e) => setVoiceInput(e.target.value)}
                  rows={5}
                  className="text-base"
                  disabled={isLoadingCondition || isLoadingHospitals}
                />
                 <p className="text-xs text-muted-foreground">
                  Simulate voice input by typing the transcribed text.
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
              <CardTitle className="text-xl">Patient Condition Assessment Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h3 className="text-md font-semibold">AI Classified Patient State:</h3>
              <p className="text-lg p-3 bg-secondary/30 rounded-md border border-secondary text-secondary-foreground">
                {assessedConditionResult.patientState}
              </p>
              <p className="text-xs text-muted-foreground">
                This classification is based on AI analysis. Always confirm with medical protocols.
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
                            <p><strong>Estimated Arrival Time:</strong> {rec.estimatedArrivalTime}</p>
                        </div>
                         <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <p><strong>Reasoning:</strong></p>
                                <p className="pl-1 text-muted-foreground">{rec.reasoning}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => toast({title: `Dispatch order to ${rec.hospitalName}`, description: "This is a simulated action."})}>
                            Dispatch to {rec.hospitalName}
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
                <p className="text-lg">No hospitals available for recommendation.</p>
                <p className="text-sm text-muted-foreground">Adjust criteria or ensure hospital data is up-to-date.</p>
            </CardContent>
        </Card>
       )}
    </div>
  );
}

    