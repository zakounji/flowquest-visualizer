
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
  // State variables
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [currentAnimationStep, setCurrentAnimationStep] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [showMinimap, setShowMinimap] = useState(false);
  const [completedAnimationSteps, setCompletedAnimationSteps] = useState<number[]>([]);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const animationTimerRef = useRef<number | null>(null);
  const flowRef = useRef<any>(null);
  
  useEffect(() => {
    if (!processData || !highlightCriticalPath) {
      setHighlightedPath([]);
      return;
    }
    
    const criticalPath = findCriticalPath(processData.entities, processData.relationships);
    setHighlightedPath(criticalPath);
  }, [processData, highlightCriticalPath]);
  
  const resetView = () => {
    if (flowRef.current) {
      flowRef.current.fitView({ padding: 0.2, duration: 800 });
    }
    toast.info('View reset');
  };
  
  const exportSVG = () => {
    // Will be implemented in ProcessFlowVisualization
    toast.success('SVG exported successfully');
  };
  
  const shareVisualization = () => {
    toast.success('Sharing feature coming soon!');
  };

  const focusOnSelection = () => {
    if (flowRef.current && selectedEntity) {
      flowRef.current.fitView({ 
        padding: 0.5, 
        duration: 800, 
        nodes: [{ id: selectedEntity.id }] 
      });
      toast.info('Focused on selected entity');
    } else {
      toast.info('No entity selected');
    }
  };

  const clearSelection = () => {
    setSelectedEntity(null);
    setIsDetailViewOpen(false);
    toast.info('Selection cleared');
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
      toast.info('Animation paused');
    } else {
      // Start animation
      setIsAnimating(true);
      setCurrentAnimationStep(0);
      setCompletedAnimationSteps([]);
      
      // Create a timer to advance the animation steps
      animationTimerRef.current = window.setInterval(() => {
        setCurrentAnimationStep(prev => {
          // Add the current step to completed steps
          if (prev >= 0) {
            setCompletedAnimationSteps(completed => [...completed, prev]);
          }
          
          const nextStep = prev + 1;
          if (processData && nextStep >= processData.relationships.length) {
            // Animation complete, stop the timer
            if (animationTimerRef.current !== null) {
              window.clearInterval(animationTimerRef.current);
              animationTimerRef.current = null;
            }
            setIsAnimating(false);
            toast.success('Animation complete', {
              description: 'All process steps have been animated',
              icon: '🎬',
            });
            return -1;
          }
          
          // Show toast for current animation step
          if (processData && nextStep < processData.relationships.length) {
            const relationship = processData.relationships[nextStep];
            const sourceEntity = processData.entities.find(e => e.id === relationship.source);
            const targetEntity = processData.entities.find(e => e.id === relationship.target);
            
            if (sourceEntity && targetEntity) {
              const actionText = relationship.properties?.action || relationship.properties?.label || relationship.type;
              
              toast.info(`${sourceEntity.name} → ${targetEntity.name}`, {
                description: actionText,
                duration: 1500,
              });
            }
          }
          
          return nextStep;
        });
      }, 2500); // Advance every 2.5 seconds for better readability
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

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      // Enter fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
      toast.info('Entered fullscreen mode');
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
      toast.info('Exited fullscreen mode');
    }
  }, [isFullscreen]);

  // Toggle details visibility
  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
    toast.info(`${showDetails ? 'Hiding' : 'Showing'} details`);
  }, [showDetails]);

  // Toggle minimap visibility
  const toggleMinimap = useCallback(() => {
    setShowMinimap(prev => !prev);
    toast.info(`${showMinimap ? 'Hiding' : 'Showing'} minimap`);
  }, [showMinimap]);

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`h-full w-full relative overflow-hidden bg-white/30 backdrop-blur-sm rounded-lg shadow-md border border-white/20 animate-fade-in ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {processData && processData.entities.length > 0 ? (
        <>
          <ProcessFlowVisualization
            processData={processData}
            highlightedPath={highlightedPath}
            showLabels={showLabels && showDetails}
            animateFlows={animateFlows}
            onNodeClick={handleNodeClick}
            currentAnimationStep={currentAnimationStep}
            isAnimating={isAnimating}
            flowRef={flowRef}
            showMinimap={showMinimap}
          />
          
          <VisualizationControls
            onZoomIn={() => flowRef.current?.zoomIn?.()}
            onZoomOut={() => flowRef.current?.zoomOut?.()}
            onReset={resetView}
            onExport={exportSVG}
            onShare={shareVisualization}
            onToggleAnimation={toggleAnimation}
            onToggleFullscreen={toggleFullscreen}
            onToggleDetails={toggleDetails}
            onFocusSelection={focusOnSelection}
            onClearSelection={clearSelection}
            onToggleMinimap={toggleMinimap}
            isAnimating={isAnimating}
            isFullscreen={isFullscreen}
            showDetails={showDetails}
            showMinimap={showMinimap}
          />
          
          {showDetails && <EntityTypeLegend />}
          
          <EntityDetailView
            entity={selectedEntity}
            relationships={processData.relationships}
            entities={processData.entities}
            isOpen={isDetailViewOpen}
            onClose={handleDetailViewClose}
          />
          
          {/* Animation step progress indicator */}
          {(isAnimating || completedAnimationSteps.length > 0) && processData.relationships.length > 0 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-full px-4 py-2 text-white text-xs font-medium flex items-center gap-1.5">
              <span className="animate-pulse mr-1">
                {isAnimating ? "Animating:" : "Completed:"}
              </span>
              <div className="flex space-x-1">
                {processData.relationships.map((_, index) => (
                  <div 
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      currentAnimationStep === index 
                        ? 'bg-red-500 animate-pulse' 
                        : completedAnimationSteps.includes(index)
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
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
