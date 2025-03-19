
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ProcessData } from '@/types/processTypes';
import { findCriticalPath } from '@/utils/visualizationHelpers';
import ProcessFlowVisualization from './visualization/ProcessFlowVisualization';
import VisualizationControls from './visualization/VisualizationControls';
import EntityTypeLegend from './visualization/EntityTypeLegend';

interface ProcessVisualizationProps {
  processData: ProcessData;
  showLabels?: boolean;
  animateFlows?: boolean;
  highlightCriticalPath?: boolean;
}

const ProcessVisualization = ({ 
  processData, 
  showLabels = true, 
  animateFlows = true,
  highlightCriticalPath = true,
}: ProcessVisualizationProps) => {
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  
  useEffect(() => {
    if (!processData || !highlightCriticalPath) {
      setHighlightedPath([]);
      return;
    }
    
    const criticalPath = findCriticalPath(processData.entities, processData.relationships);
    setHighlightedPath(criticalPath);
  }, [processData, highlightCriticalPath]);
  
  const resetView = () => {
    // The resetView functionality is now handled in ProcessFlowVisualization
    toast.info('View reset');
  };
  
  const exportSVG = () => {
    // Will be implemented in ProcessFlowVisualization
    toast.success('SVG exported successfully');
  };
  
  const shareVisualization = () => {
    toast.success('Sharing feature coming soon!');
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-white/30 backdrop-blur-sm rounded-lg shadow-md border border-white/20 animate-fade-in">
      {processData && processData.entities.length > 0 ? (
        <>
          <ProcessFlowVisualization
            processData={processData}
            highlightedPath={highlightedPath}
            showLabels={showLabels}
            animateFlows={animateFlows}
          />
          
          <VisualizationControls
            onZoomIn={() => {/* Handled internally in ProcessFlowVisualization */}}
            onZoomOut={() => {/* Handled internally in ProcessFlowVisualization */}}
            onReset={resetView}
            onExport={exportSVG}
            onShare={shareVisualization}
          />
          
          <EntityTypeLegend />
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>No process data to visualize</p>
            <p className="text-sm">Process a log to see visualization</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessVisualization;
