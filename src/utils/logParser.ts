
import { Entity, EntityType, Relationship, RelationshipType, ProcessData } from '../types/processTypes';

// Example log format:
// 15 Jan: S28 moved to orbital launch mount at Pad A for integration testing (NSF)
// 18 Jan: B9 booster undergoes cryo testing at suborbital pad (RGV photos)

const DEFAULT_ENTITY_TYPES = {
  USER: EntityType.ACTOR,
  SYSTEM: EntityType.SYSTEM,
  TASK: EntityType.TASK,
  EVENT: EntityType.EVENT,
  RESOURCE: EntityType.RESOURCE,
};

export async function parseLogText(logText: string): Promise<ProcessData> {
  const lines = logText.trim().split('\n');
  
  if (lines.length === 0) {
    throw new Error('Log is empty');
  }
  
  // Maps to track unique entities and relationships
  const entitiesMap = new Map<string, Entity>();
  const relationshipsMap = new Map<string, Relationship>();
  
  // Track event sequence
  let minDate = new Date();
  let maxDate = new Date(0);
  const currentYear = new Date().getFullYear();
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Extract parts: DD MMM: ENTITY action LOCATION for REASON (SOURCE)
    // Example: 15 Jan: S28 moved to orbital launch mount at Pad A for integration testing (NSF)
    const match = line.match(/^(\d+)\s+([A-Za-z]+):\s+([^\s]+)\s+(.+?)(?:\s+\(([^)]+)\))?$/);
    
    if (!match) {
      console.warn(`Line ${i + 1} doesn't match expected format:`, line);
      continue;
    }
    
    const [_, day, month, entityName, actionAndLocation, source] = match;
    
    // Parse date (assuming current year if not specified)
    const monthIndex = new Date(`${month} 1, 2000`).getMonth();
    const eventTime = new Date(currentYear, monthIndex, parseInt(day));
    
    // Split action and location
    const actionParts = actionAndLocation.split(' at ');
    const action = actionParts[0];
    const location = actionParts.length > 1 ? actionParts[1].split(' for ')[0] : '';
    const reason = actionParts.length > 1 && actionParts[1].includes(' for ') ? 
      actionParts[1].split(' for ')[1] : '';
    
    // Update min/max dates
    if (eventTime < minDate) minDate = new Date(eventTime);
    if (eventTime > maxDate) maxDate = new Date(eventTime);
    
    // Create or update entity
    if (!entitiesMap.has(entityName)) {
      entitiesMap.set(entityName, {
        id: entityName,
        type: determineEntityType(entityName),
        name: formatEntityName(entityName),
        properties: {},
        metrics: { frequency: 0 }
      });
    }
    
    const entity = entitiesMap.get(entityName)!;
    entity.metrics!.frequency += 1;
    
    // Create location entity if it exists
    if (location) {
      if (!entitiesMap.has(location)) {
        entitiesMap.set(location, {
          id: location,
          type: EntityType.RESOURCE,
          name: formatEntityName(location),
          properties: {},
          metrics: { frequency: 0 }
        });
      }
      
      const locationEntity = entitiesMap.get(location)!;
      locationEntity.metrics!.frequency += 1;
      
      // Create relationship between entity and location
      const relationshipId = `${entityName}-AT-${location}`;
      
      if (!relationshipsMap.has(relationshipId)) {
        relationshipsMap.set(relationshipId, {
          id: relationshipId,
          source: entityName,
          target: location,
          type: RelationshipType.ASSOCIATION,
          properties: { action },
          metrics: { frequency: 0, timestamp: eventTime }
        });
      }
      
      const relationship = relationshipsMap.get(relationshipId)!;
      relationship.metrics!.frequency += 1;
    }
    
    // If there's a previous line, create sequential relationship
    if (i > 0) {
      const prevLine = lines[i - 1].trim();
      const prevMatch = prevLine.match(/^(\d+)\s+([A-Za-z]+):\s+([^\s]+)\s+/);
      
      if (prevMatch) {
        const prevEntity = prevMatch[3];
        
        // Don't create self-loops if the same entity has consecutive actions
        if (prevEntity !== entityName) {
          const flowRelationshipId = `${prevEntity}-FLOW-${entityName}`;
          
          if (!relationshipsMap.has(flowRelationshipId)) {
            relationshipsMap.set(flowRelationshipId, {
              id: flowRelationshipId,
              source: prevEntity,
              target: entityName,
              type: RelationshipType.FLOW,
              properties: {},
              metrics: { frequency: 0 }
            });
          }
          
          const flowRelationship = relationshipsMap.get(flowRelationshipId)!;
          flowRelationship.metrics!.frequency += 1;
        }
      }
    }
  }
  
  // Convert maps to arrays
  const entities = Array.from(entitiesMap.values());
  const relationships = Array.from(relationshipsMap.values());
  
  return {
    entities,
    relationships,
    metadata: {
      startTime: minDate,
      endTime: maxDate,
      totalEvents: lines.length,
    }
  };
}

function determineEntityType(id: string): EntityType {
  const upperID = id.toUpperCase();
  
  // Check for specific prefixes or patterns in the entity id
  if (upperID.startsWith('S') && /S\d+/.test(upperID)) {
    return EntityType.SYSTEM; // Spacecraft/Starship
  }
  if (upperID.startsWith('B') && /B\d+/.test(upperID)) {
    return EntityType.SYSTEM; // Booster
  }
  if (upperID.includes('PAD') || upperID.includes('BAY') || upperID.includes('COMPLEX')) {
    return EntityType.RESOURCE; // Locations
  }
  if (upperID.includes('ENGINE') || upperID.includes('RAPTOR')) {
    return EntityType.RESOURCE; // Components
  }
  
  // Check for standard prefixes
  if (upperID.startsWith('USER') || upperID.startsWith('PERSON')) {
    return EntityType.ACTOR;
  }
  if (upperID.startsWith('SYS') || upperID.startsWith('SERVER')) {
    return EntityType.SYSTEM;
  }
  if (upperID.startsWith('TASK') || upperID.startsWith('ACTIVITY')) {
    return EntityType.TASK;
  }
  if (upperID.startsWith('EVT') || upperID.startsWith('EVENT')) {
    return EntityType.EVENT;
  }
  if (upperID.startsWith('RES') || upperID.startsWith('RESOURCE')) {
    return EntityType.RESOURCE;
  }
  
  // Default to EVENT for unknown types
  return EntityType.EVENT;
}

function determineRelationshipType(action: string): RelationshipType {
  const upperAction = action.toUpperCase();
  
  if (upperAction.includes('MOVED') || upperAction.includes('TRANSPORTED') || upperAction.includes('DELIVERED')) {
    return RelationshipType.TRANSFER;
  }
  if (upperAction.includes('TESTED') || upperAction.includes('INSTALLED') || upperAction.includes('INTEGRATED')) {
    return RelationshipType.USAGE;
  }
  if (upperAction.includes('LAUNCH') || upperAction.includes('STATIC FIRE') || upperAction.includes('TEST')) {
    return RelationshipType.COMMUNICATION;
  }
  
  // Default relationship type
  return RelationshipType.FLOW;
}

function formatEntityName(id: string): string {
  return id
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim();
}
