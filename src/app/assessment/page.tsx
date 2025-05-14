
"use client";

import { useState, type FormEvent } from "react";
import { assessCondition, type AssessConditionInput, type AssessConditionOutput } from "@/ai/flows/condition-assessment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Mic, Send, Sparkles, Thermometer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ConditionAssessmentPage() {
  const [voiceInput, setVoiceInput] = useState<string>("");
  const [assessmentResult, setAssessmentResult] = useState<AssessConditionOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

  return (
    <div className="container mx-auto py-8">
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
              <CardTitle className="text-2xl">Assessment Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Patient State Classification:</h3>
              <p className="text-xl p-4 bg-secondary/30 rounded-md border border-secondary text-secondary-foreground">
                {assessmentResult.patientState}
              </p>
              <p className="text-sm text-muted-foreground">
                This classification is based on the AI's analysis of the provided input.
                Always confirm with standard medical protocols.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
