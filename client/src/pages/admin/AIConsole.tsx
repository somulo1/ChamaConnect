import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Slider
} from "@/components/ui/slider";
import {
  CheckCircle2,
  Brain,
  MessageSquare,
  BrainCircuit,
  Settings,
  Save,
  Sparkles,
  RefreshCcw,
  BotIcon,
  PenTool,
  MessageSquareWarning,
  ServerCrash,
  ShieldCheck,
  FileWarning
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AIConsole() {
  const [aiModel, setAiModel] = useState("gpt-4-turbo");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState("4096");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a financial assistant for a Chama application. Provide helpful advice about savings, investments, and financial planning. Be concise, accurate, and friendly."
  );
  const [moderationEnabled, setModerationEnabled] = useState(true);
  const [loggingEnabled, setLoggingEnabled] = useState(true);
  const [thresholdLevel, setThresholdLevel] = useState("medium");
  const [prohibitedTopics, setProhibitedTopics] = useState("gambling, illegal activities, adult content");
  
  const { toast } = useToast();

  // Mock API calls
  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      // Simulating API call
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "AI console settings have been updated successfully.",
        variant: "default",
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate();
  };

  const resetToDefault = () => {
    setAiModel("gpt-4-turbo");
    setTemperature([0.7]);
    setMaxTokens("4096");
    setSystemPrompt(
      "You are a financial assistant for a Chama application. Provide helpful advice about savings, investments, and financial planning. Be concise, accurate, and friendly."
    );
    setModerationEnabled(true);
    setLoggingEnabled(true);
    setThresholdLevel("medium");
    setProhibitedTopics("gambling, illegal activities, adult content");
    
    toast({
      title: "Settings reset",
      description: "AI console settings have been reset to default values.",
      variant: "default",
    });
  };

  return (
    <AdminLayout title="AI Console">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">AI Assistant Console</h2>
          <p className="text-muted-foreground">Configure AI behavior, responses, and moderation settings</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={resetToDefault}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          
          <Button 
            onClick={handleSaveSettings}
            disabled={saveSettingsMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General Settings
          </TabsTrigger>
          <TabsTrigger value="moderation">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Content Moderation
          </TabsTrigger>
          <TabsTrigger value="prompts">
            <PenTool className="h-4 w-4 mr-2" />
            System Prompts
          </TabsTrigger>
          <TabsTrigger value="logs">
            <MessageSquareWarning className="h-4 w-4 mr-2" />
            AI Logs & Analytics
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General AI Settings</CardTitle>
              <CardDescription>
                Configure the AI model and generation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ai-model">AI Model</Label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger id="ai-model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Recommended)</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                      <SelectItem value="claude-2">Claude 2</SelectItem>
                      <SelectItem value="llama-3">Llama 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    The AI model that will power your financial assistant
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="temperature">Temperature: {temperature[0]}</Label>
                  </div>
                  <Slider
                    id="temperature"
                    defaultValue={temperature}
                    max={1}
                    min={0}
                    step={0.1}
                    onValueChange={setTemperature}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Controls randomness: Lower values are more deterministic, higher values more creative
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    value={maxTokens}
                    onChange={e => setMaxTokens(e.target.value)}
                    type="number"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum length of response the AI can generate
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="logging">Response Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log AI responses for quality and improvement
                    </p>
                  </div>
                  <Switch
                    id="logging"
                    checked={loggingEnabled}
                    onCheckedChange={setLoggingEnabled}
                  />
                </div>
              </div>
              
              <Alert>
                <BrainCircuit className="h-5 w-5" />
                <AlertTitle>OpenAI API Connection</AlertTitle>
                <AlertDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-green-500">Connected</span>
                  </div>
                  <p className="text-sm mt-2">
                    Your API key is valid and connecting successfully to the OpenAI API.
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Content Moderation Tab */}
        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation Settings</CardTitle>
              <CardDescription>
                Control content filtering and prohibited topics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="moderation">Content Moderation</Label>
                  <p className="text-sm text-muted-foreground">
                    Filter harmful, inappropriate, or off-topic content
                  </p>
                </div>
                <Switch
                  id="moderation"
                  checked={moderationEnabled}
                  onCheckedChange={setModerationEnabled}
                />
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="threshold">Moderation Threshold</Label>
                <Select value={thresholdLevel} onValueChange={setThresholdLevel}>
                  <SelectTrigger id="threshold">
                    <SelectValue placeholder="Select threshold" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Allow most content)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="high">High (Strict filtering)</SelectItem>
                    <SelectItem value="extreme">Extreme (Financial topics only)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  How strictly the system should filter content
                </p>
              </div>
              
              <div>
                <Label htmlFor="prohibited">Prohibited Topics</Label>
                <Textarea
                  id="prohibited"
                  value={prohibitedTopics}
                  onChange={e => setProhibitedTopics(e.target.value)}
                  placeholder="Enter comma-separated list of prohibited topics"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Topics that will be filtered out from AI responses
                </p>
              </div>
              
              <Alert className="bg-amber-50 border-amber-200">
                <FileWarning className="h-5 w-5 text-amber-600" />
                <AlertTitle className="text-amber-800">Important Note</AlertTitle>
                <AlertDescription className="text-amber-700">
                  <p className="text-sm mt-2">
                    While moderation helps filter inappropriate content, no system is perfect. 
                    Regular reviews of AI responses are recommended.
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* System Prompts Tab */}
        <TabsContent value="prompts">
          <Card>
            <CardHeader>
              <CardTitle>System Prompts</CardTitle>
              <CardDescription>
                Configure the behavior instructions for the AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="system-prompt">Financial Assistant System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  placeholder="Enter system prompt for the AI"
                  rows={6}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This prompt guides the AI's behavior and sets its persona
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">General Financial Advice</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-xs">
                      You are a knowledgeable financial advisor. Provide helpful, accurate advice about savings, investments, and financial planning. Offer balanced perspectives and always remind users to consider their personal circumstances.
                    </p>
                  </CardContent>
                  <CardFooter className="py-3 flex justify-end">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                      setSystemPrompt("You are a knowledgeable financial advisor. Provide helpful, accurate advice about savings, investments, and financial planning. Offer balanced perspectives and always remind users to consider their personal circumstances.");
                    }}>
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Chama-Specific Assistance</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-xs">
                      You are a specialized Chama group advisor. Help members manage their group savings, plan meetings, handle contributions, and resolve conflicts. Provide culturally relevant advice for cooperative financial groups.
                    </p>
                  </CardContent>
                  <CardFooter className="py-3 flex justify-end">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                      setSystemPrompt("You are a specialized Chama group advisor. Help members manage their group savings, plan meetings, handle contributions, and resolve conflicts. Provide culturally relevant advice for cooperative financial groups.");
                    }}>
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <Alert>
                <Sparkles className="h-5 w-5" />
                <AlertTitle>Prompt Guidelines</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                    <li>Be specific about the AI's role and tone</li>
                    <li>Include knowledge boundaries and disclaimer requirements</li>
                    <li>Specify how to handle sensitive financial topics</li>
                    <li>Define when to suggest human assistance</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* AI Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>AI Usage & Analytics</CardTitle>
              <CardDescription>
                View statistics and logs of AI assistant usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Interactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3,248</div>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Token Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1.2M</div>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Flagged Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">23</div>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Recent Interactions</h3>
                <div className="border rounded-md divide-y">
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">Investment advice for beginner</p>
                        <p className="text-xs text-muted-foreground">User ID: 10456</p>
                      </div>
                      <div className="text-xs text-muted-foreground">3 mins ago</div>
                    </div>
                    <div className="flex items-center mt-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">Clean content</span>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">Loan distribution calculation</p>
                        <p className="text-xs text-muted-foreground">User ID: 10238</p>
                      </div>
                      <div className="text-xs text-muted-foreground">10 mins ago</div>
                    </div>
                    <div className="flex items-center mt-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">Clean content</span>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">Conflict resolution in chama</p>
                        <p className="text-xs text-muted-foreground">User ID: 10872</p>
                      </div>
                      <div className="text-xs text-muted-foreground">22 mins ago</div>
                    </div>
                    <div className="flex items-center mt-2">
                      <ServerCrash className="h-3 w-3 text-amber-500 mr-1" />
                      <span className="text-xs text-amber-600">Token limit reached</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Download Full Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}