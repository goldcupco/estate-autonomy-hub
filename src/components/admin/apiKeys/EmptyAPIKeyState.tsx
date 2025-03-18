
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';

interface EmptyAPIKeyStateProps {
  onAddClick: () => void;
}

export const EmptyAPIKeyState = ({ onAddClick }: EmptyAPIKeyStateProps) => {
  return (
    <div className="text-center py-10 text-muted-foreground">
      <Key className="mx-auto h-12 w-12 opacity-20 mb-3" />
      <h3 className="text-lg font-medium mb-1">No API Keys</h3>
      <p className="mb-4">You haven't added any API keys yet.</p>
      <Button onClick={onAddClick}>
        Add Your First API Key
      </Button>
    </div>
  );
};
