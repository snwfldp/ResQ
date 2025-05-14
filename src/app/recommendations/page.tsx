
"use client";

import { useState, type FormEvent, useEffect } from "react";
import { smartHospitalRecommendation, type SmartHospitalRecommendationInput, type SmartHospitalRecommendationOutput } from "@/ai/flows/smart-hospital-recommendation";
import type { HospitalDataForAI } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MapPin, Send, Sparkles, Stethoscope, Clock, Info, ListOrdered, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Mock hospital data
const mockHospitalData: HospitalDataForAI[] = [
  { hospitalName: "City General Hospital", hospitalLocation: "123 Main St, Cityville", capacity: 85, specialties: ["Cardiology", "Neurology", "Trauma"] },
  { hospitalName: "Suburb Community Hospital", hospitalLocation: "456 Oak Ave, Suburbia", capacity: 60, specialties: ["Pediatrics", "General Surgery"] },
  { hospitalName: "Metro Health Center", hospitalLocation: "789 Pine Ln, Metropolis", capacity: 95, specialties: ["Oncology", "Trauma", "Orthopedics"] },
  { hospitalName: "Riverside Medical", hospitalLocation: "101 River Rd, Riverside", capacity: 70, specialties: ["Cardiology", "Pulmonology"] },
  { hospitalName: "Saint Luke's Emergency", hospitalLocation: "202 Church St, Old Town", capacity: 50, specialties: ["Emergency Medicine", "Trauma"] },
  { hospitalName: "University Medical Campus", hospitalLocation: "303 College Dr, University City", capacity: 90, specialties: ["Neurology", "Neurosurgery", "Burn Unit"] },
  { hospitalName: "Hope Children's Hospital", hospitalLocation: "404 Kids Way, Childstown", capacity: 75, specialties: ["Pediatrics", "Pediatric Surgery"] },
];

export default function HospitalRecommendationPage() {
  const [patientCondition, setPatientCondition] = useState<string>("");
  const [ambulanceLocation, setAmbulanceLocation] = useState<string>("");
  const [recommendations, setRecommendations] = useState<SmartHospitalRecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Effect to pre-fill ambulance location (e.g., using browser geolocation if allowed, or a default)
  useEffect(() => {
    // Basic example: set a default location. In a real app, you might use navigator.geolocation
    setAmbulanceLocation("Central City Park"); 
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!patientCondition.trim() || !ambulanceLocation.trim()) {
      setError("Patient condition and ambulance location cannot be empty.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const input: SmartHospitalRecommendationInput = {
        patientCondition,
        ambulanceLocation,
        hospitalData: mockHospitalData,
      };
      const result = await smartHospitalRecommendation(input);
      setRecommendations(result);
      toast({
        title: "Recommendations Generated",
        description: "AI has provided hospital recommendations.",
      });
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to get recommendations: ${errorMessage}`);
      toast({
        title: "Recommendation Failed",
        description: `Error: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
                <Stethoscope className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Smart Hospital Finder</CardTitle>
            </div>
            <CardDescription>
              Input patient and ambulance details to get AI-powered hospital recommendations.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="patientCondition" className="text-base font-medium">Patient Condition</Label>
                <Textarea
                  id="patientCondition"
                  placeholder="Describe patient's current condition, symptoms, and suspected issues..."
                  value={patientCondition}
                  onChange={(e) => setPatientCondition(e.target.value)}
                  rows={5}
                  className="text-base"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ambulanceLocation" className="text-base font-medium">Ambulance Location</Label>
                <div className="relative">
                  <Input
                    id="ambulanceLocation"
                    type="text"
                    placeholder="E.g., 'Cross St & Main Ave' or GPS coordinates"
                    value={ambulanceLocation}
                    onChange={(e) => setAmbulanceLocation(e.target.value)}
                    className="pr-10 text-base"
                    disabled={isLoading}
                  />
                   <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
              <Button type="submit" disabled={isLoading} className="px-8 py-3 text-base">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Finding Hospitals...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="lg:col-span-2">
          {isLoading && !recommendations && (
             <Card className="shadow-xl h-full flex flex-col items-center justify-center">
                <CardContent className="text-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-lg text-muted-foreground">Generating hospital recommendations...</p>
                    <p className="text-sm text-muted-foreground">This may take a few moments.</p>
                </CardContent>
            </Card>
          )}
          {recommendations && recommendations.recommendations.length > 0 && (
            <Card className="shadow-xl">
              <CardHeader>
                 <div className="flex items-center gap-2">
                    <ListOrdered className="h-8 w-8 text-primary" />
                    <CardTitle className="text-2xl">Top Hospital Recommendations</CardTitle>
                </div>
                <CardDescription>Based on patient condition, location, and hospital capacity/specialties.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {recommendations.recommendations.map((rec, index) => (
                    <AccordionItem value={`item-${index}`} key={rec.hospitalName} className="bg-card border border-border rounded-lg shadow-sm">
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
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => alert(`Dispatching to ${rec.hospitalName}`)}>
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
           {recommendations && recommendations.recommendations.length === 0 && !isLoading && (
            <Card className="shadow-xl h-full flex flex-col items-center justify-center">
                <CardContent className="text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg">No recommendations available at this time.</p>
                    <p className="text-sm text-muted-foreground">Please try adjusting your criteria or check back later.</p>
                </CardContent>
            </Card>
           )}
        </div>
      </div>
    </div>
  );
}
