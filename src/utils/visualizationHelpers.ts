
import { Entity, EntityType, Relationship, EntityStyleMapping, RelationshipType } from '../types/processTypes';
import { interpolateRainbow, interpolateSpectral } from 'd3-scale-chromatic';

// Define extended entity style interface to include additional styling properties
interface EnhancedEntityStyle {
  shape: string;
  color: string;
  shadowColor?: string;
  gradient?: string[];
}

// Enhanced color palette with more vibrant, accessible colors
export const enhancedEntityStyles: Record<string, EnhancedEntityStyle> = {
  [EntityType.TASK]: {
    shape: 'rectangle',
    color: '#4299E1', // Brighter blue
    shadowColor: '#2C5282', // Darker blue for shadow
    gradient: ['#63B3ED', '#3182CE'] // Gradient effect
  },
  [EntityType.ACTOR]: {
    shape: 'circle',
    color: '#9F7AEA', // Vibrant purple
    shadowColor: '#553C9A', // Darker purple for shadow
    gradient: ['#B794F4', '#805AD5'] // Gradient effect
  },
  [EntityType.SYSTEM]: {
    shape: 'diamond',
    color: '#48BB78', // Vibrant green
    shadowColor: '#2F855A', // Darker green for shadow
    gradient: ['#68D391', '#38A169'] // Gradient effect
  },
  [EntityType.EVENT]: {
    shape: 'hexagon',
    color: '#F6AD55', // Vibrant orange
    shadowColor: '#C05621', // Darker orange for shadow
    gradient: ['#FBD38D', '#DD6B20'] // Gradient effect
  },
  [EntityType.RESOURCE]: {
    shape: 'rounded-rectangle',
    color: '#ED64A6', // Vibrant pink
    shadowColor: '#B83280', // Darker pink for shadow
    gradient: ['#F687B3', '#D53F8C'] // Gradient effect
  },
  // Add support for SpaceX specific entity types
  [EntityType.VEHICLE]: {
    shape: 'rectangle',
    color: '#2B6CB0', // Deep blue
    shadowColor: '#1A365D', 
    gradient: ['#4299E1', '#2C5282']
  },
  [EntityType.FACILITY]: {
    shape: 'rectangle',
    color: '#48BB78', // Green
    shadowColor: '#276749',
    gradient: ['#68D391', '#2F855A']
  },
  [EntityType.COMPONENT]: {
    shape: 'circle',
    color: '#ED8936', // Orange
    shadowColor: '#9C4221',
    gradient: ['#F6AD55', '#C05621']
  },
  [EntityType.TEST]: {
    shape: 'diamond',
    color: '#9F7AEA', // Purple
    shadowColor: '#553C9A',
    gradient: ['#B794F4', '#6B46C1']
  },
  [EntityType.MILESTONE]: {
    shape: 'hexagon',
    color: '#ED64A6', // Pink
    shadowColor: '#97266D',
    gradient: ['#F687B3', '#B83280']
  },
};

// For backward compatibility, provide export of defaultEntityStyles with basic properties
export const defaultEntityStyles: EntityStyleMapping = Object.entries(enhancedEntityStyles).reduce(
  (acc, [key, value]) => {
    acc[key as keyof EntityStyleMapping] = { shape: value.shape, color: value.color };
    return acc;
  }, 
  {} as EntityStyleMapping
);

// Function to render node with enhanced visual effects
export function getEnhancedNodeShape(entity: Entity, size: number = 80) {
  const type = entity.type as string;
  const style = enhancedEntityStyles[type] || enhancedEntityStyles[EntityType.RESOURCE];
  const shape = getNodeShape(entity, size);
  
  return {
    path: shape,
    style: {
      fill: style.color,
      filter: 'drop-shadow(3px 3px 5px rgba(0,0,0,0.3))',
      strokeWidth: 2,
      stroke: style.shadowColor || '#000000'
    }
  };
}

// The original shape function
export function getNodeShape(entity: Entity, size: number = 80) {
  const type = entity.type as string;
  
  switch (type) {
    case EntityType.TASK:
    case EntityType.VEHICLE:
    case EntityType.FACILITY:
      return `M0,${size/6} 
              Q0,0 ${size/6},0 
              L${size - size/6},0 
              Q${size},0 ${size},${size/6} 
              L${size},${size - size/6} 
              Q${size},${size} ${size - size/6},${size} 
              L${size/6},${size} 
              Q0,${size} 0,${size - size/6} Z`;
    
    case EntityType.ACTOR:
    case EntityType.COMPONENT:
      const radius = size / 2;
      return `M${size/2},0 
              A${radius},${radius} 0 1,1 ${size/2},${size} 
              A${radius},${radius} 0 1,1 ${size/2},0 Z`;
    
    case EntityType.SYSTEM:
    case EntityType.TEST:
      return `M${size/2},0 
              L${size},${size/2} 
              L${size/2},${size} 
              L0,${size/2} Z`;
    
    case EntityType.EVENT:
    case EntityType.MILESTONE:
      return `M${size/4},0 
              L${size*3/4},0 
              L${size},${size/2} 
              L${size*3/4},${size} 
              L${size/4},${size} 
              L0,${size/2} Z`;
    
    case EntityType.RESOURCE:
      return `M0,${size/4} 
              Q0,0 ${size/4},0 
              L${size*3/4},0 
              Q${size},0 ${size},${size/4} 
              L${size},${size*3/4} 
              Q${size},${size} ${size*3/4},${size} 
              L${size/4},${size} 
              Q0,${size} 0,${size*3/4} Z`;
    
    default:
      return `M0,0 L${size},0 L${size},${size} L0,${size} Z`;
  }
}

// Generate styles for relationships with improved visual appeal
export function getRelationshipStyle(relationship: Relationship) {
  const baseStyles = {
    [RelationshipType.FLOW]: {
      strokeWidth: 2,
      stroke: '#3182CE',
      strokeDasharray: '',
      markerEnd: 'url(#arrowhead)'
    },
    [RelationshipType.COMMUNICATION]: {
      strokeWidth: 2,
      stroke: '#805AD5',
      strokeDasharray: '5,5',
      markerEnd: 'url(#arrowhead)'
    },
    [RelationshipType.DEPENDENCY]: {
      strokeWidth: 2,
      stroke: '#DD6B20',
      strokeDasharray: '',
      markerEnd: 'url(#diamond)'
    },
    // Add SpaceX specific relationship styles
    [RelationshipType.TRANSFER]: {
      strokeWidth: 2,
      stroke: '#2B6CB0',
      strokeDasharray: '2,2',
      markerEnd: 'url(#arrowhead)'
    },
    [RelationshipType.INTEGRATION]: {
      strokeWidth: 2,
      stroke: '#48BB78',
      strokeDasharray: '',
      markerEnd: 'url(#diamond)'
    },
    [RelationshipType.TESTING]: {
      strokeWidth: 2,
      stroke: '#9F7AEA',
      strokeDasharray: '5,2',
      markerEnd: 'url(#arrowhead)'
    },
    [RelationshipType.SUPPLY]: {
      strokeWidth: 2,
      stroke: '#ED64A6',
      strokeDasharray: '8,3',
      markerEnd: 'url(#diamond)'
    }
  };

  const relType = relationship.type as string || RelationshipType.FLOW;
  const style = baseStyles[relType as keyof typeof baseStyles] || baseStyles[RelationshipType.FLOW];
  
  // Apply different styles based on frequency
  const frequency = relationship.metrics?.frequency || 1;
  const frequencyMultiplier = Math.min(frequency, 3) / 2;
  
  return {
    ...style,
    strokeWidth: style.strokeWidth * frequencyMultiplier,
    opacity: 0.7 + (frequencyMultiplier * 0.1)
  };
}

