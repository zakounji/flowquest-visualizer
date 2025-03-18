import { Entity, EntityType, Relationship, EntityStyleMapping } from '../types/processTypes';

export const defaultEntityStyles: EntityStyleMapping = {
  [EntityType.TASK]: {
    shape: 'rectangle',
    color: '#3182CE', // Blue
  },
  [EntityType.ACTOR]: {
    shape: 'circle',
    color: '#805AD5', // Purple
  },
  [EntityType.SYSTEM]: {
    shape: 'diamond',
    color: '#38A169', // Green
  },
  [EntityType.EVENT]: {
    shape: 'hexagon',
    color: '#DD6B20', // Orange
  },
  [EntityType.RESOURCE]: {
    shape: 'rounded-rectangle',
    color: '#D53F8C', // Pink
  },
};

export function getNodeShape(entity: Entity, size: number = 80) {
  const type = entity.type;
  
  switch (type) {
    case EntityType.TASK:
      return `M0,${size/6} 
              Q0,0 ${size/6},0 
              L${size - size/6},0 
              Q${size},0 ${size},${size/6} 
              L${size},${size - size/6} 
              Q${size},${size} ${size - size/6},${size} 
              L${size/6},${size} 
              Q0,${size} 0,${size - size/6} Z`;
    
    case EntityType.ACTOR:
      const radius = size / 2;
      return `M${size/2},0 
              A${radius},${radius} 0 1,1 ${size/2},${size} 
              A${radius},${radius} 0 1,1 ${size/2},0 Z`;
    
    case EntityType.SYSTEM:
      return `M${size/2},0 
              L${size},${size/2} 
              L${size/2},${size} 
              L0,${size/2} Z`;
    
    case EntityType.EVENT:
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

export function findCriticalPath(entities: Entity[], relationships: Relationship[]): string[] {
  // Simplified algorithm to find the critical path:
  // For this example, we'll consider the path with the highest frequency sum
  
  // Create adjacency list
  const adjacencyList = new Map<string, {target: string, frequency: number}[]>();
  
  entities.forEach(entity => {
    adjacencyList.set(entity.id, []);
  });
  
  relationships.forEach(rel => {
    const connections = adjacencyList.get(rel.source) || [];
    connections.push({
      target: rel.target,
      frequency: rel.metrics.frequency
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
    b.metrics.frequency - a.metrics.frequency
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
      return sum + (entity?.metrics.frequency || 0);
    }, 0);
    
    return { path, weight };
  });
  
  // Return the path with highest weight, or an empty path if none found
  return pathWeights.length > 0 
    ? pathWeights.sort((a, b) => b.weight - a.weight)[0].path 
    : [];
}

export function calculateEntityPositions(
  entities: Entity[], 
  relationships: Relationship[], 
  width: number, 
  height: number
) {
  // Simple force-directed layout simulation
  // In a real implementation, use a proper force layout library
  
  // Initialize positions randomly
  const positions = new Map<string, {x: number, y: number}>();
  entities.forEach(entity => {
    positions.set(entity.id, {
      x: Math.random() * (width * 0.8) + (width * 0.1),
      y: Math.random() * (height * 0.8) + (height * 0.1)
    });
  });
  
  // Run a few iterations of force-directed layout
  const iterations = 50;
  const k = Math.sqrt(width * height / entities.length) * 0.8;
  
  for (let i = 0; i < iterations; i++) {
    // Calculate repulsive forces between all nodes
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
      
      forces.get(rel.source)!.fx += forceX;
      forces.get(rel.source)!.fy += forceY;
      forces.get(rel.target)!.fx -= forceX;
      forces.get(rel.target)!.fy -= forceY;
    });
    
    // Apply forces with decreasing strength
    const damping = 1 - (i / iterations);
    entities.forEach(entity => {
      const pos = positions.get(entity.id)!;
      const force = forces.get(entity.id)!;
      
      pos.x += force.fx * damping;
      pos.y += force.fy * damping;
      
      // Keep within bounds
      pos.x = Math.max(50, Math.min(width - 50, pos.x));
      pos.y = Math.max(50, Math.min(height - 50, pos.y));
    });
  }
  
  return positions;
}

export function getSampleProcessData() {
  return {
    entities: [
      {
        id: "USER_001",
        type: EntityType.ACTOR,
        name: "User 001",
        properties: {},
        metrics: { frequency: 3 }
      },
      {
        id: "FORM_SYSTEM",
        type: EntityType.SYSTEM,
        name: "Form System",
        properties: {},
        metrics: { frequency: 2 }
      },
      {
        id: "APPROVAL_TASK",
        type: EntityType.TASK,
        name: "Approval Task",
        properties: {},
        metrics: { frequency: 1 }
      },
      {
        id: "NOTIFICATION_SERVICE",
        type: EntityType.SYSTEM,
        name: "Notification Service",
        properties: {},
        metrics: { frequency: 1 }
      },
      {
        id: "ADMIN_USER",
        type: EntityType.ACTOR,
        name: "Admin User",
        properties: {},
        metrics: { frequency: 1 }
      }
    ],
    relationships: [
      {
        id: "rel1",
        source: "USER_001",
        target: "FORM_SYSTEM",
        type: RelationshipType.FLOW,
        properties: { action: "SUBMIT" },
        metrics: { frequency: 2 }
      },
      {
        id: "rel2",
        source: "FORM_SYSTEM",
        target: "APPROVAL_TASK",
        type: RelationshipType.FLOW,
        properties: {},
        metrics: { frequency: 1 }
      },
      {
        id: "rel3",
        source: "APPROVAL_TASK",
        target: "NOTIFICATION_SERVICE",
        type: RelationshipType.FLOW,
        properties: {},
        metrics: { frequency: 1 }
      },
      {
        id: "rel4",
        source: "NOTIFICATION_SERVICE",
        target: "ADMIN_USER",
        type: RelationshipType.COMMUNICATION,
        properties: { action: "NOTIFY" },
        metrics: { frequency: 1 }
      },
      {
        id: "rel5",
        source: "ADMIN_USER",
        target: "USER_001",
        type: RelationshipType.COMMUNICATION,
        properties: { action: "RESPOND" },
        metrics: { frequency: 1 }
      }
    ],
    metadata: {
      startTime: new Date(2023, 0, 1),
      endTime: new Date(2023, 0, 1, 1),
      totalEvents: 5,
      processName: "Form Submission Process"
    }
  };
}
