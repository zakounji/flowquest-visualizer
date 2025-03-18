
import { Entity, EntityType } from '@/types/processTypes';
import { getNodeShape, defaultEntityStyles } from '@/utils/visualizationHelpers';

interface EntityNodeProps {
  entity: Entity;
  position: { x: number, y: number };
  nodeSize: number;
  isHighlighted: boolean;
  showLabels: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const EntityNode = ({
  entity,
  position,
  nodeSize,
  isHighlighted,
  showLabels,
  onMouseEnter,
  onMouseLeave
}: EntityNodeProps) => {
  const x = position.x;
  const y = position.y;
  const shape = getNodeShape(entity, nodeSize);
  const entityStyle = defaultEntityStyles[entity.type];

  return (
    <g 
      transform={`translate(${x - nodeSize/2}, ${y - nodeSize/2})`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
};

export default EntityNode;