// Enhanced critical path visualization
export function findCriticalPath(entities: Entity[], relationships: Relationship[]): string[] {
  // Create adjacency list
  const adjacencyList = new Map<string, {target: string, frequency: number}[]>();
  
  entities.forEach(entity => {
    adjacencyList.set(entity.id, []);
  });
  
  relationships.forEach(rel => {
    const connections = adjacencyList.get(rel.source) || [];
    connections.push({
      target: rel.target,
      frequency: rel.metrics?.frequency || 1
    });
    adjacencyList.set(rel.source, connections);
  });
  
  // Find start nodes (nodes with no incoming edges)
  const incomingEdges = new Map<string, number>();
  
  relationships.forEach(rel => {
    incomingEdges.set(rel.target, (incomingEdges.get(rel.target) || 0) + 1);
  });
  
  const startNodes = entities
    .filter(entity => !incomingEdges.has(entity.id))
    .map(entity => entity.id);
  
  // Find end nodes (nodes with no outgoing edges)
  const endNodes = entities
    .filter(entity => {
      const connections = adjacencyList.get(entity.id);
      return connections && connections.length === 0;
    })
    .map(entity => entity.id);
  
  // If no clear start/end, use the node with highest frequency as start
  // and the one with second highest as end
  const sortedByFrequency = [...entities].sort((a, b) => 
    (b.metrics?.frequency || 0) - (a.metrics?.frequency || 0)
  );
  
  const effectiveStartNodes = startNodes.length > 0 ? startNodes : [sortedByFrequency[0].id];
  const effectiveEndNodes = endNodes.length > 0 ? endNodes : 
    [sortedByFrequency.length > 1 ? sortedByFrequency[1].id : sortedByFrequency[0].id];
  
  // Find all paths from start to end nodes
  const allPaths: string[][] = [];
  
  effectiveStartNodes.forEach(startNode => {
    effectiveEndNodes.forEach(endNode => {
      const visited = new Set<string>();
      const path: string[] = [];
      
      function dfs(node: string) {
        visited.add(node);
        path.push(node);
        
        if (node === endNode) {
          allPaths.push([...path]);
        } else {
          const neighbors = adjacencyList.get(node) || [];
          
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor.target)) {
              dfs(neighbor.target);
            }
          }
        }
        
        visited.delete(node);
        path.pop();
      }
      
      dfs(startNode);
    });
  });
  
  // Calculate the "weight" of each path based on entity frequency
  const pathWeights = allPaths.map(path => {
    const weight = path.reduce((sum, nodeId) => {
      const entity = entities.find(e => e.id === nodeId);
      return sum + (entity?.metrics?.frequency || 0);
    }, 0);
    
    return { path, weight };
  });
  
  // Return the path with highest weight, or an empty path if none found
  return pathWeights.length > 0 
    ? pathWeights.sort((a, b) => b.weight - a.weight)[0].path 
    : [];
}

