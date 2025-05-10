import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Button from '@/components/shared/Button';
import { getCostBreakdown } from '@/lib/models/modelRegistry';
import { useCreditStore } from '@/store/useCreditStore';
import { useUserStore } from '@/store/useUserStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

interface CreditConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  promptId: string;
  modelId: string;
  title: string;
}

const CreditConfirmationDialog: React.FC<CreditConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  promptId,
  modelId,
  title,
}) => {
  const { credits, setCredits } = useCreditStore();
  const { user } = useUserStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Get cost breakdown
  const costBreakdown = getCostBreakdown(modelId, 'medium', 0);
  const totalCost = costBreakdown.totalCost;
  
  // Fetch latest credits when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Attempt to refresh credit information from the server
      fetch('/api/credits/balance')
        .then(res => res.json())
        .then(data => {
          if (data.balance !== undefined) {
            // Update local credits state with latest from server
            console.log('Updated credits from server:', data.balance);
            setCredits(data.balance);
          }
        })
        .catch(err => console.error('Failed to refresh credits:', err));
    }
  }, [isOpen, setCredits]);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      
      // Call API endpoint to confirm credit deduction
      const response = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalCost,
          reason: 'Run prompt',
          itemId: promptId,
          itemType: 'prompt',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to deduct credits');
      }
      
      // Proceed with prompt execution
      onConfirm();
    } catch (error) {
      console.error('Error deducting credits:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Prompt Execution</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            You are about to run: <span className="text-blue-600">{title}</span>
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            This will deduct {totalCost.toLocaleString()} credits from your balance.
          </p>
          
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Current balance:</span>
              <span className="text-sm font-medium">{credits.toLocaleString()} credits</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Cost:</span>
              <span className="text-sm font-medium text-red-500">-{totalCost.toLocaleString()} credits</span>
            </div>
            <div className="border-t border-gray-200 pt-1 mt-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">New balance:</span>
                <span className="text-sm font-medium">{(credits - totalCost).toLocaleString()} credits</span>
              </div>
            </div>
          </div>
          
          {costBreakdown && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Cost Breakdown:</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base model cost:</span>
                  <span>{costBreakdown.baseCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform fee:</span>
                  <span>{costBreakdown.platformFee.toLocaleString()}</span>
                </div>
                {costBreakdown.creatorFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Creator fee:</span>
                    <span>{costBreakdown.creatorFee.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {credits < totalCost && (
            <div className="text-red-500 text-sm flex items-center p-2 bg-red-50 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <div>Not enough credits! You need {totalCost.toLocaleString()} credits but have {credits.toLocaleString()} credits.</div>
                <div className="text-xs mt-1">New users receive 1,000,000 credits upon signup.</div>
              </div>
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
            onClick={handleConfirm}
            disabled={credits < totalCost || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <LoadingIndicator size="sm" className="mr-2" />
                Processing...
              </span>
            ) : (
              'Continue'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreditConfirmationDialog;