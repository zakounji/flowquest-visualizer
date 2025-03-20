
import React, { useState, useEffect, useRef, memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { EntityType, Entity } from '@/types/processTypes';
import { enhancedEntityStyles, getNodeShape } from '@/utils/visualizationHelpers';

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
  selected: boolean;
}

const ProcessNode = memo(({ data, selected }: ProcessNodeProps) => {
  const { entity, color, isHighlighted, showLabel, onClick, animationStep, isAnimating } = data;
  const entityType = entity.type as string;
  const entityStyle = enhancedEntityStyles[entityType] || enhancedEntityStyles[EntityType.TASK];
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);
  const particleRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const [completionTime, setCompletionTime] = useState<string | null>(null);
  
  const isShip = 
    entityType === EntityType.VEHICLE && (
      entity.properties?.role === 'ship' || 
      entity.name.toLowerCase().includes('s') && 
      !entity.name.toLowerCase().includes('booster')
    );
  
  const isBooster = 
    entityType === EntityType.VEHICLE && (
      entity.properties?.role === 'booster' || 
      entity.name.toLowerCase().includes('b') && 
      !entity.name.toLowerCase().includes('starship')
    );
  
  // Calculate node dimensions based on frequency or importance
  const baseSize = 80;
  const frequency = entity.metrics?.frequency || 1;
  const scaleFactor = Math.min(Math.max(1, Math.log2(frequency + 1) * 0.3 + 1), 1.8);
  const nodeSize = baseSize * scaleFactor;

  // Define special shapes for ships and boosters
  const getVehicleShape = () => {
    if (isShip) {
      return `M${nodeSize/2},0 
              L${nodeSize*0.8},${nodeSize*0.2} 
              L${nodeSize*0.8},${nodeSize*0.8} 
              L${nodeSize/2},${nodeSize} 
              L${nodeSize*0.2},${nodeSize*0.8} 
              L${nodeSize*0.2},${nodeSize*0.2} Z`;
    }
    if (isBooster) {
      return `M${nodeSize/2},0 
              L${nodeSize*0.8},${nodeSize*0.3} 
              L${nodeSize*0.7},${nodeSize*0.9} 
              L${nodeSize*0.3},${nodeSize*0.9} 
              L${nodeSize*0.2},${nodeSize*0.3} Z`;
    }
    
    return getNodeShape(entity, nodeSize);
  };

  // Get shape path and style based on entity type
  const nodePath = entityType === EntityType.VEHICLE && (isShip || isBooster) 
    ? getVehicleShape() 
    : getNodeShape(entity, nodeSize);
  
  // Generate completion time display
  useEffect(() => {
    if (entity.metrics?.duration && entity.metrics?.durationUnit) {
      setCompletionTime(`${entity.metrics.duration} ${entity.metrics.durationUnit}`);
    } else if (entity.properties?.duration) {
      setCompletionTime(entity.properties.duration as string);
    } else {
      setCompletionTime(null);
    }
  }, [entity]);

  // Particle animation effect for highlighted nodes
  useEffect(() => {
    if (isHighlighted && particleRef.current) {
      // Generate particles
      const generateParticles = () => {
        const newParticles = [];
        const count = isAnimating ? 15 : 5;
        
        for (let i = 0; i < count; i++) {
          newParticles.push({
            id: Math.random(),
            x: Math.random() * nodeSize,
            y: Math.random() * nodeSize,
            size: Math.random() * 4 + 2,
            speed: Math.random() * 1 + 0.5,
            opacity: Math.random() * 0.7 + 0.3
          });
        }
        
        setParticles(newParticles);
      };
      
      // Animation frames
      const animate = () => {
        setParticles(prev => 
          prev.map(p => ({
            ...p,
            y: p.y - p.speed,
            opacity: p.y < nodeSize * 0.2 ? p.opacity * 0.95 : p.opacity
          })).filter(p => p.opacity > 0.05)
        );
        
        frameRef.current = requestAnimationFrame(animate);
      };
      
      // Initialize particles
      generateParticles();
      frameRef.current = requestAnimationFrame(animate);
      
      // Regenerate particles periodically
      const interval = setInterval(generateParticles, 1000);
      
      return () => {
        cancelAnimationFrame(frameRef.current);
        clearInterval(interval);
      };
    }
  }, [isHighlighted, isAnimating, nodeSize]);

  // Set node colors and styles
  let nodeColor = color;
  let strokeColor = entityStyle.shadowColor || '#344054';
  
  // Special colors for ships and boosters
  if (isShip) {
    nodeColor = '#9b87f5'; // Purple for ships
    strokeColor = '#6b46c1';
  } else if (isBooster) {
    nodeColor = '#F97316'; // Orange for boosters
    strokeColor = '#c2410c';
  }
  
  // Apply highlighting
  if (isHighlighted) {
    nodeColor = isShip ? '#8b5cf6' : isBooster ? '#fb923c' : '#818cf8';
    strokeColor = isShip ? '#6d28d9' : isBooster ? '#ea580c' : '#4f46e5';
  }
  
  return (
    <div className="process-node-wrapper flex justify-center items-center"
         style={{ width: nodeSize, height: nodeSize }}>
      {/* Handles for connecting to other nodes */}
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-1.5 bg-gray-400 border-0 rounded-sm ${isHighlighted ? 'bg-indigo-400' : ''}`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={`w-3 h-1.5 bg-gray-400 border-0 rounded-sm ${isHighlighted ? 'bg-indigo-400' : ''}`}
      />
      
      {/* Node container with SVG shape */}
      <div 
        ref={particleRef}
        className={`relative flex items-center justify-center transition-all ${selected ? 'ring-2 ring-offset-2 ring-indigo-600' : ''}`}
        style={{ width: nodeSize, height: nodeSize }}
        onClick={onClick}
      >
        {/* SVG shape for the node */}
        <svg width={nodeSize} height={nodeSize} className="absolute top-0 left-0">
          <path
            d={nodePath}
            fill={nodeColor}
            stroke={strokeColor}
            strokeWidth={selected || isHighlighted ? 3 : 2}
            filter={`drop-shadow(0px 4px 6px rgba(0,0,0,0.2))`}
          />
        </svg>
        
        {/* Entity name label */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-1 ${isShip || isBooster ? 'text-white' : 'text-gray-800'}`}>
          <div className="text-xs font-semibold leading-tight text-center" style={{ fontSize: Math.max(8, Math.min(12, 10 * scaleFactor)) }}>
            {entity.name}
          </div>
          
          {/* Entity type tag */}
          {showLabel && (
            <div className="text-[8px] opacity-80 mt-1 px-1 rounded bg-black/20">
              {entityType}
            </div>
          )}
        </div>
        
        {/* Particle effects for highlighted nodes */}
        {isHighlighted && particles.length > 0 && (
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '50%' }}>
            {particles.map(particle => (
              <div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  left: particle.x,
                  top: particle.y,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: isShip ? '#c4b5fd' : isBooster ? '#fed7aa' : '#bfdbfe',
                  opacity: particle.opacity,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Completion time indicator */}
        {completionTime && (
          <div 
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ fontSize: '0.65rem' }}
          >
            {completionTime}
          </div>
        )}
        
        {/* Frequency indicator */}
        {entity.metrics?.frequency && entity.metrics.frequency > 1 && (
          <div 
            className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center"
          >
            {entity.metrics.frequency}
          </div>
        )}
      </div>
    </div>
  );
});

export default ProcessNode;