// Improved layout algorithm for better spacing and organization
export function calculateEnhancedEntityPositions(
  entities: Entity[], 
  relationships: Relationship[], 
  width: number, 
  height: number
) {
  // Implement a layered layout approach for processes

  // 1. Identify process layers (distance from start)
  const layers = new Map<string, number>();
  const criticalPath = findCriticalPath(entities, relationships);
  
  // Initialize all entities with a large layer number
  entities.forEach(entity => layers.set(entity.id, Infinity));
  
  // Assign layer 0 to start nodes
  const startNodes = entities.filter(entity => {
    return !relationships.some(rel => rel.target === entity.id);
  });
  
  startNodes.forEach(entity => layers.set(entity.id, 0));
  
  // Propagate layer numbers
  let changed = true;
  while (changed) {
    changed = false;
    relationships.forEach(rel => {
      const sourceLayer = layers.get(rel.source);
      const targetLayer = layers.get(rel.target);
      
      if (sourceLayer !== undefined && targetLayer !== undefined) {
        const newLayer = sourceLayer + 1;
        if (newLayer < targetLayer) {
          layers.set(rel.target, newLayer);
          changed = true;
        }
      }
    });
  }
  
  // Count nodes in each layer
  const layerCounts = new Map<number, number>();
  const layerNodes = new Map<number, string[]>();
  
  entities.forEach(entity => {
    const layer = layers.get(entity.id) || 0;
    layerCounts.set(layer, (layerCounts.get(layer) || 0) + 1);
    
    if (!layerNodes.has(layer)) {
      layerNodes.set(layer, []);
    }
    const layerNodeArray = layerNodes.get(layer);
    if (layerNodeArray) {
      layerNodeArray.push(entity.id);
    }
  });
  
  const maxLayer = Math.max(...Array.from(layerCounts.keys()));
  
  // Assign positions based on layers
  const positions = new Map<string, {x: number, y: number}>();
  
  for (let layer = 0; layer <= maxLayer; layer++) {
    const nodesInLayer = layerNodes.get(layer) || [];
    const layerWidth = width * 0.8;
    const layerHeight = height / (maxLayer + 1);
    const nodeSpacing = layerWidth / (nodesInLayer.length + 1);
    
    nodesInLayer.forEach((nodeId, index) => {
      const isCritical = criticalPath.includes(nodeId);
      
      // Critical path nodes are centered
      let xPosition = (index + 1) * nodeSpacing + (width * 0.1);
      if (isCritical) {
        xPosition = width / 2 + (Math.random() * 0.1 - 0.05) * width;
      }
      
      positions.set(nodeId, {
        x: xPosition,
        y: (layer + 0.5) * layerHeight
      });
    });
  }
  
  // Apply force-directed adjustments for fine-tuning
  const iterations = 30;
  const k = Math.sqrt(width * height / entities.length) * 0.5;
  
  for (let i = 0; i < iterations; i++) {
    // Calculate forces...
    const forces = new Map<string, {fx: number, fy: number}>();
    entities.forEach(entity => {
      forces.set(entity.id, {fx: 0, fy: 0});
    });
    
    // Node-node repulsion
    for (let a = 0; a < entities.length; a++) {
      for (let b = a + 1; b < entities.length; b++) {
        const entityA = entities[a];
        const entityB = entities[b];
        
        const posA = positions.get(entityA.id)!;
        const posB = positions.get(entityB.id)!;
        
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;
        
        const force = (k * k) / distance;
        const forceX = force * dx / distance;
        const forceY = force * dy / distance;
        
        forces.get(entityA.id)!.fx -= forceX;
        forces.get(entityA.id)!.fy -= forceY;
        forces.get(entityB.id)!.fx += forceX;
        forces.get(entityB.id)!.fy += forceY;
      }
    }
    
    // Edge attraction
    relationships.forEach(rel => {
      const source = positions.get(rel.source)!;
      const target = positions.get(rel.target)!;
      
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;
      
      const force = (distance * distance) / k;
      const forceX = force * dx / distance;
      const forceY = force * dy / distance;
      
      forces.get(rel.source)!.fx += forceX * 0.2; // Reduced horizontal force
      forces.get(rel.source)!.fy += forceY * 0.05; // Minimal vertical force
      forces.get(rel.target)!.fx -= forceX * 0.2;
      forces.get(rel.target)!.fy -= forceY * 0.05;
    });
    
    // Apply forces with decreasing strength
    const damping = 1 - (i / iterations);
    entities.forEach(entity => {
      const pos = positions.get(entity.id)!;
      const force = forces.get(entity.id)!;
      const layer = layers.get(entity.id) || 0;
      
      pos.x += force.fx * damping;
      // Constrain vertical movement to stay close to layer
      const layerY = (layer + 0.5) * (height / (maxLayer + 1));
      pos.y = layerY + (force.fy * damping * 0.2);
      
      // Keep within bounds
      pos.x = Math.max(50, Math.min(width - 50, pos.x));
      pos.y = Math.max(50, Math.min(height - 50, pos.y));
    });
  }
  
  return positions;
}

