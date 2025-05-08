import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import ChamaLayout from "@/components/layout/ChamaLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Users, Clock, Plus } from "lucide-react";
import { Meeting } from "@shared/schema";

export default function ChamaMeetings() {
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  
  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: [`/api/chamas/${chamaId}/meetings`],
    enabled: !isNaN(chamaId)
  });

  // Filter meetings into upcoming and past
  const now = new Date();
  const upcomingMeetings = meetings
    .filter(meeting => new Date(meeting.scheduledFor) > now)
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
  
  const pastMeetings = meetings
    .filter(meeting => new Date(meeting.scheduledFor) <= now)
    .sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime());

  const handleCreateMeeting = () => {
    if (!selectedDate || !time || !title) return;
    
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledFor = new Date(selectedDate);
    scheduledFor.setHours(hours, minutes);
    
    // Here you would call your API to create the meeting
    console.log("Creating meeting", {
      title,
      description,
      location,
      scheduledFor
    });
    
    // Reset form
    setTitle("");
    setDescription("");
    setLocation("");
    setTime("");
    setSelectedDate(undefined);
    setIsCreateDialogOpen(false);
  };

  return (
    <ChamaLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Meetings</h2>
          <p className="text-muted-foreground">Schedule and manage chama meetings</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
              <DialogDescription>
                Set the details for the chama meeting. All members will be notified.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Monthly Contribution Meeting"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Agenda and other details..."
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="border rounded-md"
                  disabled={(date) => date < new Date()}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Virtual or physical location"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateMeeting}
                disabled={!selectedDate || !time || !title}
              >
                Schedule Meeting
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="h-24 flex items-center justify-center">
              <p>Loading meetings...</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming meetings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
            {upcomingMeetings.length > 0 ? (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <Card key={meeting.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium">{meeting.title}</h4>
                          <p className="text-muted-foreground text-sm mb-4">
                            {meeting.description || "No description provided"}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                              {format(new Date(meeting.scheduledFor), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                            </div>
                            {meeting.location && (
                              <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                {meeting.location}
                              </div>
                            )}
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              Starts in {formatDistanceToNow(new Date(meeting.scheduledFor))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
                          <Button variant="secondary">
                            View Details
                          </Button>
                          <Button variant="outline">
                            <Users className="h-4 w-4 mr-2" />
                            RSVP
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No upcoming meetings scheduled</p>
                  <Button 
                    className="mt-4" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule a Meeting
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Past meetings */}
          {pastMeetings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Past Meetings</h3>
              <div className="space-y-4">
                {pastMeetings.map((meeting) => (
                  <Card key={meeting.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium">{meeting.title}</h4>
                          <p className="text-muted-foreground text-sm mb-4">
                            {meeting.description || "No description provided"}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                              {format(new Date(meeting.scheduledFor), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                            </div>
                            {meeting.location && (
                              <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                {meeting.location}
                              </div>
                            )}
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              {formatDistanceToNow(new Date(meeting.scheduledFor))} ago
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Button variant="outline">
                            View Minutes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </ChamaLayout>
  );
}