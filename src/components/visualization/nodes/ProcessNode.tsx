
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Entity, EntityType } from '@/types/processTypes';
import { getNodeShape } from '@/utils/visualizationHelpers';

interface ProcessNodeProps {
  data: {
    entity: Entity;
    color: string;
    isHighlighted: boolean;
    showLabel: boolean;
  };
}

const ProcessNode = memo(({ data }: ProcessNodeProps) => {
  const { entity, color, isHighlighted, showLabel } = data;
  const nodeSize = 60;

  // Determine shape based on entity type
  const renderNodeShape = () => {
    switch (entity.type) {
      case EntityType.ACTOR:
        return (
          <circle
            cx={nodeSize / 2}
            cy={nodeSize / 2}
            r={nodeSize / 2 - 4}
            className={`fill-white/90 ${isHighlighted ? 'stroke-2' : 'stroke-1'}`}
            stroke={color}
          />
        );
      case EntityType.SYSTEM:
        return (
          <polygon
            points={`${nodeSize/2},4 ${nodeSize-4},${nodeSize/2} ${nodeSize/2},${nodeSize-4} 4,${nodeSize/2}`}
            className={`fill-white/90 ${isHighlighted ? 'stroke-2' : 'stroke-1'}`}
            stroke={color}
          />
        );
      case EntityType.EVENT:
        return (
          <polygon
            points={`${nodeSize/4},4 ${nodeSize*3/4},4 ${nodeSize-4},${nodeSize/2} ${nodeSize*3/4},${nodeSize-4} ${nodeSize/4},${nodeSize-4} 4,${nodeSize/2}`}
            className={`fill-white/90 ${isHighlighted ? 'stroke-2' : 'stroke-1'}`}
            stroke={color}
          />
        );
      case EntityType.RESOURCE:
        return (
          <rect
            x="4"
            y="4"
            width={nodeSize - 8}
            height={nodeSize - 8}
            rx="12"
            className={`fill-white/90 ${isHighlighted ? 'stroke-2' : 'stroke-1'}`}
            stroke={color}
          />
        );
      default: // TASK is the default
        return (
          <rect
            x="4"
            y="4"
            width={nodeSize - 8}
            height={nodeSize - 8}
            rx="4"
            className={`fill-white/90 ${isHighlighted ? 'stroke-2' : 'stroke-1'}`}
            stroke={color}
          />
        );
    }
  };

  return (
    <div className={`relative w-[${nodeSize}px] h-[${nodeSize}px] transition-all duration-200 ${isHighlighted ? 'shadow-lg scale-105' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      
      <svg width={nodeSize} height={nodeSize} viewBox={`0 0 ${nodeSize} ${nodeSize}`}>
        {renderNodeShape()}
        
        {entity.metrics && entity.metrics.frequency > 0 && (
          <circle
            cx={nodeSize - 8}
            cy={8}
            r={8}
            className="fill-primary text-white"
          />
        )}
      </svg>
      
      {entity.metrics && entity.metrics.frequency > 0 && (
        <div className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[9px] text-white font-bold">
          {entity.metrics.frequency}
        </div>
      )}
      
      {showLabel && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium px-1 py-0.5 bg-white/80 rounded shadow-sm">
          {entity.name.length > 15 ? entity.name.substring(0, 12) + '...' : entity.name}
        </div>
      )}
    </div>
  );
});

export default ProcessNode;
