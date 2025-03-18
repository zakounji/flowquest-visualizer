import { useRef, useEffect, useState } from 'react';
import { Entity, Relationship, ProcessData, EntityType } from '@/types/processTypes';
import { 
  getNodeShape, 
  findCriticalPath, 
  calculateEntityPositions, 
  defaultEntityStyles 
} from '@/utils/visualizationHelpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Download, ZoomIn, ZoomOut, RotateCcw, Share2 } from 'lucide-react';

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
  const svgRef = useRef<SVGSVGElement>(null);
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
    const svgElement = svgRef.current;
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
    if (!svgRef.current) return;
    
    const svgElement = svgRef.current;
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
  
  const renderEntities = () => {
    if (!processData?.entities || !positions || positions.size === 0) return null;
    
    return processData.entities.map(entity => {
      const pos = positions.get(entity.id);
      if (!pos) return null;
      
      const nodeSize = 60;
      const x = pos.x;
      const y = pos.y;
      const shape = getNodeShape(entity, nodeSize);
      const isHighlighted = highlightedPath.includes(entity.id);
      const entityStyle = defaultEntityStyles[entity.type];
      
      return (
        <g 
          key={`entity-${entity.id}`}
          transform={`translate(${x - nodeSize/2}, ${y - nodeSize/2})`}
          onMouseEnter={() => handleNodeHover(entity.id, true)}
          onMouseLeave={() => handleNodeHover(entity.id, false)}
          className="cursor-pointer transition-transform duration-300 ease-in-out"
          style={{ transform: `scale(${isHighlighted ? 1.05 : 1})` }}
        >
          <path
            id={`node-${entity.id}`}
            d={shape}
            className={`node ${isHighlighted ? 'node-highlight' : ''}`}
            style={{ stroke: entityStyle.color }}
          />
          {showLabels && (
            <text
              x={nodeSize / 2}
              y={nodeSize / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="node-text"
            >
              {entity.name.length > 15 
                ? entity.name.substring(0, 12) + '...' 
                : entity.name}
            </text>
          )}
        </g>
      );
    });
  };
  
  const renderRelationships = () => {
    if (!processData?.relationships || !positions || positions.size === 0) return null;
    
    return processData.relationships.map(rel => {
      const source = positions.get(rel.source);
      const target = positions.get(rel.target);
      
      if (!source || !target) return null;
      
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      
      const isHighlighted = 
        highlightedPath.includes(rel.source) && 
        highlightedPath.includes(rel.target) &&
        highlightedPath.indexOf(rel.target) === highlightedPath.indexOf(rel.source) + 1;
      
      const arrowSize = 12;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const nodeRadius = 30;
      
      const startRatio = nodeRadius / distance;
      const endRatio = 1 - (nodeRadius / distance);
      
      const startX = source.x + dx * startRatio;
      const startY = source.y + dy * startRatio;
      const endX = source.x + dx * endRatio;
      const endY = source.y + dy * endRatio;
      
      return (
        <g key={`relationship-${rel.id}`} className="transition-opacity duration-300">
          <path
            id={`edge-${rel.id}`}
            d={`M${startX},${startY} L${endX},${endY}`}
            className={`edge ${isHighlighted ? 'edge-highlight' : ''}`}
            style={isHighlighted ? { strokeDasharray: '5,5' } : undefined}
            markerEnd={`url(#arrow-${rel.id})`}
          />
          <defs>
            <marker
              id={`arrow-${rel.id}`}
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth={arrowSize}
              markerHeight={arrowSize}
              orient={`auto-start-reverse`}
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                className={`edge-arrow ${isHighlighted ? 'edge-arrow-highlight' : ''}`}
              />
            </marker>
          </defs>
        </g>
      );
    });
  };

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full relative overflow-hidden bg-white/30 backdrop-blur-sm rounded-lg shadow-md border border-white/20 animate-fade-in"
    >
      {processData && processData.entities.length > 0 ? (
        <>
          <svg
            ref={svgRef}
            width={size.width}
            height={size.height}
            className="cursor-grab select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
              {renderRelationships()}
              {renderEntities()}
            </g>
          </svg>
          
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Card className="glass-panel p-2 flex flex-col gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleZoom(1.2)} title="Zoom In">
                <ZoomIn size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleZoom(0.8)} title="Zoom Out">
                <ZoomOut size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={resetView} title="Reset View">
                <RotateCcw size={16} />
              </Button>
            </Card>
            
            <Card className="glass-panel p-2 flex flex-col gap-2 mt-2">
              <Button variant="ghost" size="icon" onClick={exportSVG} title="Export SVG">
                <Download size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={shareVisualization} title="Share">
                <Share2 size={16} />
              </Button>
            </Card>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="glass-panel p-2 text-xs">
              <div className="flex flex-wrap gap-3">
                {Object.values(EntityType).map(type => (
                  <div key={type} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: defaultEntityStyles[type].color }}
                    />
                    <span>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
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
