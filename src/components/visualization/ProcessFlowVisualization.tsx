
import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionLineType,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ProcessData, Entity, Relationship, EntityType } from '@/types/processTypes';
import { defaultEntityStyles } from '@/utils/visualizationHelpers';
import ProcessNode from './nodes/ProcessNode';
import ProcessEdge from './edges/ProcessEdge';

interface ProcessFlowVisualizationProps {
  processData: ProcessData;
  highlightedPath: string[];
  showLabels: boolean;
  animateFlows: boolean;
}

// Define the node types for React Flow
const nodeTypes = {
  processNode: ProcessNode,
};

// Define the edge types for React Flow
const edgeTypes = {
  processEdge: ProcessEdge,
};

const ProcessFlowVisualization = ({
  processData,
  highlightedPath,
  showLabels,
  animateFlows
}: ProcessFlowVisualizationProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Transform process data into React Flow nodes and edges
  useEffect(() => {
    if (!processData || !processData.entities || !processData.relationships) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Create nodes from entities
    const flowNodes: Node[] = processData.entities.map((entity, index) => {
      const entityStyle = defaultEntityStyles[entity.type] || defaultEntityStyles[EntityType.TASK];
      const isHighlighted = highlightedPath.includes(entity.id);
      
      // Position nodes in a circular layout if no positioning is provided
      const angle = (2 * Math.PI * index) / processData.entities.length;
      const radius = Math.min(800, 100 * processData.entities.length);
      const x = 600 + radius * Math.cos(angle);
      const y = 400 + radius * Math.sin(angle);
      
      return {
        id: entity.id,
        type: 'processNode',
        position: { x, y },
        data: {
          entity,
          color: entityStyle.color,
          isHighlighted,
          showLabel: showLabels,
        },
      };
    });

    // Create edges from relationships
    const flowEdges: Edge[] = processData.relationships.map((rel) => {
      const isHighlighted = 
        highlightedPath.includes(rel.source) && 
        highlightedPath.includes(rel.target) &&
        highlightedPath.indexOf(rel.target) === highlightedPath.indexOf(rel.source) + 1;
      
      return {
        id: rel.id,
        source: rel.source,
        target: rel.target,
        type: 'processEdge',
        animated: animateFlows && isHighlighted,
        data: {
          relationship: rel,
          isHighlighted,
        },
        style: {
          stroke: isHighlighted ? '#8B5CF6' : '#94a3b8',
          strokeWidth: isHighlighted ? 3 : 2,
        },
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [processData, highlightedPath, showLabels, animateFlows, setNodes, setEdges]);

  const onInit = useCallback((reactFlowInstance) => {
    reactFlowInstance.fitView({ padding: 0.2 });
  }, []);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.Bezier}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={4}
        fitView
        attributionPosition="bottom-right"
        onInit={onInit}
      >
        <Background color="#f1f5f9" gap={16} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

export default ProcessFlowVisualization;
