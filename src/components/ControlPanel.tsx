
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ControlPanelProps {
  onSettingsChange: (settings: {
    showLabels: boolean;
    animateFlows: boolean;
    highlightCriticalPath: boolean;
  }) => void;
  onRefresh: () => void;
  loading: boolean;
  error: string | null;
  useAI?: boolean;
  onToggleAI?: () => boolean;
}

const ControlPanel = ({
  onSettingsChange,
  onRefresh,
  loading,
  error,
  useAI = true,
  onToggleAI
}: ControlPanelProps) => {
  const [showLabels, setShowLabels] = useState(true);
  const [animateFlows, setAnimateFlows] = useState(true);
  const [highlightCriticalPath, setHighlightCriticalPath] = useState(true);

  const handleShowLabelsChange = (checked: boolean) => {
    setShowLabels(checked);
    onSettingsChange({
      showLabels: checked,
      animateFlows,
      highlightCriticalPath
    });
  };

  const handleAnimateFlowsChange = (checked: boolean) => {
    setAnimateFlows(checked);
    onSettingsChange({
      showLabels,
      animateFlows: checked,
      highlightCriticalPath
    });
  };

  const handleHighlightCriticalPathChange = (checked: boolean) => {
    setHighlightCriticalPath(checked);
    onSettingsChange({
      showLabels,
      animateFlows,
      highlightCriticalPath: checked
    });
  };

  const handleToggleAI = () => {
    if (onToggleAI) {
      const newState = onToggleAI();
      return newState;
    }
    return useAI;
  };

  return (
    <Card className="w-full backdrop-blur-sm bg-white/80 shadow-md border border-slate-200 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Visualization Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-labels" className="flex items-center gap-2">
              Show Labels
            </Label>
            <Switch
              id="show-labels"
              checked={showLabels}
              onCheckedChange={handleShowLabelsChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="animate-flows" className="flex items-center gap-2">
              Animate Flows
            </Label>
            <Switch
              id="animate-flows"
              checked={animateFlows}
              onCheckedChange={handleAnimateFlowsChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="highlight-critical-path" className="flex items-center gap-2">
              Highlight Critical Path
            </Label>
            <Switch
              id="highlight-critical-path"
              checked={highlightCriticalPath}
              onCheckedChange={handleHighlightCriticalPathChange}
            />
          </div>

          {onToggleAI && (
            <>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <Label htmlFor="use-ai-parser" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Use Gemini AI Parser
                </Label>
                <Switch
                  id="use-ai-parser"
                  checked={useAI}
                  onCheckedChange={handleToggleAI}
                />
              </div>
            </>
          )}
        </div>
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
            Refresh Visualization
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
