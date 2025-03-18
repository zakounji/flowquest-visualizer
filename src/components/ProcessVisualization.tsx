
import { useRef, useEffect, useState } from 'react';
import { ProcessData } from '@/types/processTypes';
import { 
  findCriticalPath, 
  calculateEntityPositions
} from '@/utils/visualizationHelpers';
import { toast } from 'sonner';
import ProcessGraph from './visualization/ProcessGraph';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [positions, setPositions] = useState(new Map<string, {x: number, y: number}>());

  useEffect(() => {
    if (!processData || !containerRef.current) return;
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    setSize({ width, height });
    
    const calculatedPositions = calculateEntityPositions(
      processData.entities, 
      processData.relationships, 
      width, 
      height
    );
    setPositions(calculatedPositions);
    
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    
    if (highlightCriticalPath) {
      const criticalPath = findCriticalPath(processData.entities, processData.relationships);
      setHighlightedPath(criticalPath);
    } else {
      setHighlightedPath([]);
    }
  }, [processData, highlightCriticalPath]);
  
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      setSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setOffset({
      x: offset.x + dx,
      y: offset.y + dy
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => {
    setDragging(false);
  };
  
  const handleZoom = (factor: number) => {
    setZoom(prevZoom => {
      const newZoom = prevZoom * factor;
      return Math.max(0.1, Math.min(3, newZoom));
    });
  };
  
  const handleNodeHover = (entityId: string, isEntering: boolean) => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) return;
    
    processData.relationships.forEach(rel => {
      if (rel.source === entityId || rel.target === entityId) {
        const edgeElement = svgElement.querySelector(`#edge-${rel.id}`);
        const arrowElement = svgElement.querySelector(`#arrow-${rel.id}`);
        
        if (edgeElement) {
          if (isEntering) {
            edgeElement.classList.add('edge-highlight');
          } else {
            edgeElement.classList.remove('edge-highlight');
          }
        }
        
        if (arrowElement) {
          if (isEntering) {
            arrowElement.classList.add('edge-arrow-highlight');
          } else {
            arrowElement.classList.remove('edge-arrow-highlight');
          }
        }
      }
    });
    
    const nodeElement = svgElement.querySelector(`#node-${entityId}`);
    if (nodeElement) {
      if (isEntering) {
        nodeElement.classList.add('node-highlight');
      } else {
        nodeElement.classList.remove('node-highlight');
      }
    }
  };
  
  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    toast.info('View reset');
  };
  
  const exportSVG = () => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'process_visualization.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    toast.success('SVG exported successfully');
  };
  
  const shareVisualization = () => {
    toast.success('Sharing feature coming soon!');
  };

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full relative overflow-hidden bg-white/30 backdrop-blur-sm rounded-lg shadow-md border border-white/20 animate-fade-in"
    >
      {processData && processData.entities.length > 0 ? (
        <>
          <ProcessGraph
            entities={processData.entities}
            relationships={processData.relationships}
            positions={positions}
            highlightedPath={highlightedPath}
            showLabels={showLabels}
            zoom={zoom}
            offset={offset}
            onDragStart={handleMouseDown}
            onDragMove={handleMouseMove}
            onDragEnd={handleMouseUp}
            onNodeHover={handleNodeHover}
          />
          
          <VisualizationControls
            onZoomIn={() => handleZoom(1.2)}
            onZoomOut={() => handleZoom(0.8)}
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
