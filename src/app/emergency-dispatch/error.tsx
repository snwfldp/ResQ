
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="max-w-lg w-full text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl mt-4">Something went wrong!</CardTitle>
          <CardDescription>
            An error occurred on the Emergency Dispatch page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error.message || "An unexpected error occurred."}</p>
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

    