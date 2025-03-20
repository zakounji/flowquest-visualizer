
// import React, { useState, useEffect, useRef, memo } from 'react';
// import { Handle, Position } from '@xyflow/react';
// import { EntityType, Entity } from '@/types/processTypes';
// import { enhancedEntityStyles, getNodeShape } from '@/utils/visualizationHelpers';

// interface ProcessNodeProps {
//   data: {
//     entity: Entity;
//     color: string;
//     isHighlighted: boolean;
//     showLabel: boolean;
//     onClick: () => void;
//     animationStep: number;
//     isAnimating: boolean;
//   };
//   selected: boolean;
// }

// const ProcessNode = memo(({ data, selected }: ProcessNodeProps) => {
//   const { entity, color, isHighlighted, showLabel, onClick, animationStep, isAnimating } = data;
//   const entityType = entity.type as string;
//   const entityStyle = enhancedEntityStyles[entityType] || enhancedEntityStyles[EntityType.TASK];
//   const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);
//   const particleRef = useRef<HTMLDivElement>(null);
//   const frameRef = useRef<number>(0);
//   const [completionTime, setCompletionTime] = useState<string | null>(null);
  
//   const isShip = 
//     entityType === EntityType.VEHICLE && (
//       entity.properties?.role === 'ship' || 
//       entity.name.toLowerCase().includes('s') && 
//       !entity.name.toLowerCase().includes('booster')
//     );
  
//   const isBooster = 
//     entityType === EntityType.VEHICLE && (
//       entity.properties?.role === 'booster' || 
//       entity.name.toLowerCase().includes('b') && 
//       !entity.name.toLowerCase().includes('starship')
//     );
  
//   // Calculate node dimensions based on frequency or importance
//   const baseSize = 80;
//   const frequency = entity.metrics?.frequency || 1;
//   const scaleFactor = Math.min(Math.max(1, Math.log2(frequency + 1) * 0.3 + 1), 1.8);
//   const nodeSize = baseSize * scaleFactor;

//   // Define special shapes for ships and boosters
//   const getVehicleShape = () => {
//     if (isShip) {
//       return `M${nodeSize/2},0 
//               L${nodeSize*0.8},${nodeSize*0.2} 
//               L${nodeSize*0.8},${nodeSize*0.8} 
//               L${nodeSize/2},${nodeSize} 
//               L${nodeSize*0.2},${nodeSize*0.8} 
//               L${nodeSize*0.2},${nodeSize*0.2} Z`;
//     }
//     if (isBooster) {
//       return `M${nodeSize/2},0 
//               L${nodeSize*0.8},${nodeSize*0.3} 
//               L${nodeSize*0.7},${nodeSize*0.9} 
//               L${nodeSize*0.3},${nodeSize*0.9} 
//               L${nodeSize*0.2},${nodeSize*0.3} Z`;
//     }
    
//     return getNodeShape(entity, nodeSize);
//   };

//   // Get shape path and style based on entity type
//   const nodePath = entityType === EntityType.VEHICLE && (isShip || isBooster) 
//     ? getVehicleShape() 
//     : getNodeShape(entity, nodeSize);
  
//   // Generate completion time display
//   useEffect(() => {
//     if (entity.metrics?.duration && entity.metrics?.durationUnit) {
//       setCompletionTime(`${entity.metrics.duration} ${entity.metrics.durationUnit}`);
//     } else if (entity.properties?.duration) {
//       setCompletionTime(entity.properties.duration as string);
//     } else {
//       setCompletionTime(null);
//     }
//   }, [entity]);

//   // Particle animation effect for highlighted nodes
//   useEffect(() => {
//     if (isHighlighted && particleRef.current) {
//       // Generate particles
//       const generateParticles = () => {
//         const newParticles = [];
//         const count = isAnimating ? 15 : 5;
        
//         for (let i = 0; i < count; i++) {
//           newParticles.push({
//             id: Math.random(),
//             x: Math.random() * nodeSize,
//             y: Math.random() * nodeSize,
//             size: Math.random() * 4 + 2,
//             speed: Math.random() * 1 + 0.5,
//             opacity: Math.random() * 0.7 + 0.3
//           });
//         }
        
//         setParticles(newParticles);
//       };
      
//       // Animation frames
//       const animate = () => {
//         setParticles(prev => 
//           prev.map(p => ({
//             ...p,
//             y: p.y - p.speed,
//             opacity: p.y < nodeSize * 0.2 ? p.opacity * 0.95 : p.opacity
//           })).filter(p => p.opacity > 0.05)
//         );
        
