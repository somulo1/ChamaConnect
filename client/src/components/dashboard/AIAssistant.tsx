import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { Link } from "wouter";

interface AIAssistantProps {
  suggestion: string;
  preview?: boolean;
}

export default function AIAssistant({ suggestion, preview = false }: AIAssistantProps) {
  const [showTips, setShowTips] = useState(false);

  const tips = [
    "Set up automatic savings by transferring funds on each payday.",
    "Pay yourself first: allocate savings before discretionary spending.",
    "Try the 50/30/20 rule: 50% on needs, 30% on wants, 20% on savings.",
    "Create an emergency fund of 3-6 months of expenses before investing."
  ];

  return (
    <Card>
      <CardContent className={preview ? "pt-6" : "pt-0"}>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Financial Insights</h4>
            <p className="text-sm text-muted-foreground mt-1">{suggestion}</p>
            
            {showTips && (
              <div className="mt-4 space-y-2">
                <h5 className="text-sm font-medium">Tips to save more effectively:</h5>
                <ul className="space-y-1">
                  {tips.map((tip, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start">
                      <span className="text-primary mr-2">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-4 flex space-x-3">
              {preview ? (
                <>
                  <Button 
                    onClick={() => setShowTips(!showTips)}
                    className="bg-primary text-white"
                  >
                    {showTips ? "Hide Tips" : "Show Me Tips"}
                  </Button>
                  <Button variant="outline">Remind Later</Button>
                </>
              ) : (
                <Button asChild>
                  <Link to="/assistant">Open Full Assistant</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
