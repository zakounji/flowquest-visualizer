
import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionLineType,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  MiniMap,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ProcessData, Entity, Relationship, EntityType } from '@/types/processTypes';
import { enhancedEntityStyles } from '@/utils/visualizationHelpers';
import ProcessNode from './nodes/ProcessNode';
import ProcessEdge from './edges/ProcessEdge';

interface ProcessFlowVisualizationProps {
  processData: ProcessData;
  highlightedPath: string[];
  showLabels: boolean;
  animateFlows: boolean;
  onNodeClick: (entity: Entity) => void;
  currentAnimationStep: number;
  isAnimating: boolean;
  flowRef?: React.MutableRefObject<any>;
  showMinimap?: boolean;
}

// Define the node types for React Flow
const nodeTypes = {
  processNode: ProcessNode,
};

// Define the edge types for React Flow
const edgeTypes = {
  processEdge: ProcessEdge,
};

// Helper function for node class names in minimap
const nodeColor = (node: Node) => {
  const nodeData = node.data;
  if (!nodeData?.entity) return '#94a3b8';
  
  const entityType = nodeData.entity.type as EntityType;
  const style = enhancedEntityStyles[entityType] || enhancedEntityStyles[EntityType.TASK];
  
  // Special coloring for ships and boosters
  if (entityType === EntityType.VEHICLE) {
    const entity = nodeData.entity as Entity;
    
    const isShip = entity.properties?.role === 'ship' || 
                 entity.properties?.category === 'ship' ||
                 entity.name.toLowerCase().includes('ship') || 
                 entity.name.toLowerCase().includes('starship') ||
                 entity.name.toLowerCase().includes('s') && 
                 !entity.name.toLowerCase().includes('booster');
                 
    const isBooster = entity.properties?.role === 'booster' || 
                    entity.properties?.category === 'booster' ||
                    entity.name.toLowerCase().includes('booster') || 
                    entity.name.toLowerCase().includes('super heavy') ||
                    entity.name.toLowerCase().includes('b');
    
    if (isShip) return '#9b87f5'; // Purple for ships
    if (isBooster) return '#F97316'; // Orange for boosters
  }
  
  return style.color;
};

