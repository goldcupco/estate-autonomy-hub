
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
  FileText,
  ArrowRight,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { Lead, Note } from './types';
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
      case 'stage_change': return <ArrowRight className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getNoteTypeLabel = (type: Note['type']) => {
    switch (type) {
      case 'sms': return 'SMS';
      case 'call': return 'Call';
      case 'letter': return 'Letter';
      case 'contract': return 'Contract';
      case 'stage_change': return 'Stage Change';
      default: return 'Note';
    }
  };

  const formatDateTime = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
  };

  // Sort notes by timestamp, newest first
  const sortedNotes = [...(lead.notes || [])].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

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
        {sortedNotes.length > 0 ? (
          <div className="space-y-3">
            {sortedNotes.map((note) => (
              <Card key={note.id} className="border">
                <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getNoteIcon(note.type)}
                    <CardTitle className="text-sm font-medium">
                      {getNoteTypeLabel(note.type)}
                    </CardTitle>
                    
                    {note.type === 'stage_change' && note.metadata && (
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-1">{note.metadata.previousStage}</Badge>
                        <ArrowRight className="h-3 w-3 mx-1" /> 
                        <Badge variant="default">{note.metadata.newStage}</Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDateTime(note.timestamp)}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-sm whitespace-pre-line">{note.text}</p>
                  
                  {note.metadata && (
                    <Accordion type="single" collapsible className="w-full mt-2">
                      <AccordionItem value="details">
                        <AccordionTrigger className="text-xs text-muted-foreground py-2">
                          View Details
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="mt-2 pt-2 border-t text-sm text-muted-foreground space-y-2">
                            {/* SMS Details */}
                            {note.type === 'sms' && note.metadata?.smsContent && (
                              <div className="text-xs p-2 bg-gray-50 rounded border">
                                <p className="font-medium">SMS Content:</p>
                                <p className="whitespace-pre-line">{note.metadata.smsContent}</p>
                                {note.metadata.sender && <p className="mt-1">From: {note.metadata.sender}</p>}
                                {note.metadata.recipient && <p>To: {note.metadata.recipient}</p>}
                              </div>
                            )}
                            
                            {/* Call Details */}
                            {note.type === 'call' && (
                              <div className="space-y-2">
                                <div className="flex items-center mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>
                                    {note.metadata?.callStartTime && `Started: ${formatDateTime(note.metadata.callStartTime)}`}
                                  </span>
                                </div>
                                
                                {note.metadata?.callDuration && (
                                  <div className="flex items-center mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>Duration: {note.metadata.callDuration}s</span>
                                  </div>
                                )}
                                
                                {note.metadata?.recordingUrl && (
                                  <div className="flex items-center mt-1">
                                    <Phone className="h-3 w-3 mr-1" />
                                    <a 
                                      href={note.metadata.recordingUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline flex items-center"
                                    >
                                      Recording <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Letter Details */}
                            {note.type === 'letter' && (
                              <div className="space-y-2">
                                {note.metadata?.letterContent && (
                                  <div className="text-xs p-2 bg-gray-50 rounded border">
                                    <p className="font-medium">Letter Content:</p>
                                    <p className="whitespace-pre-line">{note.metadata.letterContent}</p>
                                  </div>
                                )}
                                
                                {note.metadata?.trackingNumber && (
                                  <div className="flex items-center mt-1">
                                    <FileText className="h-3 w-3 mr-1" />
                                    <span>Tracking #: {note.metadata.trackingNumber}</span>
                                  </div>
                                )}
                                
                                {note.metadata?.letterUrl && (
                                  <div className="flex items-center mt-1">
                                    <Mail className="h-3 w-3 mr-1" />
                                    <a 
                                      href={note.metadata.letterUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline flex items-center"
                                    >
                                      View Letter <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Contract Details */}
                            {note.type === 'contract' && (
                              <div className="space-y-2">
                                {note.metadata?.contractContent && (
                                  <div className="text-xs p-2 bg-gray-50 rounded border">
                                    <p className="font-medium">Contract Details:</p>
                                    <p className="whitespace-pre-line">{note.metadata.contractContent}</p>
                                  </div>
                                )}
                                
                                {note.metadata?.contractUrl && (
                                  <div className="flex items-center mt-1">
                                    <Check className="h-3 w-3 mr-1" />
                                    <a 
                                      href={note.metadata.contractUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline flex items-center"
                                    >
                                      View Contract <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Stage Change Details */}
                            {note.type === 'stage_change' && note.metadata && (
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <ArrowRight className="h-3 w-3 mr-1" />
                                  <span>
                                    Changed from {note.metadata.previousStage || "New"} to {note.metadata.newStage}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
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
