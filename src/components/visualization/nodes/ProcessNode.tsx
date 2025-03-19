
import { memo, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import * as d3 from 'd3';
import { Entity, EntityType } from '@/types/processTypes';

interface ProcessNodeProps {
  data: {
    entity: Entity;
    color: string;
    isHighlighted: boolean;
    showLabel: boolean;
    onClick: () => void;
    animationStep: number;
    isAnimating: boolean;
  };
}

const ProcessNode = memo(({ data }: ProcessNodeProps) => {
  const { entity, color, isHighlighted, showLabel, onClick, animationStep, isAnimating } = data;
  const nodeSize = 60;
  const svgRef = useRef<SVGSVGElement>(null);

  // Use D3 to render the node shape based on entity type
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content
    
    // Create the base group for the node
    const nodeGroup = svg.append("g");
    
    // Draw different shapes based on entity type
    switch (entity.type) {
      case EntityType.ACTOR:
        // Human figure
        const actorGroup = nodeGroup.append("g")
          .attr("transform", `translate(${nodeSize/2}, ${nodeSize/2})`);
          
        // Head
        actorGroup.append("circle")
          .attr("cx", 0)
          .attr("cy", -15)
          .attr("r", 10)
          .attr("fill", "white")
          .attr("stroke", color)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        // Body
        actorGroup.append("line")
          .attr("x1", 0)
          .attr("y1", -5)
          .attr("x2", 0)
          .attr("y2", 15)
          .attr("stroke", color)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        // Arms
        actorGroup.append("line")
          .attr("x1", -12)
          .attr("y1", 0)
          .attr("x2", 12)
          .attr("y2", 0)
          .attr("stroke", color)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        // Legs
        actorGroup.append("line")
          .attr("x1", 0)
          .attr("y1", 15)
          .attr("x2", -10)
          .attr("y2", 25)
          .attr("stroke", color)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        actorGroup.append("line")
          .attr("x1", 0)
          .attr("y1", 15)
          .attr("x2", 10)
          .attr("y2", 25)
          .attr("stroke", color)
          .attr("stroke-width", isHighlighted ? 2 : 1);
        break;
        
      case EntityType.SYSTEM:
        // Server/computer symbol
        nodeGroup.append("rect")
          .attr("x", 10)
          .attr("y", 10)
          .attr("width", nodeSize - 20)
          .attr("height", nodeSize - 20)
          .attr("rx", 3)
          .attr("ry", 3)
          .attr("fill", "white")
          .attr("stroke", color)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        // Server lines
        for (let i = 1; i < 4; i++) {
          nodeGroup.append("line")
            .attr("x1", 15)
            .attr("y1", 10 + i * 10)
            .attr("x2", nodeSize - 15)
            .attr("y2", 10 + i * 10)
            .attr("stroke", color)
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", 1);
        }
        
        // Server lights
        nodeGroup.append("circle")
          .attr("cx", nodeSize - 17)
          .attr("cy", 17)
          .attr("r", 3)
          .attr("fill", isAnimating ? "#10b981" : "#d1d5db");
        break;
        
      case EntityType.EVENT:
        // Hexagon shape for event
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          const angleDeg = 60 * i - 30;
          const angleRad = (Math.PI / 180) * angleDeg;
          const x = nodeSize/2 + 22 * Math.cos(angleRad);
          const y = nodeSize/2 + 22 * Math.sin(angleRad);
          hexPoints.push([x, y]);
        }
        
        nodeGroup.append("polygon")
          .attr("points", hexPoints.map(p => p.join(",")).join(" "))
          .attr("fill", "white")
          .attr("stroke", color)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        // Lightning bolt for event
        const boltPoints = [
          [nodeSize/2 - 5, nodeSize/2 - 12],
          [nodeSize/2 + 5, nodeSize/2 - 5],
          [nodeSize/2 - 2, nodeSize/2 - 2],
          [nodeSize/2 + 8, nodeSize/2 + 12],
          [nodeSize/2, nodeSize/2],
          [nodeSize/2 + 3, nodeSize/2 - 3],
          [nodeSize/2 - 8, nodeSize/2 - 10]
        ];
        
        nodeGroup.append("polygon")
          .attr("points", boltPoints.map(p => p.join(",")).join(" "))
          .attr("fill", color)
          .attr("opacity", 0.8);
        break;
        
      case EntityType.RESOURCE:
        // Document/resource icon
        nodeGroup.append("path")
          .attr("d", `
            M15,10
            h30
            a5,5 0 0 1 5,5
            v30
            a5,5 0 0 1 -5,5
            h-30
            a5,5 0 0 1 -5,-5
            v-30
            a5,5 0 0 1 5,-5
            z
          `)
          .attr("fill", "white")
          .attr("stroke", color)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        // Document lines
        for (let i = 1; i < 4; i++) {
          nodeGroup.append("line")
            .attr("x1", 18)
            .attr("y1", 18 + i * 7)
            .attr("x2", nodeSize - 18)
            .attr("y2", 18 + i * 7)
            .attr("stroke", color)
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", 1);
        }
        
        // Corner fold
        nodeGroup.append("path")
          .attr("d", `
            M45,10
            v5
            h5
            z
          `)
          .attr("fill", color)
          .attr("opacity", 0.5);
        break;
        
      default: // TASK is the default
        // Rounded rectangle with gear icon
        nodeGroup.append("rect")
          .attr("x", 10)
          .attr("y", 10)
          .attr("width", nodeSize - 20)
          .attr("height", nodeSize - 20)
          .attr("rx", 5)
          .attr("fill", "white")
          .attr("stroke", color)
          .attr("stroke-width", isHighlighted ? 2 : 1);
        
        // Gear/cog for task
        const gearGroup = nodeGroup.append("g")
          .attr("transform", `translate(${nodeSize/2}, ${nodeSize/2})`);
          
        const gearRadius = 12;
        const toothCount = 8;
        
        // Create gear teeth
        for (let i = 0; i < toothCount; i++) {
          const angle = (Math.PI * 2 * i) / toothCount;
          const x1 = gearRadius * Math.cos(angle);
          const y1 = gearRadius * Math.sin(angle);
          const x2 = (gearRadius + 4) * Math.cos(angle);
          const y2 = (gearRadius + 4) * Math.sin(angle);
          
          gearGroup.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("opacity", 0.8);
        }
        
        // Gear center
        gearGroup.append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 5)
          .attr("fill", color)
          .attr("opacity", 0.8);
    }
    
    // Add frequency indicator if available
    if (entity.metrics && entity.metrics.frequency > 0) {
      nodeGroup.append("circle")
        .attr("cx", nodeSize - 8)
        .attr("cy", 8)
        .attr("r", 8)
        .attr("fill", "rgb(139, 92, 246)")
        .attr("stroke", "white")
        .attr("stroke-width", 1);
        
      nodeGroup.append("text")
        .attr("x", nodeSize - 8)
        .attr("y", 12)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "9px")
        .attr("font-weight", "bold")
        .text(entity.metrics.frequency);
    }
    
    // Add pulse animation for highlighted nodes
    if (isHighlighted) {
      const pulseCircle = nodeGroup.append("circle")
        .attr("cx", nodeSize / 2)
        .attr("cy", nodeSize / 2)
        .attr("r", nodeSize / 2 - 5)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("opacity", 0.5)
        .attr("stroke-dasharray", "5,5");
        
      if (isAnimating) {
        pulseCircle.style("animation", "pulse 1.5s infinite");
        
        // Define the pulse animation if not already defined
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse {
            0% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.2; transform: scale(1.1); }
            100% { opacity: 0.5; transform: scale(1); }
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    // Make node clickable
    svg.on("click", onClick);
    
  }, [entity, color, isHighlighted, animationStep, isAnimating, onClick]);

  return (
    <div 
      className={`relative w-[${nodeSize}px] h-[${nodeSize}px] transition-all duration-200 cursor-pointer ${isHighlighted ? 'shadow-lg' : ''}`}
      style={{ transform: isHighlighted ? 'scale(1.05)' : 'scale(1)' }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      
      <svg 
        ref={svgRef} 
        width={nodeSize} 
        height={nodeSize} 
        viewBox={`0 0 ${nodeSize} ${nodeSize}`}
        className="entity-node"
      />
      
      {showLabel && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium px-1 py-0.5 bg-white/80 rounded shadow-sm">
          {entity.name.length > 15 ? entity.name.substring(0, 12) + '...' : entity.name}
        </div>
      )}
    </div>
  );
});

export default ProcessNode;
