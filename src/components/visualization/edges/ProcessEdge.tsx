
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
  const duration = relationship?.metrics?.duration;
  
  // Use D3 to add particles for animated paths
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Enhanced animation for active edge
    if (isAnimationStep) {
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
      const particleCount = Math.min(Math.max(frequency, 2), 6);
      
      for (let i = 0; i < particleCount; i++) {
        const offset = i * (1 / particleCount);
        const particleSize = 3 + Math.random() * 2;
        
        svg.append("circle")
          .attr("class", "flow-particle")
          .attr("r", particleSize)
          .attr("fill", i % 2 === 0 ? "#ff6b6b" : "#ffc107")
          .style("filter", "drop-shadow(0 0 3px rgba(255, 107, 107, 0.7))")
          .append("animateMotion")
          .attr("dur", "1.2s")
          .attr("repeatCount", "indefinite")
          .attr("path", edgePath)
          .attr("begin", `${offset}s`);
      }
      
      // Add trailing effect for particles
      for (let i = 0; i < 3; i++) {
        const trailOffset = i * 0.15;
        
        svg.append("circle")
          .attr("class", "flow-trail")
          .attr("r", 2 - (i * 0.5))
          .attr("fill", "#ff6b6b")
          .attr("opacity", 0.5 - (i * 0.15))
          .style("filter", "blur(2px)")
          .append("animateMotion")
          .attr("dur", "1.2s")
          .attr("repeatCount", "indefinite")
          .attr("path", edgePath)
          .attr("begin", `${trailOffset}s`);
      }
      
      // Add explanatory text for the current event
      if (relationship) {
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;
        const offset = 20; // Offset from the edge
        
        // Position the text above or below the edge depending on the angle
        const textX = midX + (angle > 0 ? -offset : offset);
        const textY = midY + (Math.abs(angle) < 90 ? -offset : offset);
        
        // Text background for better readability
        const textBg = svg.append("rect")
          .attr("x", textX - 50)
          .attr("y", textY - 15)
          .attr("width", 100)
          .attr("height", 30)
          .attr("rx", 5)
          .attr("ry", 5)
          .attr("fill", "rgba(0, 0, 0, 0.7)")
          .attr("opacity", 0)
          .style("animation", "fadeIn 0.5s forwards");
        
        // Animated explanatory text
        const text = svg.append("text")
          .attr("x", textX)
          .attr("y", textY)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#ffffff")
          .attr("font-size", "10px")
          .attr("opacity", 0)
          .style("animation", "fadeIn 0.5s forwards, slideIn 1s ease-out");
        
        // Get text to display
        const actionText = relationship.properties?.action || 
                          relationship.properties?.label || 
                          relationship.type || 
                          "Process step";
        
        text.text(actionText);
        
        // Define animations for text
        const style = document.createElement('style');
        style.textContent = `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateY(-10px); }
            to { transform: translateY(0); }
          }
          @keyframes pulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    // Add duration indicator for completed steps
    if (duration && !isAnimationStep) {
      const dx = targetX - sourceX;
      const dy = targetY - sourceY;
      const midX = (sourceX + targetX) / 2;
      const midY = (sourceY + targetY) / 2;
      
      // Small clock icon
      const clockGroup = svg.append("g")
        .attr("transform", `translate(${midX}, ${midY})`);
        
      // Clock background
      clockGroup.append("circle")
        .attr("r", 8)
        .attr("fill", "#1E293B")
        .attr("stroke", "white")
        .attr("stroke-width", 1);
        
      // Clock face
      clockGroup.append("circle")
        .attr("r", 6)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);
        
      // Clock hands
      clockGroup.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", -3)
        .attr("stroke", "white")
        .attr("stroke-width", 1);
        
      clockGroup.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 2)
        .attr("y2", 2)
        .attr("stroke", "white")
        .attr("stroke-width", 1);
        
      // Duration text
      clockGroup.append("text")
        .attr("x", 0)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "8px")
        .attr("stroke", "black")
        .attr("stroke-width", 0.3)
        .text(`${duration} ${relationship?.metrics?.durationUnit || 'days'}`);
    }
  }, [id, sourceX, sourceY, targetX, targetY, edgePath, isAnimationStep, frequency, relationship, duration]);
  
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeWidth: isAnimationStep ? (style.strokeWidth as number || 2) * 1.5 : style.strokeWidth,
          filter: isAnimationStep ? 'drop-shadow(0 0 3px rgba(255, 107, 107, 0.5))' : undefined,
        }}
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
              boxShadow: isAnimationStep ? '0 0 8px rgba(255,107,107,0.7)' : '0 1px 2px rgba(0,0,0,0.1)',
              border: '1px solid white',
              animation: isAnimationStep ? 'pulse 1s infinite' : undefined,
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
