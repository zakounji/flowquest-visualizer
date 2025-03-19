
import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
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
  const relationship = data?.relationship;
  
  const frequency = relationship?.metrics?.frequency || 0;
  
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerEnd={markerEnd}
        className={`${isHighlighted ? 'edge-highlight' : ''}`}
      />
      
      {frequency > 0 && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: isHighlighted ? '#8B5CF6' : '#94a3b8',
              padding: '4px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
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