// Enhanced sample data with timing information and ship/booster properties
export function getSampleProcessData() {
  return {
    entities: [
      {
        id: "STARSHIP_SN15",
        type: EntityType.VEHICLE,
        name: "Starship SN15",
        properties: {
          description: "Starship prototype number 15",
          role: "ship",
          category: "spacecraft"
        },
        metrics: { frequency: 3, duration: 45, durationUnit: "days" }
      },
      {
        id: "SUPERHEAVY_BN3",
        type: EntityType.VEHICLE,
        name: "Super Heavy BN3",
        properties: {
          description: "Super Heavy booster prototype 3",
          role: "booster",
          category: "booster"
        },
        metrics: { frequency: 2, duration: 60, durationUnit: "days" }
      },
      {
        id: "STATIC_FIRE",
        type: EntityType.TEST,
        name: "Static Fire Test",
        properties: {
          description: "Engine static fire testing",
          icon: "flame"
        },
        metrics: { frequency: 4, duration: 2, durationUnit: "hours" }
      },
      {
        id: "LAUNCH_SITE",
        type: EntityType.FACILITY,
        name: "Launch Site",
        properties: {
          description: "Starbase launch facility",
          icon: "rocket"
        },
        metrics: { frequency: 2, duration: null }
      },
      {
        id: "FLIGHT_TEST",
        type: EntityType.MILESTONE,
        name: "Flight Test",
        properties: {
          description: "Orbital flight test",
          icon: "flag"
        },
        metrics: { frequency: 1, duration: 8, durationUnit: "minutes" }
      }
    ],
    relationships: [
      {
        id: "rel1",
        source: "STARSHIP_SN15",
        target: "STATIC_FIRE",
        type: RelationshipType.TESTING,
        properties: { 
          action: "UNDERGOES",
          label: "Undergoes Test",
          animate: true
        },
        metrics: { frequency: 3, duration: 3, durationUnit: "days" }
      },
      {
        id: "rel2",
        source: "SUPERHEAVY_BN3",
        target: "STATIC_FIRE",
        type: RelationshipType.TESTING,
        properties: {
          label: "Undergoes Test",
          animate: true
        },
        metrics: { frequency: 2, duration: 4, durationUnit: "days" }
      },
      {
        id: "rel3",
        source: "STATIC_FIRE",
        target: "LAUNCH_SITE",
        type: RelationshipType.FLOW,
        properties: {
          label: "Conducted At",
          animate: true
        },
        metrics: { frequency: 5, duration: 1, durationUnit: "day" }
      },
      {
        id: "rel4",
        source: "LAUNCH_SITE",
        target: "SUPERHEAVY_BN3",
        type: RelationshipType.INTEGRATION,
        properties: { 
          action: "STACKS",
          label: "Stacks",
          animate: true
        },
        metrics: { frequency: 1, duration: 2, durationUnit: "days" }
      },
      {
        id: "rel5",
        source: "SUPERHEAVY_BN3",
        target: "STARSHIP_SN15",
        type: RelationshipType.INTEGRATION,
        properties: { 
          action: "CARRIES",
          label: "Carries",
          animate: true
        },
        metrics: { frequency: 1, duration: 1, durationUnit: "day" }
      },
      {
        id: "rel6",
        source: "STARSHIP_SN15",
        target: "FLIGHT_TEST",
        type: RelationshipType.FLOW,
        properties: { 
          action: "PERFORMS",
          label: "Performs",
          animate: true
        },
        metrics: { frequency: 1, duration: 8, durationUnit: "minutes" }
      }
    ],
    metadata: {
      startTime: new Date(2023, 0, 1),
      endTime: new Date(2023, 3, 1),
      totalEvents: 6,
      processName: "Starship Development and Testing",
      theme: "light",
      description: "A visualization of the Starship and Super Heavy development process"
    },
    visualSettings: {
      showLabels: true,
      showIcons: true,
      showMetrics: true,
      animateFlows: true,
      highlightCriticalPath: true,
      theme: "light",
      zoom: 1.0
    }
  };
}

// Function to create SVG markers for arrows
export function createSVGMarkers() {
  return `
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" 
              refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#3182CE" />
      </marker>
      <marker id="diamond" markerWidth="12" markerHeight="8" 
              refX="6" refY="4" orient="auto">
        <polygon points="0 4, 6 0, 12 4, 6 8" fill="#DD6B20" />
      </marker>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="actorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#B794F4" />
        <stop offset="100%" stop-color="#805AD5" />
      </linearGradient>
      <linearGradient id="systemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#68D391" />
        <stop offset="100%" stop-color="#38A169" />
      </linearGradient>
      <linearGradient id="taskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#63B3ED" />
        <stop offset="100%" stop-color="#3182CE" />
      </linearGradient>
      <linearGradient id="shipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#B794F4" />
        <stop offset="100%" stop-color="#6B46C1" />
      </linearGradient>
      <linearGradient id="boosterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F6AD55" />
        <stop offset="100%" stop-color="#DD6B20" />
      </linearGradient>
    </defs>
  `;
}
