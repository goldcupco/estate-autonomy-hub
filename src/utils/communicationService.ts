
import { useSupabaseCommunication } from './supabaseCommunicationService';
import { useToast } from "@/hooks/use-toast";

export function useCommunication() {
  const { 
    getProviders, 
    makeCall, 
    endCall, 
    getCallHistory, 
    sendSms, 
    getSmsHistory 
  } = useSupabaseCommunication();
  const { toast } = useToast();

  // Check if user has configured providers
  const hasConfiguredCallProvider = async (): Promise<boolean> => {
    try {
      const providers = await getProviders();
      return providers.length > 0;
    } catch (error) {
      console.error('Error checking for providers:', error);
      return false;
    }
  };

  return {
    // Re-export the base functions
    getProviders,
    makeCall,
    endCall,
    getCallHistory,
    sendSms,
    getSmsHistory,
    
    // Helper functions
    hasConfiguredCallProvider
  };
}
