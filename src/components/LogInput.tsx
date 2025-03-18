
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
    const sampleLogText = `15 Jan: S28 moved to orbital launch mount at Pad A for integration testing (NSF)
18 Jan: B9 booster undergoes cryo testing at suborbital pad (RGV photos)
20 Jan: S28 and B9 fully stacked! at launch complex A preparing for flight (Sentinel)
22 Jan: Raptor engines installed on S28 at Highbay for the first time
25 Jan: Heat shield tiles replaced on S28 at refurbishment area after damage assessment (NSF)
27 Jan: B9 moved back to orbital launch mount at Pad A for final preparations
30 Jan: S28 and B9 conduct static fire test at launch complex A with all engines (SG photos)
02 Feb: S28 and B9 destacked at launch complex A for additional work
05 Feb: S28 transported to Highbay from Pad A for repairs
07 Feb: S28 heat shield undergoes inspection at maintenance bay showing progress (LP Sentinel)
10 Feb: Additional Raptor engines delivered to Highbay for S28 integration
12 Feb: B9 grid fins tested at Pad B for mechanical functionality
15 Feb: S28 moved back to orbital launch mount at Pad A after repairs completed
18 Feb: S28 and B9 fully stacked again! at launch complex A ready for launch attempt
20 Feb: Propellant loading test conducted at launch complex A with both vehicles (NSF)
23 Feb: Launch attempt scrubbed at T-40s at launch complex A due to valve issue
25 Feb: S28 and B9 successfully launch! from Pad A reaching orbital velocity (multiple sources)`;
    
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
            placeholder="Paste your event log here in the format: [DD MMM: entity action at location (source)]"
            className="font-mono text-sm min-h-[200px] resize-y"
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            disabled={disabled}
          />
          <div className="text-xs text-muted-foreground">
            Format: DD MMM: entity action at location (optional source)
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
