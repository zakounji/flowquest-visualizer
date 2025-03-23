
import { useRef } from 'react';
import { Entity, Relationship, EntityType } from '@/types/processTypes';
import EntityNode from './EntityNode';
import RelationshipEdge from './RelationshipEdge';

interface ProcessGraphProps {
  entities: Entity[];
  relationships: Relationship[];
  positions: Map<string, { x: number, y: number }>;
  highlightedPath: string[];
  showLabels: boolean;
  zoom: number;
  offset: { x: number, y: number };
  onDragStart: (e: React.MouseEvent) => void;
  onDragMove: (e: React.MouseEvent) => void;
  onDragEnd: () => void;
  onNodeHover: (entityId: string, isEntering: boolean) => void;
}

const ProcessGraph = ({
  entities,
  relationships,
  positions,
  highlightedPath,
  showLabels,
  zoom,
  offset,
  onDragStart,
  onDragMove,
  onDragEnd,
  onNodeHover
}: ProcessGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeSize = 60;

  const renderEntities = () => {
    if (!entities || !positions || positions.size === 0) return null;
    
    return entities.map(entity => {
      const pos = positions.get(entity.id);
      if (!pos) return null;
      
      const isHighlighted = highlightedPath.includes(entity.id);
      
      return (
        <EntityNode
          key={`entity-${entity.id}`}
          entity={entity}
          position={pos}
          nodeSize={nodeSize}
          isHighlighted={isHighlighted}
          showLabels={showLabels}
          onMouseEnter={() => onNodeHover(entity.id, true)}
          onMouseLeave={() => onNodeHover(entity.id, false)}
        />
      );
    });
  };
  
  const renderRelationships = () => {
    if (!relationships || !positions || positions.size === 0) return null;
    
    return relationships.map(rel => {
      const source = positions.get(rel.source);
      const target = positions.get(rel.target);
      
      if (!source || !target) return null;
      
      const isHighlighted = 
        highlightedPath.includes(rel.source) && 
        highlightedPath.includes(rel.target) &&
        highlightedPath.indexOf(rel.target) === highlightedPath.indexOf(rel.source) + 1;
      
      return (
        <RelationshipEdge 
          key={`relationship-${rel.id}`}
          relationship={rel}
          sourcePosition={source}
          targetPosition={target}
          isHighlighted={isHighlighted}
        />
      );
    });
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      className="cursor-grab select-none"
      onMouseDown={onDragStart}
      onMouseMove={onDragMove}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
    >
      <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
        {renderRelationships()}
        {renderEntities()}
      </g>
    </svg>
  );
};

export default ProcessGraph;
