
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Share2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ControlPanelProps {
  onSettingsChange: (settings: {
    showLabels: boolean;
    animateFlows: boolean;
    highlightCriticalPath: boolean;
  }) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  loading?: boolean;
  error?: string | null;
}

const ControlPanel = ({ 
  onSettingsChange, 
  onRefresh, 
  onExport, 
  onShare,
  loading = false,
  error = null
}: ControlPanelProps) => {
  const [showLabels, setShowLabels] = useState(true);
  const [animateFlows, setAnimateFlows] = useState(true);
  const [highlightCriticalPath, setHighlightCriticalPath] = useState(true);
  
  const handleSettingChange = (key: string, value: boolean) => {
    let newSettings;
    
    switch (key) {
      case 'showLabels':
        setShowLabels(value);
        newSettings = { showLabels: value, animateFlows, highlightCriticalPath };
        break;
      case 'animateFlows':
        setAnimateFlows(value);
        newSettings = { showLabels, animateFlows: value, highlightCriticalPath };
        break;
      case 'highlightCriticalPath':
        setHighlightCriticalPath(value);
        newSettings = { showLabels, animateFlows, highlightCriticalPath: value };
        break;
      default:
        return;
    }
    
    onSettingsChange(newSettings);
    toast.info(`${key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())} ${value ? 'enabled' : 'disabled'}`);
  };
  
  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    toast.info('Refreshing visualization');
  };
  
  const handleExport = () => {
    if (onExport) onExport();
    else toast.info('Export feature coming soon');
  };
  
  const handleShare = () => {
    if (onShare) onShare();
    else toast.info('Share feature coming soon');
  };

  return (
    <Card className="backdrop-blur-sm bg-white/80 shadow-md border border-slate-200 animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Visualization Controls</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-2 bg-destructive/10 text-destructive rounded-md flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch 
                id="show-labels" 
                checked={showLabels}
                onCheckedChange={(checked) => handleSettingChange('showLabels', checked)}
                disabled={loading}
              />
              <Label htmlFor="show-labels">Show Labels</Label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch 
                id="animate-flows" 
                checked={animateFlows}
                onCheckedChange={(checked) => handleSettingChange('animateFlows', checked)}
                disabled={loading}
              />
              <Label htmlFor="animate-flows">Animate Flows</Label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch 
                id="highlight-path" 
                checked={highlightCriticalPath}
                onCheckedChange={(checked) => handleSettingChange('highlightCriticalPath', checked)}
                disabled={loading}
              />
              <Label htmlFor="highlight-path">Highlight Critical Path</Label>
            </div>
          </div>
          
          <div className="h-px bg-border my-4" />
          
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={14} className="mr-2" />
              Refresh Layout
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start" 
              onClick={handleExport}
              disabled={loading}
            >
              <Download size={14} className="mr-2" />
              Export Visualization
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start" 
              onClick={handleShare}
              disabled={loading}
            >
              <Share2 size={14} className="mr-2" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
