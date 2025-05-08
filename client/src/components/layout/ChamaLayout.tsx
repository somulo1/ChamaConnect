import { useState } from "react";
import { useParams, Link } from "wouter";
import UserLayout from "./UserLayout";
import { 
  LayoutDashboard, Users, Calculator, FileText, Settings, 
  Calendar, ArrowLeft 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Chama } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface ChamaLayoutProps {
  children: React.ReactNode;
}

export default function ChamaLayout({ children }: ChamaLayoutProps) {
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id);
  
  const { data: chama, isLoading } = useQuery<Chama>({
    queryKey: [`/api/chamas/${chamaId}`],
    enabled: !isNaN(chamaId)
  });

  if (isNaN(chamaId)) {
    return (
      <UserLayout title="Invalid Chama">
        <div className="p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Invalid Chama ID</h2>
          <p className="mb-6">The requested chama could not be found.</p>
          <Button asChild>
            <Link to="/">Go Back Home</Link>
          </Button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title={isLoading ? "Loading Chama..." : chama?.name || "Chama Dashboard"}>
      <div className="mb-6">
        <Button variant="ghost" asChild className="gap-1 mb-4 -ml-2 p-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
        
        {isLoading ? (
          <Skeleton className="h-10 w-64 mb-2" />
        ) : (
          <h1 className="text-2xl font-semibold">{chama?.name}</h1>
        )}
        
        {isLoading ? (
          <Skeleton className="h-5 w-48" />
        ) : (
          <p className="text-muted-foreground">{chama?.description || "No description provided"}</p>
        )}
      </div>
      
      <div className="overflow-x-auto pb-2 -mx-4 px-4 md:px-0 md:mx-0">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard" asChild>
              <Link to={`/chama/${chamaId}`}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </TabsTrigger>
            <TabsTrigger value="members" asChild>
              <Link to={`/chama/${chamaId}/members`}>
                <Users className="h-4 w-4 mr-2" />
                Members
              </Link>
            </TabsTrigger>
            <TabsTrigger value="contributions" asChild>
              <Link to={`/chama/${chamaId}/contributions`}>
                <Calculator className="h-4 w-4 mr-2" />
                Contributions
              </Link>
            </TabsTrigger>
            <TabsTrigger value="meetings" asChild>
              <Link to={`/chama/${chamaId}/meetings`}>
                <Calendar className="h-4 w-4 mr-2" />
                Meetings
              </Link>
            </TabsTrigger>
            <TabsTrigger value="documents" asChild>
              <Link to={`/chama/${chamaId}/documents`}>
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </Link>
            </TabsTrigger>
            <TabsTrigger value="settings" asChild>
              <Link to={`/chama/${chamaId}/settings`}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div>
        {children}
      </div>
    </UserLayout>
  );
}