//         frameRef.current = requestAnimationFrame(animate);
//       };
      
//       // Initialize particles
//       generateParticles();
//       frameRef.current = requestAnimationFrame(animate);
      
//       // Regenerate particles periodically
//       const interval = setInterval(generateParticles, 1000);
      
//       return () => {
//         cancelAnimationFrame(frameRef.current);
//         clearInterval(interval);
//       };
//     }
//   }, [isHighlighted, isAnimating, nodeSize]);

//   // Set node colors and styles
//   let nodeColor = color;
//   let strokeColor = entityStyle.shadowColor || '#344054';
  
//   // Special colors for ships and boosters
//   if (isShip) {
//     nodeColor = '#9b87f5'; // Purple for ships
//     strokeColor = '#6b46c1';
//   } else if (isBooster) {
//     nodeColor = '#F97316'; // Orange for boosters
//     strokeColor = '#c2410c';
//   }
  
//   // Apply highlighting
//   if (isHighlighted) {
//     nodeColor = isShip ? '#8b5cf6' : isBooster ? '#fb923c' : '#818cf8';
//     strokeColor = isShip ? '#6d28d9' : isBooster ? '#ea580c' : '#4f46e5';
//   }
  
//   return (
//     <div className="process-node-wrapper flex justify-center items-center"
//          style={{ width: nodeSize, height: nodeSize }}>
//       {/* Handles for connecting to other nodes */}
//       <Handle
//         type="target"
//         position={Position.Top}
//         className={`w-3 h-1.5 bg-gray-400 border-0 rounded-sm ${isHighlighted ? 'bg-indigo-400' : ''}`}
//       />
//       <Handle
//         type="source"
//         position={Position.Bottom}
//         className={`w-3 h-1.5 bg-gray-400 border-0 rounded-sm ${isHighlighted ? 'bg-indigo-400' : ''}`}
//       />
      
//       {/* Node container with SVG shape */}
//       <div 
//         ref={particleRef}
//         className={`relative flex items-center justify-center transition-all ${selected ? 'ring-2 ring-offset-2 ring-indigo-600' : ''}`}
//         style={{ width: nodeSize, height: nodeSize }}
//         onClick={onClick}
//       >
//         {/* SVG shape for the node */}
//         <svg width={nodeSize} height={nodeSize} className="absolute top-0 left-0">
//           <path
//             d={nodePath}
//             fill={nodeColor}
//             stroke={strokeColor}
//             strokeWidth={selected || isHighlighted ? 3 : 2}
//             filter={`drop-shadow(0px 4px 6px rgba(0,0,0,0.2))`}
//           />
//         </svg>
        
//         {/* Entity name label */}
//         <div className={`absolute inset-0 flex flex-col items-center justify-center p-1 ${isShip || isBooster ? 'text-white' : 'text-gray-800'}`}>
//           <div className="text-xs font-semibold leading-tight text-center" style={{ fontSize: Math.max(8, Math.min(12, 10 * scaleFactor)) }}>
//             {entity.name}
//           </div>
          
//           {/* Entity type tag */}
//           {showLabel && (
//             <div className="text-[8px] opacity-80 mt-1 px-1 rounded bg-black/20">
//               {entityType}
//             </div>
//           )}
//         </div>
        
//         {/* Particle effects for highlighted nodes */}
//         {isHighlighted && particles.length > 0 && (
//           <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '50%' }}>
//             {particles.map(particle => (
//               <div
//                 key={particle.id}
//                 className="absolute rounded-full"
//                 style={{
//                   left: particle.x,
//                   top: particle.y,
//                   width: particle.size,
//                   height: particle.size,
//                   backgroundColor: isShip ? '#c4b5fd' : isBooster ? '#fed7aa' : '#bfdbfe',
//                   opacity: particle.opacity,
//                 }}
//               />
//             ))}
//           </div>
//         )}
        
//         {/* Completion time indicator */}
//         {completionTime && (
//           <div 
//             className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
//             style={{ fontSize: '0.65rem' }}
//           >
//             {completionTime}
//           </div>
//         )}
        
//         {/* Frequency indicator */}
//         {entity.metrics?.frequency && entity.metrics.frequency > 1 && (
//           <div 
//             className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center"
//           >
//             {entity.metrics.frequency}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// });

// export default ProcessNode;





