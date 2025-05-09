import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Button from '@/components/shared/Button';
import { useCreditStore } from '@/store/useCreditStore';
import { useUnlockedFlowStore } from '@/store/useUnlockedFlowStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

interface FlowUnlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  flowId: string;
  title: string;
  unlockPrice: number;
  onUnlocked: () => void;
}

const FlowUnlockDialog: React.FC<FlowUnlockDialogProps> = ({
  isOpen,
  onClose,
  flowId,
  title,
  unlockPrice,
  onUnlocked,
}) => {
  const { credits, deductCredits } = useCreditStore();
  const { unlockFlow } = useUnlockedFlowStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleUnlock = async () => {
    try {
      setIsSubmitting(true);
      
      // Call API endpoint to unlock the flow
      const response = await fetch('/api/flows/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowId,
          amount: unlockPrice,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unlock flow');
      }
      
      // Update local stores
      deductCredits(unlockPrice, 'Flow unlock', flowId);
      unlockFlow(flowId);
      
      // Call callback
      onUnlocked();
      
      // Close dialog
      onClose();
    } catch (error) {
      console.error('Error unlocking flow:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unlock Flow</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Unlock <span className="text-blue-600">{title}</span>
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            This will permanently unlock this flow for your account, allowing you to run, clone, and modify it.
          </p>
          
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Current balance:</span>
              <span className="text-sm font-medium">{credits.toLocaleString()} credits</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Unlock price:</span>
              <span className="text-sm font-medium text-red-500">-{unlockPrice.toLocaleString()} credits</span>
            </div>
            <div className="border-t border-gray-200 pt-1 mt-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">New balance:</span>
                <span className="text-sm font-medium">{(credits - unlockPrice).toLocaleString()} credits</span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Benefits:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Run this flow as many times as you want (regular run costs still apply)</li>
              <li>Clone this flow to make your own version</li>
              <li>Modify any aspect of the flow to suit your needs</li>
              <li>Use it as a template for creating similar flows</li>
            </ul>
          </div>
          
          {credits < unlockPrice && (
            <div className="text-red-500 text-sm flex items-center p-2 bg-red-50 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              You don't have enough credits. Please add more credits to continue.
            </div>
          )}
        </div>
        
        <DialogFooter className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUnlock}
            disabled={credits < unlockPrice || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <LoadingIndicator size="sm" className="mr-2" />
                Processing...
              </span>
            ) : (
              `Unlock for ${unlockPrice.toLocaleString()} credits`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlowUnlockDialog;