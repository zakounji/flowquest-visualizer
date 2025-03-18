
import { Relationship } from '@/types/processTypes';

interface RelationshipEdgeProps {
  relationship: Relationship;
  sourcePosition: { x: number, y: number };
  targetPosition: { x: number, y: number };
  isHighlighted: boolean;
}

const RelationshipEdge = ({
  relationship,
  sourcePosition,
  targetPosition,
  isHighlighted
}: RelationshipEdgeProps) => {
  const dx = targetPosition.x - sourcePosition.x;
  const dy = targetPosition.y - sourcePosition.y;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  const arrowSize = 12;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const nodeRadius = 30;
  
  const startRatio = nodeRadius / distance;
  const endRatio = 1 - (nodeRadius / distance);
  
  const startX = sourcePosition.x + dx * startRatio;
  const startY = sourcePosition.y + dy * startRatio;
  const endX = sourcePosition.x + dx * endRatio;
  const endY = sourcePosition.y + dy * endRatio;

  return (
    <g className="transition-opacity duration-300">
      <path
        id={`edge-${relationship.id}`}
        d={`M${startX},${startY} L${endX},${endY}`}
        className={`edge ${isHighlighted ? 'edge-highlight' : ''}`}
        style={isHighlighted ? { strokeDasharray: '5,5' } : undefined}
        markerEnd={`url(#arrow-${relationship.id})`}
      />
      <defs>
        <marker
          id={`arrow-${relationship.id}`}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth={arrowSize}
          markerHeight={arrowSize}
          orient="auto-start-reverse"
        >
          <path
            d="M 0 0 L 10 5 L 0 10 z"
            className={`edge-arrow ${isHighlighted ? 'edge-arrow-highlight' : ''}`}
          />
        </marker>
      </defs>
    </g>
  );
};

export default RelationshipEdge;
