
import { Button } from '@/components/ui/button';
import { Key, AlertCircle } from 'lucide-react';

interface EmptyAPIKeyStateProps {
  onAddClick: () => void;
}

export const EmptyAPIKeyState = ({ onAddClick }: EmptyAPIKeyStateProps) => {
  return (
    <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg p-8">
      <Key className="mx-auto h-12 w-12 opacity-20 mb-3" />
      <h3 className="text-lg font-medium mb-1">No API Keys</h3>
      <p className="mb-4">You haven't added any API keys yet.</p>
      <div className="flex flex-col gap-4 items-center">
        <Button onClick={onAddClick}>
          Add Your First API Key
        </Button>
        <div className="text-xs text-muted-foreground flex items-center mt-4">
          <AlertCircle className="h-3 w-3 mr-1" />
          <span>API keys are securely stored in your Supabase database</span>
        </div>
      </div>
    </div>
  );
};