import React, { useState, useEffect, useRef, memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { EntityType, Entity } from '@/types/processTypes';
import { enhancedEntityStyles, getNodeShape } from '@/utils/visualizationHelpers';
import { motion, AnimatePresence } from 'framer-motion';

interface ProcessNodeProps {
  data: {
    entity: Entity;
    color: string;
    isHighlighted: boolean;
    showLabel: boolean;
    onClick: () => void;
    animationStep: number;
    isAnimating: boolean;
  };
  selected: boolean;
}

const ProcessNode = memo(({ data, selected }: ProcessNodeProps) => {
  const { entity, color, isHighlighted, showLabel, onClick, animationStep, isAnimating } = data;
  const entityType = entity.type as string;
  const entityStyle = enhancedEntityStyles[entityType] || enhancedEntityStyles[EntityType.TASK];
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number; color: string }>>([]);
  const particleRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const [completionTime, setCompletionTime] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  
  const isShip = 
    entityType === EntityType.VEHICLE && (
      entity.properties?.role === 'ship' || 
      entity.name.toLowerCase().includes('s') && 
      !entity.name.toLowerCase().includes('booster')
    );
  
  const isBooster = 
    entityType === EntityType.VEHICLE && (
      entity.properties?.role === 'booster' || 
      entity.name.toLowerCase().includes('b') && 
      !entity.name.toLowerCase().includes('starship')
    );
  
  // Calculate node dimensions based on frequency or importance
  const baseSize = 90;
  const frequency = entity.metrics?.frequency || 1;
  const importance = entity.metrics?.importance || 1;
  const scaleFactor = Math.min(Math.max(1, Math.log2(frequency + importance + 1) * 0.35 + 1), 2.0);
  const nodeSize = baseSize * scaleFactor;

  // Define special 3D shapes with gradients
  const getVehicleShape = () => {
    if (isShip) {
      return {
        path: `M${nodeSize/2},0 
                L${nodeSize*0.85},${nodeSize*0.25} 
                L${nodeSize*0.85},${nodeSize*0.8} 
                L${nodeSize/2},${nodeSize*1.05} 
                L${nodeSize*0.15},${nodeSize*0.8} 
                L${nodeSize*0.15},${nodeSize*0.25} Z`,
        gradient: {
          id: "shipGradient",
          stops: [
            { offset: "0%", color: "#a78bfa" },
            { offset: "60%", color: "#8b5cf6" },
            { offset: "100%", color: "#7c3aed" }
          ]
        }
      };
    }
    if (isBooster) {
      return {
        path: `M${nodeSize/2},0 
                L${nodeSize*0.85},${nodeSize*0.3} 
                L${nodeSize*0.75},${nodeSize*0.95} 
                L${nodeSize*0.25},${nodeSize*0.95} 
                L${nodeSize*0.15},${nodeSize*0.3} Z`,
        gradient: {
          id: "boosterGradient",
          stops: [
            { offset: "0%", color: "#fdba74" },
            { offset: "60%", color: "#f97316" },
            { offset: "100%", color: "#ea580c" }
          ]
        }
      };
    }
    
    const defaultShape = getNodeShape(entity, nodeSize);
    return {
      path: defaultShape,
      gradient: {
        id: "defaultGradient",
        stops: [
          { offset: "0%", color: colorLighten(color, 20) },
          { offset: "70%", color: color },
          { offset: "100%", color: colorDarken(color, 20) }
        ]
      }
    };
  };
  
  // Helper functions for color manipulation
  const colorLighten = (color: string, percent: number): string => {
    // Simple implementation - in production use a proper color library
    return color; // Placeholder
  };
  
  const colorDarken = (color: string, percent: number): string => {
    // Simple implementation - in production use a proper color library
    return color; // Placeholder
  };

  // Get shape path and gradient
  const nodeShape = entityType === EntityType.VEHICLE && (isShip || isBooster) 
    ? getVehicleShape() 
    : {
        path: getNodeShape(entity, nodeSize),
        gradient: {
          id: `gradient-${entity.id}`,
          stops: [
            { offset: "0%", color: colorLighten(color, 20) },
            { offset: "70%", color: color },
            { offset: "100%", color: colorDarken(color, 20) }
          ]
        }
      };
  
  // Generate completion time display
  useEffect(() => {
    if (entity.metrics?.duration && entity.metrics?.durationUnit) {
      setCompletionTime(`${entity.metrics.duration} ${entity.metrics.durationUnit}`);
    } else if (entity.properties?.duration) {
      setCompletionTime(entity.properties.duration as string);
    } else {
      setCompletionTime(null);
    }
  }, [entity]);

  // Advanced particle animation effect
  useEffect(() => {
    if ((isHighlighted || hover) && particleRef.current) {
      // Generate particles with more variety
      const generateParticles = () => {
        const newParticles = [];
        const count = isAnimating ? 20 : hover ? 10 : 5;
        const particleColors = isShip 
          ? ['#c4b5fd', '#a78bfa', '#8b5cf6'] 
          : isBooster 
            ? ['#fed7aa', '#fdba74', '#fb923c'] 
            : ['#bfdbfe', '#93c5fd', '#60a5fa'];
            
        for (let i = 0; i < count; i++) {
          newParticles.push({
            id: Math.random(),
            x: Math.random() * nodeSize,
            y: Math.random() * nodeSize,
            size: Math.random() * 5 + 2,
            speed: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.7 + 0.3,
            color: particleColors[Math.floor(Math.random() * particleColors.length)]
          });
        }
        
        setParticles(newParticles);
      };
      
      // Enhanced animation with spiral movement
      const animate = () => {
        setParticles(prev => 
          prev.map(p => {
            const angle = p.y / 40;
            const xOffset = Math.sin(angle) * 1.5;
            
            return {
              ...p,
              x: p.x + xOffset,
              y: p.y - p.speed,
              opacity: p.y < nodeSize * 0.2 ? p.opacity * 0.93 : p.opacity
            };
          }).filter(p => p.opacity > 0.05)
        );
        
        frameRef.current = requestAnimationFrame(animate);
      };
      
      generateParticles();
      frameRef.current = requestAnimationFrame(animate);
      
      const interval = setInterval(generateParticles, 800);
      
      return () => {
        cancelAnimationFrame(frameRef.current);
        clearInterval(interval);
      };
    }
  }, [isHighlighted, isAnimating, nodeSize, hover]);

  // Set node colors and styles
  let nodeColor = color;
  let strokeColor = entityStyle.shadowColor || '#344054';
  
  // Enhanced colors based on state
  if (isShip) {
    nodeColor = '#9b87f5';
    strokeColor = '#6b46c1';
  } else if (isBooster) {
    nodeColor = '#F97316';
    strokeColor = '#c2410c';
  }
  
  if (isHighlighted || hover) {
    nodeColor = isShip ? '#8b5cf6' : isBooster ? '#fb923c' : '#818cf8';
    strokeColor = isShip ? '#6d28d9' : isBooster ? '#ea580c' : '#4f46e5';
  }
  
  // Icon/symbol based on entity type
  const getEntityIcon = () => {
    switch(entityType) {
      case EntityType.TASK:
        return '⚙️';
      case EntityType.VEHICLE:
        return isShip ? '🚀' : isBooster ? '🔥' : '🛸';
      case EntityType.LOCATION:
        return '📍';
      case EntityType.RESOURCE:
        return '📦';
      default:
        return '✦';
    }
  };
  
  return (
    <div className="process-node-wrapper flex justify-center items-center"
         style={{ width: nodeSize, height: nodeSize }}>
      {/* Animated handles with pulse effect */}
      <motion.div 
        initial={{ opacity: 0.7 }}
        animate={{ opacity: isHighlighted ? [0.7, 1, 0.7] : 0.7 }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Handle
          type="target"
          position={Position.Top}
          className={`w-3 h-2 border-0 rounded-sm transition-all duration-300 ${isHighlighted || hover ? 'bg-indigo-400' : 'bg-gray-400'}`}
          style={{ 
            boxShadow: (isHighlighted || hover) ? '0 0 8px rgba(99, 102, 241, 0.6)' : 'none'
          }}
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0.7 }}
        animate={{ opacity: isHighlighted ? [0.7, 1, 0.7] : 0.7 }}
        transition={{ repeat: Infinity, duration: 2, delay: 1 }}
      >
        <Handle
          type="source"
          position={Position.Bottom}
          className={`w-3 h-2 border-0 rounded-sm transition-all duration-300 ${isHighlighted || hover ? 'bg-indigo-400' : 'bg-gray-400'}`}
          style={{ 
            boxShadow: (isHighlighted || hover) ? '0 0 8px rgba(99, 102, 241, 0.6)' : 'none'
          }}
        />
      </motion.div>
      
      {/* Main node container */}
      <motion.div 
        ref={particleRef}
        className={`relative flex items-center justify-center transition-all duration-300 cursor-pointer ${selected ? 'ring-2 ring-offset-2 ring-indigo-600' : ''}`}
        style={{ width: nodeSize, height: nodeSize }}
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* SVG shape with advanced gradients and 3D effects */}
        <svg width={nodeSize} height={nodeSize} className="absolute top-0 left-0">
          <defs>
            <linearGradient id={nodeShape.gradient.id} x1="0%" y1="0%" x2="0%" y2="100%">
              {nodeShape.gradient.stops.map((stop, i) => (
                <stop key={i} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
            
            {/* 3D effect with inner shadow */}
            <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
              <feOffset in="blur" dx="2" dy="2" result="offsetBlur" />
              <feComposite in="SourceAlpha" in2="offsetBlur" operator="out" result="innerShadow" />
              <feFlood floodColor="rgba(0,0,0,0.3)" floodOpacity="1" result="color" />
              <feComposite in="color" in2="innerShadow" operator="in" result="shadow" />
              <feComposite in="shadow" in2="SourceAlpha" operator="in" result="finalShadow" />
              <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="finalShadow" />
              </feMerge>
            </filter>
            
            {/* Glowing effect for highlighted nodes */}
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feFlood 
                floodColor={isShip ? "#c4b5fd" : isBooster ? "#fed7aa" : "#bfdbfe"} 
                floodOpacity="0.7" 
                result="glowColor" 
              />
              <feComposite in="glowColor" in2="blur" operator="in" result="softGlow" />
              <feMerge>
                <feMergeNode in="softGlow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Background shape with 3D and highlight effects */}
          <path
            d={nodeShape.path}
            fill={`url(#${nodeShape.gradient.id})`}
            stroke={strokeColor}
            strokeWidth={selected || isHighlighted ? 3 : 2}
            filter={(isHighlighted || hover) ? "url(#glow)" : "url(#innerShadow)"}
          />
          
          {/* Texture overlay for more depth */}
          <path
            d={nodeShape.path}
            fill="url(#pattern-dots)"
            fillOpacity="0.1"
            stroke="none"
          />
          
          {/* Optional pattern definition */}
          <pattern id="pattern-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.3)" />
          </pattern>
        </svg>
        
        {/* Entity content with improved styling */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-1 ${isShip || isBooster ? 'text-white' : 'text-gray-800'}`}>
          {/* Icon container */}
          <div className="mb-1 opacity-90 text-lg">
            {getEntityIcon()}
          </div>
          
          {/* Entity name with better typography */}
          <motion.div 
            className="text-xs font-semibold leading-tight text-center"
            style={{ 
              fontSize: Math.max(9, Math.min(13, 11 * scaleFactor)),
              textShadow: (isHighlighted || hover) ? '0px 0px 3px rgba(255,255,255,0.5)' : 'none'
            }}
            animate={{ scale: isHighlighted ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 2, repeat: isHighlighted ? Infinity : 0 }}
          >
            {entity.name}
          </motion.div>
          
          {/* Entity type tag */}
          {showLabel && (
            <motion.div 
              className="text-[8px] mt-1 px-1.5 py-0.5 rounded"
              style={{
                background: 'rgba(0,0,0,0.2)',
                backdropFilter: 'blur(4px)',
                boxShadow: 'inset 0 0 2px rgba(255,255,255,0.3)'
              }}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: [0.7, 0.9, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {entityType}
            </motion.div>
          )}
        </div>
        
        {/* Enhanced particle effects */}
        <AnimatePresence>
          {(isHighlighted || hover) && particles.length > 0 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map(particle => (
                <motion.div
                  key={particle.id}
                  className="absolute rounded-full"
                  style={{
                    left: particle.x,
                    top: particle.y,
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: particle.color,
                    boxShadow: `0 0 ${particle.size}px ${particle.color}`,
                    opacity: particle.opacity,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: particle.opacity, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
        
        {/* Improved completion time indicator */}
        {completionTime && (
          <motion.div 
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-2.5 py-0.5 rounded-full whitespace-nowrap"
            style={{ 
              fontSize: '0.65rem',
              background: 'rgba(17, 24, 39, 0.8)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {completionTime}
          </motion.div>
        )}
        
        {/* Improved frequency indicator with animation */}
        {entity.metrics?.frequency && entity.metrics.frequency > 1 && (
          <motion.div 
            className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              boxShadow: '0 0 8px rgba(79, 70, 229, 0.5)'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
            whileHover={{ scale: 1.2 }}
          >
            {entity.metrics.frequency}
          </motion.div>
        )}
        
        {/* New feature: importance indicator */}
        {entity.metrics?.importance && entity.metrics.importance > 2 && (
          <motion.div 
            className="absolute -top-1 -left-1 text-yellow-400 text-[10px] w-5 h-5 flex items-center justify-center"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            ★
          </motion.div>
        )}
      </motion.div>
    </div>
  );
});

export default ProcessNode;
