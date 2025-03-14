
import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Check, 
  Clock,
  FileText
} from 'lucide-react';
import { Lead, Note } from './LeadTable';

interface LeadNotesProps {
  lead: Lead;
  onAddNote: (leadId: string, note: Omit<Note, 'id'>) => void;
}

export function LeadNotes({ lead, onAddNote }: LeadNotesProps) {
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<Note['type']>('other');

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    
    onAddNote(lead.id, {
      text: noteText,
      type: noteType,
      timestamp: new Date().toISOString()
    });
    
    setNoteText('');
  };

  const getNoteIcon = (type: Note['type']) => {
    switch (type) {
      case 'sms': return <MessageCircle className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'letter': return <Mail className="h-4 w-4" />;
      case 'contract': return <Check className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getNoteTypeLabel = (type: Note['type']) => {
    switch (type) {
      case 'sms': return 'SMS';
      case 'call': return 'Call';
      case 'letter': return 'Letter';
      case 'contract': return 'Contract';
      default: return 'Note';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note about this lead..."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex gap-2">
            <Select value={noteType} onValueChange={(value) => setNoteType(value as Note['type'])}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Note Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="letter">Letter</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddNote}>Add Note</Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {lead.notes && lead.notes.length > 0 ? (
          <div className="space-y-3">
            {lead.notes.map((note) => (
              <Card key={note.id} className="border">
                <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getNoteIcon(note.type)}
                    <CardTitle className="text-sm font-medium">
                      {getNoteTypeLabel(note.type)}
                    </CardTitle>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(new Date(note.timestamp), 'MMM d, yyyy h:mm a')}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-sm">{note.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground border rounded-md">
            No notes for this lead yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default LeadNotes;
