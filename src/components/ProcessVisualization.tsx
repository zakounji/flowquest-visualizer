
import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { ProcessData, Entity } from '@/types/processTypes';
import { findCriticalPath } from '@/utils/visualizationHelpers';
import ProcessFlowVisualization from './visualization/ProcessFlowVisualization';
import VisualizationControls from './visualization/VisualizationControls';
import EntityTypeLegend from './visualization/EntityTypeLegend';
import EntityDetailView from './visualization/EntityDetailView';

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
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [currentAnimationStep, setCurrentAnimationStep] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimerRef = useRef<number | null>(null);
  
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

  const handleNodeClick = useCallback((entity: Entity) => {
    setSelectedEntity(entity);
    setIsDetailViewOpen(true);
  }, []);

  const handleDetailViewClose = useCallback(() => {
    setIsDetailViewOpen(false);
    setSelectedEntity(null);
  }, []);

  const toggleAnimation = useCallback(() => {
    if (isAnimating) {
      // Stop animation
      if (animationTimerRef.current !== null) {
        window.clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
      }
      setIsAnimating(false);
      setCurrentAnimationStep(-1);
    } else {
      // Start animation
      setIsAnimating(true);
      setCurrentAnimationStep(0);
      
      // Create a timer to advance the animation steps
      animationTimerRef.current = window.setInterval(() => {
        setCurrentAnimationStep(prev => {
          const nextStep = prev + 1;
          if (processData && nextStep >= processData.relationships.length) {
            // Animation complete, stop the timer
            if (animationTimerRef.current !== null) {
              window.clearInterval(animationTimerRef.current);
              animationTimerRef.current = null;
            }
            setIsAnimating(false);
            return -1;
          }
          return nextStep;
        });
      }, 1500); // Advance every 1.5 seconds
    }
  }, [isAnimating, processData]);

  // Cleanup animation timer on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current !== null) {
        window.clearInterval(animationTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full w-full relative overflow-hidden bg-white/30 backdrop-blur-sm rounded-lg shadow-md border border-white/20 animate-fade-in">
      {processData && processData.entities.length > 0 ? (
        <>
          <ProcessFlowVisualization
            processData={processData}
            highlightedPath={highlightedPath}
            showLabels={showLabels}
            animateFlows={animateFlows}
            onNodeClick={handleNodeClick}
            currentAnimationStep={currentAnimationStep}
            isAnimating={isAnimating}
          />
          
          <VisualizationControls
            onZoomIn={() => {/* Handled internally in ProcessFlowVisualization */}}
            onZoomOut={() => {/* Handled internally in ProcessFlowVisualization */}}
            onReset={resetView}
            onExport={exportSVG}
            onShare={shareVisualization}
            onToggleAnimation={toggleAnimation}
            isAnimating={isAnimating}
          />
          
          <EntityTypeLegend />
          
          <EntityDetailView
            entity={selectedEntity}
            relationships={processData.relationships}
            entities={processData.entities}
            isOpen={isDetailViewOpen}
            onClose={handleDetailViewClose}
          />
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
