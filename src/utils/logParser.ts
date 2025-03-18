
import { Entity, EntityType, Relationship, RelationshipType, ProcessData } from '../types/processTypes';

// Example log format:
// [timestamp] [component] [action] [details]
// 2023-01-01T12:00:00 USER_001 SUBMIT_FORM {"formId": "F123", "fields": 5}

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
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Extract parts: [timestamp] [component] [action] [details]
    const match = line.match(/^(\S+)\s+(\S+)\s+(\S+)(?:\s+(.+))?$/);
    
    if (!match) {
      console.warn(`Line ${i + 1} doesn't match expected format:`, line);
      continue;
    }
    
    const [_, timestamp, component, action, detailsStr] = match;
    
    // Parse timestamp and details
    const eventTime = new Date(timestamp);
    let details = {};
    
    if (detailsStr) {
      try {
        details = JSON.parse(detailsStr);
      } catch (e) {
        // If not valid JSON, treat as plain text
        details = { text: detailsStr };
      }
    }
    
    // Update min/max dates
    if (eventTime < minDate) minDate = new Date(eventTime);
    if (eventTime > maxDate) maxDate = new Date(eventTime);
    
    // Determine entity types
    const componentType = determineEntityType(component);
    
    // Create or update component entity
    const componentId = component;
    if (!entitiesMap.has(componentId)) {
      entitiesMap.set(componentId, {
        id: componentId,
        type: componentType,
        name: formatEntityName(component),
        properties: {},
        metrics: { frequency: 0 }
      });
    }
    
    const componentEntity = entitiesMap.get(componentId)!;
    componentEntity.metrics.frequency += 1;
    
    // If this action involves another entity, create that too
    if (details && typeof details === 'object' && 'targetId' in details) {
      const targetId = details.targetId as string;
      const targetType = determineEntityType(targetId);
      
      if (!entitiesMap.has(targetId)) {
        entitiesMap.set(targetId, {
          id: targetId,
          type: targetType,
          name: formatEntityName(targetId),
          properties: {},
          metrics: { frequency: 0 }
        });
      }
      
      const targetEntity = entitiesMap.get(targetId)!;
      targetEntity.metrics.frequency += 1;
      
      // Create relationship between component and target
      const relationshipId = `${componentId}-${action}-${targetId}`;
      
      if (!relationshipsMap.has(relationshipId)) {
        relationshipsMap.set(relationshipId, {
          id: relationshipId,
          source: componentId,
          target: targetId,
          type: determineRelationshipType(action),
          properties: { action },
          metrics: { frequency: 0, timestamp: eventTime }
        });
      }
      
      const relationship = relationshipsMap.get(relationshipId)!;
      relationship.metrics.frequency += 1;
    }
    
    // If there's a previous line, create sequential relationship
    if (i > 0) {
      const prevLine = lines[i - 1].trim();
      const prevMatch = prevLine.match(/^(\S+)\s+(\S+)\s+(\S+)(?:\s+(.+))?$/);
      
      if (prevMatch) {
        const prevComponent = prevMatch[2];
        
        // Don't create self-loops if the same component has consecutive actions
        if (prevComponent !== component) {
          const flowRelationshipId = `${prevComponent}-FLOW-${component}`;
          
          if (!relationshipsMap.has(flowRelationshipId)) {
            relationshipsMap.set(flowRelationshipId, {
              id: flowRelationshipId,
              source: prevComponent,
              target: component,
              type: RelationshipType.FLOW,
              properties: {},
              metrics: { frequency: 0 }
            });
          }
          
          const flowRelationship = relationshipsMap.get(flowRelationshipId)!;
          flowRelationship.metrics.frequency += 1;
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
  
  if (upperAction.includes('SEND') || upperAction.includes('TRANSFER')) {
    return RelationshipType.TRANSFER;
  }
  if (upperAction.includes('USE') || upperAction.includes('ACCESS')) {
    return RelationshipType.USAGE;
  }
  if (upperAction.includes('COMM') || upperAction.includes('TALK')) {
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
