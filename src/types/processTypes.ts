
export enum EntityType {
  START = "START",
  ACTIVITY = "ACTIVITY",
  DECISION = "DECISION",
  END = "END",
  SYSTEM = "SYSTEM",
  USER = "USER",
  DATA = "DATA",
  // Add missing types
  ACTOR = "ACTOR",
  TASK = "TASK",
  EVENT = "EVENT",
  RESOURCE = "RESOURCE"
}

export enum RelationshipType {
  FLOW = "FLOW",
  DATA_FLOW = "DATA_FLOW",
  DEPENDENCY = "DEPENDENCY",
  ASSOCIATION = "ASSOCIATION",
  TRIGGER = "TRIGGER",
  // Add missing types
  TRANSFER = "TRANSFER",
  USAGE = "USAGE",
  COMMUNICATION = "COMMUNICATION"
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  properties?: Record<string, any>;
  timestamp?: Date;
  // Add metrics property
  metrics?: {
    frequency: number;
    [key: string]: any;
  };
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type?: RelationshipType;
  label?: string;
  properties?: Record<string, any>;
  // Add metrics property
  metrics?: {
    frequency: number;
    timestamp?: Date;
    [key: string]: any;
  };
}

export interface ProcessData {
  entities: Entity[];
  relationships: Relationship[];
  metadata?: Record<string, any>;
}

export interface ProcessMetrics {
  totalEntities: number;
  totalRelationships: number;
  entityTypeCounts: Record<string, number>;
  averagePathLength: number;
  criticalPathLength: number;
  bottlenecks: string[];
}

// Add EntityStyleMapping interface
export interface EntityStyleMapping {
  [key: string]: {
    shape: string;
    color: string;
  };
}
