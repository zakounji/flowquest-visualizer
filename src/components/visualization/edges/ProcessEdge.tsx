
import { memo, useRef, useEffect } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import * as d3 from 'd3';
import { Relationship } from '@/types/processTypes';

interface ProcessEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
  data?: {
    relationship: Relationship;
    isHighlighted: boolean;
    isAnimationStep: boolean;
  };
  style?: React.CSSProperties;
  markerEnd?: string;
}

const ProcessEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: ProcessEdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isHighlighted = data?.isHighlighted || false;
  const isAnimationStep = data?.isAnimationStep || false;
  const relationship = data?.relationship;
  const svgRef = useRef<SVGGElement>(null);
  
  const frequency = relationship?.metrics?.frequency || 0;
  
  // Use D3 to add particles for animated paths
  useEffect(() => {
    if (!svgRef.current || !isAnimationStep) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll(".flow-particle").remove();
    
    // Create gradient for flow particles
    const flowGradient = svg.append("linearGradient")
      .attr("id", `flow-gradient-${id}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", sourceX)
      .attr("y1", sourceY)
      .attr("x2", targetX)
      .attr("y2", targetY);
      
    flowGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ff6b6b")
      .attr("stop-opacity", 0.3);
      
    flowGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ff6b6b")
      .attr("stop-opacity", 1);
    
    // Add 3-5 particles based on frequency
    const particleCount = Math.min(Math.max(frequency, 1), 5);
    
    for (let i = 0; i < particleCount; i++) {
      const offset = i * (1 / particleCount);
      
      svg.append("circle")
        .attr("class", "flow-particle")
        .attr("r", 4)
        .attr("fill", "#ff6b6b")
        .style("filter", "drop-shadow(0 0 2px rgba(255, 107, 107, 0.5))")
        .append("animateMotion")
        .attr("dur", "1.5s")
        .attr("repeatCount", "indefinite")
        .attr("path", edgePath)
        .attr("begin", `${offset}s`);
    }
  }, [id, sourceX, sourceY, targetX, targetY, edgePath, isAnimationStep, frequency]);
  
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerEnd={markerEnd}
        className={`${isHighlighted ? 'edge-highlight' : ''} ${isAnimationStep ? 'edge-animating' : ''}`}
      />
      
      <g ref={svgRef}></g>
      
      {frequency > 0 && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: isAnimationStep ? '#ff6b6b' : isHighlighted ? '#8B5CF6' : '#94a3b8',
              padding: '4px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              border: '1px solid white',
            }}
            className="nodrag nopan"
          >
            {frequency}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

export default ProcessEdge;
