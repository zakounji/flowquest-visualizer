
export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  properties: Record<string, any>;
  metrics: {
    frequency: number;
    duration?: number;
    startTime?: Date;
    endTime?: Date;
  };
}

export enum EntityType {
  TASK = 'task',
  ACTOR = 'actor',
  SYSTEM = 'system',
  EVENT = 'event',
  RESOURCE = 'resource',
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  properties: Record<string, any>;
  metrics: {
    frequency: number;
    duration?: number;
    timestamp?: Date;
  };
}

export enum RelationshipType {
  FLOW = 'flow',
  TRANSFER = 'transfer',
  COMMUNICATION = 'communication',
  USAGE = 'usage',
}

export interface ProcessData {
  entities: Entity[];
  relationships: Relationship[];
  metadata: {
    startTime: Date;
    endTime: Date;
    totalEvents: number;
    processName?: string;
  };
}

export interface TimelineEvent {
  id: string;
  entityId: string;
  time: Date;
  action: string;
  properties: Record<string, any>;
}

export interface EntityStyleMapping {
  [EntityType.TASK]: {
    shape: 'rectangle';
    color: string;
    icon?: string;
  };
  [EntityType.ACTOR]: {
    shape: 'circle';
    color: string;
    icon?: string;
  };
  [EntityType.SYSTEM]: {
    shape: 'diamond';
    color: string;
    icon?: string;
  };
  [EntityType.EVENT]: {
    shape: 'hexagon';
    color: string;
    icon?: string;
  };
  [EntityType.RESOURCE]: {
    shape: 'rounded-rectangle';
    color: string;
    icon?: string;
  };
}

export interface VisualizationSettings {
  layout: 'force' | 'dagre' | 'radial' | 'timeline';
  showLabels: boolean;
  animateFlows: boolean;
  highlightCriticalPath: boolean;
  nodeSize: number;
  entityStyleMapping: EntityStyleMapping;
}
