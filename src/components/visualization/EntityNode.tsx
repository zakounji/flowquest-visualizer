
import { Entity, EntityType } from '@/types/processTypes';
import { getNodeShape, defaultEntityStyles } from '@/utils/visualizationHelpers';
import { 
  Rocket, 
  Building2, 
  Cog, 
  FlaskConical, 
  Flag, 
  Users, 
  Zap, 
  Package,
  CircleCheck,
  Wrench,
  Shield,
  Cpu,
  Gauge,
  LifeBuoy,
  Orbit
} from 'lucide-react';

interface EntityNodeProps {
  entity: Entity;
  position: { x: number, y: number };
  nodeSize: number;
  isHighlighted: boolean;
  showLabels: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

// Get appropriate icon for entity type and category
const getEntityIcon = (entity: Entity) => {
  // First check for specific named entities or special categories
  const name = entity.name.toLowerCase();
  const role = entity.properties?.role;
  
  // Special handling for vehicles
  if (entity.type === EntityType.VEHICLE) {
    if (role === 'ship' || name.includes('s') && !name.includes('booster')) {
      return Rocket;
    } else if (role === 'booster' || name.includes('b') || name.includes('booster')) {
      return Orbit;
    }
  }
  
  // Check for component subtypes
  if (entity.type === EntityType.COMPONENT) {
    if (name.includes('engine') || name.includes('raptor')) {
      return Gauge;
    } else if (name.includes('shield') || name.includes('tile')) {
      return Shield;
    } else if (name.includes('grid') || name.includes('fin')) {
      return LifeBuoy;
    }
    return Cog;
  }
  
  // Default icons based on entity type
  switch (entity.type) {
    case EntityType.VEHICLE: 
      return Rocket;
    case EntityType.FACILITY: 
      return Building2;
    case EntityType.COMPONENT: 
      return Wrench;
    case EntityType.TEST: 
      return FlaskConical;
    case EntityType.MILESTONE: 
      return Flag;
    case EntityType.ACTOR: 
      return Users;
    case EntityType.EVENT: 
      return Zap;
    case EntityType.RESOURCE: 
      return Package;
    case EntityType.TASK:
      return CircleCheck;
    case EntityType.SYSTEM:
      return Cpu;
    default:
      return Package;
  }
};

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
  
  // Get the appropriate icon component
  const IconComponent = getEntityIcon(entity);
  
  // Determine if entity is a ship or booster for special styling
  const isShip = entity.properties?.role === 'ship' || 
                 (entity.type === EntityType.VEHICLE && 
                  entity.name.toLowerCase().includes('s') && 
                  !entity.name.toLowerCase().includes('booster'));
                  
  const isBooster = entity.properties?.role === 'booster' || 
                   (entity.type === EntityType.VEHICLE && 
                    (entity.name.toLowerCase().includes('b') || 
                     entity.name.toLowerCase().includes('booster')));
  
  // Custom colors for ships and boosters
  const fillColor = isShip ? '#9b87f5' : isBooster ? '#F97316' : 'white';
  const strokeColor = isShip ? '#7c5bf2' : isBooster ? '#ea580c' : entityStyle.color;

  return (
    <g 
      transform={`translate(${x - nodeSize/2}, ${y - nodeSize/2})`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="cursor-pointer transition-transform duration-300 ease-in-out"
      style={{ transform: `scale(${isHighlighted ? 1.05 : 1})` }}
    >
      {/* Node background shape */}
      <path
        id={`node-${entity.id}`}
        d={shape}
        className={`node ${isHighlighted ? 'node-highlight' : ''}`}
        style={{ 
          stroke: strokeColor,
          fill: fillColor,
          fillOpacity: 0.1,
          strokeWidth: isHighlighted ? 2.5 : 2
        }}
      />
      
      {/* Icon in center */}
      <foreignObject
        x={nodeSize * 0.2}
        y={nodeSize * 0.2}
        width={nodeSize * 0.6}
        height={nodeSize * 0.6}
        className="flex items-center justify-center"
      >
        <div className="w-full h-full flex items-center justify-center">
          <IconComponent 
            size={nodeSize * 0.4} 
            color={strokeColor}
            strokeWidth={1.5}
          />
        </div>
      </foreignObject>

      {/* Label text */}
      {showLabels && (
        <text
          x={nodeSize / 2}
          y={nodeSize + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          className="node-text text-xs font-medium"
          style={{ fill: strokeColor }}
        >
          {entity.name.length > 15 
            ? entity.name.substring(0, 12) + '...' 
            : entity.name}
        </text>
      )}
      
      {/* Entity type indicator at top of node */}
      {showLabels && (
        <text
          x={nodeSize / 2}
          y={-6}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[10px] opacity-70"
          style={{ fill: strokeColor }}
        >
          {entity.type}
        </text>
      )}
    </g>
  );
};

export default EntityNode;
