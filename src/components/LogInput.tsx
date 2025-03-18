
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { getSampleProcessData } from '@/utils/visualizationHelpers';

interface LogInputProps {
  onSubmit: (logText: string) => void;
  disabled?: boolean;
}

const LogInput = ({ onSubmit, disabled }: LogInputProps) => {
  const [logText, setLogText] = useState('');

  const handleSubmit = () => {
    if (!logText.trim()) {
      toast.error('Please enter a log to analyze');
      return;
    }
    
    onSubmit(logText);
    toast.success('Processing log data');
  };

  const loadSampleData = () => {
    const sampleLogText = `2023-01-01T10:15:00 USER_001 SUBMIT_FORM {"formId": "F123", "fields": 5}
2023-01-01T10:15:05 FORM_SYSTEM VALIDATE_FORM {"formId": "F123", "valid": true}
2023-01-01T10:15:10 FORM_SYSTEM CREATE_TASK {"taskId": "T456", "formId": "F123"}
2023-01-01T10:15:15 APPROVAL_TASK ASSIGN {"taskId": "T456", "assignee": "ADMIN_USER"}
2023-01-01T10:20:00 NOTIFICATION_SERVICE SEND_NOTIFICATION {"recipient": "ADMIN_USER", "taskId": "T456"}
2023-01-01T10:30:00 ADMIN_USER REVIEW_TASK {"taskId": "T456", "decision": "approved"}
2023-01-01T10:30:10 NOTIFICATION_SERVICE SEND_CONFIRMATION {"recipient": "USER_001", "taskId": "T456"}
2023-01-01T10:35:00 USER_001 VIEW_RESULT {"taskId": "T456"}`;
    
    setLogText(sampleLogText);
    toast.info('Sample data loaded');
  };

  const clearText = () => {
    setLogText('');
    toast.info('Input cleared');
  };

  return (
    <Card className="w-full backdrop-blur-sm bg-white/80 shadow-md border border-slate-200 animate-fade-in">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Event Log Input</h3>
            <div className="flex gap-2">
              <Button 
                onClick={loadSampleData} 
                variant="outline" 
                size="sm" 
                className="text-xs h-7" 
                disabled={disabled}
              >
                Load Sample
              </Button>
              <Button 
                onClick={clearText} 
                variant="outline" 
                size="sm" 
                className="text-xs h-7" 
                disabled={disabled || !logText}
              >
                Clear
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="Paste your event log here in the format: [timestamp] [component] [action] [details]"
            className="font-mono text-sm min-h-[200px] resize-y"
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            disabled={disabled}
          />
          <div className="text-xs text-muted-foreground">
            Format: timestamp component action [JSON details]
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 flex justify-end gap-2 pt-3 pb-3">
        <Button
          onClick={handleSubmit}
          disabled={disabled || !logText.trim()}
          className="transition-all duration-300 ease-in-out"
        >
          Process Log
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LogInput;
