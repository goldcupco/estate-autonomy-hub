
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar, 
  FileText,
  Clock,
  User,
  Pencil,
  Check,
  X
} from 'lucide-react';

// Dummy activity data
const ACTIVITY_DATA = [
  {
    id: "act1",
    type: "email",
    title: "Email Sent",
    description: "Sent property details to client",
    date: "2023-06-15T14:30:00",
    user: "Jane Agent",
    icon: Mail,
    color: "blue"
  },
  {
    id: "act2",
    type: "call",
    title: "Call Completed",
    description: "Discussed property features and pricing",
    date: "2023-06-14T11:20:00",
    user: "Jane Agent",
    duration: "12 minutes",
    icon: Phone,
    color: "green"
  },
  {
    id: "act3",
    type: "sms",
    title: "SMS Sent",
    description: "Sent showing confirmation",
    date: "2023-06-12T09:45:00",
    user: "Jane Agent",
    icon: MessageSquare,
    color: "yellow"
  },
  {
    id: "act4",
    type: "schedule",
    title: "Showing Scheduled",
    description: "Property showing scheduled with client",
    date: "2023-06-10T16:00:00",
    user: "Jane Agent",
    icon: Calendar,
    color: "orange"
  },
  {
    id: "act5",
    type: "contract",
    title: "Contract Sent",
    description: "Sent sales contract for review",
    date: "2023-06-08T13:15:00",
    user: "Jane Agent",
    icon: FileText,
    color: "purple"
  },
  {
    id: "act6",
    type: "status",
    title: "Status Changed",
    description: "Changed property status to 'Pending'",
    date: "2023-06-05T10:30:00",
    user: "Jane Agent",
    icon: Pencil,
    color: "red"
  }
];

// Activity type colors
const getTypeColor = (type: string) => {
  switch(type) {
    case 'email': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'call': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    case 'sms': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'schedule': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    case 'contract': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    case 'status': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

// Format the date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

interface ActivityProps {
  propertyId: string;
}

export function PropertyActivity({ propertyId }: ActivityProps) {
  const [filter, setFilter] = useState<string | null>(null);
  
  // Filter activities based on selected filter
  const filteredActivities = filter 
    ? ACTIVITY_DATA.filter(activity => activity.type === filter)
    : ACTIVITY_DATA;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button 
          size="sm" 
          variant={filter === null ? "default" : "outline"} 
          onClick={() => setFilter(null)}
        >
          All
        </Button>
        <Button 
          size="sm" 
          variant={filter === "email" ? "default" : "outline"} 
          onClick={() => setFilter("email")}
        >
          <Mail className="h-4 w-4 mr-2" />
          Emails
        </Button>
        <Button 
          size="sm" 
          variant={filter === "call" ? "default" : "outline"} 
          onClick={() => setFilter("call")}
        >
          <Phone className="h-4 w-4 mr-2" />
          Calls
        </Button>
        <Button 
          size="sm" 
          variant={filter === "sms" ? "default" : "outline"} 
          onClick={() => setFilter("sms")}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          SMS
        </Button>
        <Button 
          size="sm" 
          variant={filter === "contract" ? "default" : "outline"} 
          onClick={() => setFilter("contract")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Contracts
        </Button>
      </div>
      
      <div className="space-y-6">
        {filteredActivities.length > 0 ? (
          filteredActivities.map(activity => (
            <div key={activity.id} className="flex gap-4 group">
              <div className={`min-w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(activity.type)}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <p className="font-medium">{activity.title}</p>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatDate(activity.date)}</span>
                  {activity.duration && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{activity.duration}</span>
                    </>
                  )}
                  <span className="mx-2">•</span>
                  <User className="h-3 w-3 mr-1" />
                  <span>{activity.user}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No activities found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