// Inner component that uses the React Flow hooks
const ProcessFlowInner = ({
  processData,
  highlightedPath,
  showLabels,
  animateFlows,
  onNodeClick,
  currentAnimationStep,
  isAnimating,
  flowRef,
  showMinimap = false
}: ProcessFlowVisualizationProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowInstance = useReactFlow();
  const d3Container = useRef<SVGSVGElement | null>(null);
  const [animationText, setAnimationText] = useState<string>('');
  const [summaryVisible, setSummaryVisible] = useState<boolean>(false);
  const [animationSummary, setAnimationSummary] = useState<string[]>([]);
  
  // Expose the reactFlowInstance methods via the flowRef
  useEffect(() => {
    if (flowRef && reactFlowInstance) {
      flowRef.current = reactFlowInstance;
    }
  }, [reactFlowInstance, flowRef]);
  
  // Transform process data into React Flow nodes and edges
  useEffect(() => {
    if (!processData || !processData.entities || !processData.relationships) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Create nodes from entities
    const flowNodes: Node[] = processData.entities.map((entity, index) => {
      const entityType = entity.type as EntityType;
      const entityStyle = enhancedEntityStyles[entityType] || enhancedEntityStyles[EntityType.TASK];
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
          onClick: () => onNodeClick(entity),
          animationStep: currentAnimationStep,
          isAnimating
        },
      };
    });

    // Create edges from relationships
    const flowEdges: Edge[] = processData.relationships.map((rel, index) => {
      const isHighlighted = 
        highlightedPath.includes(rel.source) && 
        highlightedPath.includes(rel.target) &&
        highlightedPath.indexOf(rel.target) === highlightedPath.indexOf(rel.source) + 1;
      
      const isCurrentAnimationStep = index === currentAnimationStep;
      
      return {
        id: rel.id,
        source: rel.source,
        target: rel.target,
        type: 'processEdge',
        animated: (animateFlows && isHighlighted) || isCurrentAnimationStep,
        data: {
          relationship: rel,
          isHighlighted,
          isAnimationStep: isCurrentAnimationStep
        },
        style: {
          stroke: isCurrentAnimationStep ? '#ff6b6b' : isHighlighted ? '#8B5CF6' : '#94a3b8',
          strokeWidth: isCurrentAnimationStep ? 4 : isHighlighted ? 3 : 2,
        },
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [processData, highlightedPath, showLabels, animateFlows, setNodes, setEdges, onNodeClick, currentAnimationStep, isAnimating]);

  // Update animation text when animation step changes
  useEffect(() => {
    if (currentAnimationStep >= 0 && isAnimating && processData?.relationships) {
      const currentRel = processData.relationships[currentAnimationStep];
      if (currentRel) {
        // Find the source and target entities
        const sourceEntity = processData.entities.find(e => e.id === currentRel.source);
        const targetEntity = processData.entities.find(e => e.id === currentRel.target);
        
        if (sourceEntity && targetEntity) {
          // Create a descriptive animation text
          const action = currentRel.properties?.action || 
                        currentRel.properties?.label || 
                        currentRel.type;
                        
          const text = `${sourceEntity.name} ${action} ${targetEntity.name}`;
          setAnimationText(text);
          
          // Collect animation steps for summary
          setAnimationSummary(prev => [...prev, text]);
        }
      }
    } else if (currentAnimationStep === -1 && processData?.relationships?.length > 0 && animationSummary.length > 0) {
      // Animation has ended, show summary
      setSummaryVisible(true);
    } else {
      setAnimationText('');
    }
  }, [currentAnimationStep, isAnimating, processData]);

  // Reset the summary when starting a new animation
  useEffect(() => {
    if (currentAnimationStep === 0 && isAnimating) {
      setAnimationSummary([]);
      setSummaryVisible(false);
    }
  }, [currentAnimationStep, isAnimating]);

  // Camera tracking effect for animation
  useEffect(() => {
    if (!reactFlowInstance || currentAnimationStep < 0 || !isAnimating || !processData) return;
    
    // Find the current relationship being animated
    const currentRelationship = processData.relationships[currentAnimationStep];
    if (!currentRelationship) return;
    
    // Find the source and target nodes
    const sourceNode = nodes.find(node => node.id === currentRelationship.source);
    const targetNode = nodes.find(node => node.id === currentRelationship.target);
    
    if (!sourceNode || !targetNode) return;
    
    // Calculate the center point between source and target
    const centerX = (sourceNode.position.x + targetNode.position.x) / 2;
    const centerY = (sourceNode.position.y + targetNode.position.y) / 2;
    
    // Calculate the zoom level based on the distance between nodes
    const dx = sourceNode.position.x - targetNode.position.x;
    const dy = sourceNode.position.y - targetNode.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Adjust zoom based on distance (closer for longer distances)
    const zoom = Math.max(0.8, Math.min(1.5, 600 / distance));
    
    // Animate the camera to focus on the current relationship
    reactFlowInstance.setViewport(
      { 
        x: window.innerWidth / 2 - centerX * zoom, 
        y: window.innerHeight / 2 - centerY * zoom, 
        zoom 
      }, 
      { duration: 800 }
    );
  }, [currentAnimationStep, isAnimating, nodes, reactFlowInstance, processData]);

  const onInit = useCallback((instance) => {
    setTimeout(() => {
      instance.fitView({ padding: 0.2 });
    }, 0);
  }, []);

  return (
    <div className="relative h-full w-full">
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
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#f1f5f9" gap={16} size={1} />
        <Controls showInteractive={false} />
        
        {showMinimap && (
          <MiniMap 
            nodeColor={nodeColor}
            maskColor="rgba(0, 0, 0, 0.1)"
            className="glass-panel"
            zoomable
            pannable
          />
        )}
        
        {/* Animated explanation text at the bottom */}
        {animationText && isAnimating && (
          <Panel position={Position.Bottom} className="w-full flex justify-center py-4">
            <div 
              className="bg-black/70 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in text-center"
              style={{
                animation: 'fade-in 0.5s, float 2s ease-in-out infinite',
                maxWidth: '80%',
              }}
            >
              <p className="font-medium tracking-wide">
                {animationText}
              </p>
            </div>
          </Panel>
        )}
        
        {/* Animation summary overlay */}
        {summaryVisible && !isAnimating && (
          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
            <div className="bg-white/90 rounded-lg shadow-xl p-6 max-w-3xl max-h-[80vh] overflow-auto">
              <h3 className="text-xl font-semibold mb-4 text-center">Process Summary</h3>
              <div className="space-y-3">
                {animationSummary.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="ml-3">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={() => setSummaryVisible(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        )}
      </ReactFlow>
      
      {/* Add floating CSS animation style */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </div>
  );
};

// Wrapper component that provides the React Flow Provider
const ProcessFlowVisualization = (props: ProcessFlowVisualizationProps) => {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <ProcessFlowInner {...props} />
      </ReactFlowProvider>
    </div>
  );
};

export default ProcessFlowVisualization;
