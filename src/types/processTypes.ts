export enum EntityType {
  START = "START",
  ACTIVITY = "ACTIVITY",
  DECISION = "DECISION",
  END = "END",
  SYSTEM = "SYSTEM",
  USER = "USER",
  DATA = "DATA"
}

export enum RelationshipType {
  FLOW = "FLOW",
  DATA_FLOW = "DATA_FLOW",
  DEPENDENCY = "DEPENDENCY",
  ASSOCIATION = "ASSOCIATION",
  TRIGGER = "TRIGGER"
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type?: RelationshipType;
  label?: string;
  properties?: Record<string, any>;
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
