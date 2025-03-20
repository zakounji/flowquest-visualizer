
import { useState } from 'react';
import { useProcessMining } from '@/hooks/useProcessMining';
import LogInput from '@/components/LogInput';
import ProcessVisualization from '@/components/ProcessVisualization';
import MetricsDashboard from '@/components/MetricsDashboard';
import ControlPanel from '@/components/ControlPanel';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { getSampleProcessData } from '@/utils/visualizationHelpers';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const [logText, setLogText] = useState('');
  const { processData, loading, error, clearData, useAI, toggleAIParser } = useProcessMining(logText);
  const [visualizationSettings, setVisualizationSettings] = useState({
    showLabels: true,
    animateFlows: true,
    highlightCriticalPath: true,
  });

  const handleLogSubmit = (text: string) => {
    setLogText(text);
  };

  const handleSettingsChange = (settings: typeof visualizationSettings) => {
    setVisualizationSettings(settings);
  };

  const handleRefresh = () => {
    // Force a refresh by setting the log text to the same value
    setLogText(prev => prev + ' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="p-6 border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium tracking-tight">Process Mining Visualizer</h1>
              <p className="text-muted-foreground text-sm mt-1">Transform event logs into interactive process visualizations</p>
            </div>
            {useAI && (
              <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Gemini AI Powered</span>
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <LogInput 
                onSubmit={handleLogSubmit} 
                disabled={loading} 
              />
              
              <ControlPanel
                onSettingsChange={handleSettingsChange}
                onRefresh={handleRefresh}
                loading={loading}
                error={error}
                useAI={useAI}
                onToggleAI={toggleAIParser}
              />
            </div>
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <Card className="h-[500px] backdrop-blur-sm bg-white/80 shadow-md border border-slate-200">
              <CardContent className="p-0 h-full">
                <ProcessVisualization
                  processData={processData || getSampleProcessData()}
                  showLabels={visualizationSettings.showLabels}
                  animateFlows={visualizationSettings.animateFlows}
                  highlightCriticalPath={visualizationSettings.highlightCriticalPath}
                />
              </CardContent>
            </Card>
            
            <Separator className="my-6" />
            
            <MetricsDashboard processData={processData || getSampleProcessData()} />
          </div>
        </div>
      </main>
      
      <footer className="p-6 border-t mt-12 bg-white/50">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          Process Mining Visualizer &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
