
import { AlertCircle } from 'lucide-react';

export const SecurityInfoBanner = () => {
  return (
    <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium">Security Information</h4>
          <p className="text-sm mt-1">
            API keys are stored securely in your Supabase database with encryption. For maximum security, we recommend creating dedicated API keys with minimum required permissions.
          </p>
        </div>
      </div>
    </div>
  );
};
