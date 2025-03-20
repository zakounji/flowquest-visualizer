
// // import React, { useState, useEffect, useRef, memo } from 'react';
// // import { Handle, Position } from '@xyflow/react';
// // import { EntityType, Entity } from '@/types/processTypes';
// // import { enhancedEntityStyles, getNodeShape } from '@/utils/visualizationHelpers';

// // interface ProcessNodeProps {
// //   data: {
// //     entity: Entity;
// //     color: string;
// //     isHighlighted: boolean;
// //     showLabel: boolean;
// //     onClick: () => void;
// //     animationStep: number;
// //     isAnimating: boolean;
// //   };
// //   selected: boolean;
// // }

// // const ProcessNode = memo(({ data, selected }: ProcessNodeProps) => {
// //   const { entity, color, isHighlighted, showLabel, onClick, animationStep, isAnimating } = data;
// //   const entityType = entity.type as string;
// //   const entityStyle = enhancedEntityStyles[entityType] || enhancedEntityStyles[EntityType.TASK];
// //   const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);
// //   const particleRef = useRef<HTMLDivElement>(null);
// //   const frameRef = useRef<number>(0);
// //   const [completionTime, setCompletionTime] = useState<string | null>(null);
  
// //   const isShip = 
// //     entityType === EntityType.VEHICLE && (
// //       entity.properties?.role === 'ship' || 
// //       entity.name.toLowerCase().includes('s') && 
// //       !entity.name.toLowerCase().includes('booster')
// //     );
  
// //   const isBooster = 
// //     entityType === EntityType.VEHICLE && (
// //       entity.properties?.role === 'booster' || 
// //       entity.name.toLowerCase().includes('b') && 
// //       !entity.name.toLowerCase().includes('starship')
// //     );
  
// //   // Calculate node dimensions based on frequency or importance
// //   const baseSize = 80;
// //   const frequency = entity.metrics?.frequency || 1;
// //   const scaleFactor = Math.min(Math.max(1, Math.log2(frequency + 1) * 0.3 + 1), 1.8);
// //   const nodeSize = baseSize * scaleFactor;

// //   // Define special shapes for ships and boosters
// //   const getVehicleShape = () => {
// //     if (isShip) {
// //       return `M${nodeSize/2},0 
// //               L${nodeSize*0.8},${nodeSize*0.2} 
// //               L${nodeSize*0.8},${nodeSize*0.8} 
// //               L${nodeSize/2},${nodeSize} 
// //               L${nodeSize*0.2},${nodeSize*0.8} 
// //               L${nodeSize*0.2},${nodeSize*0.2} Z`;
// //     }
// //     if (isBooster) {
// //       return `M${nodeSize/2},0 
// //               L${nodeSize*0.8},${nodeSize*0.3} 
// //               L${nodeSize*0.7},${nodeSize*0.9} 
// //               L${nodeSize*0.3},${nodeSize*0.9} 
// //               L${nodeSize*0.2},${nodeSize*0.3} Z`;
// //     }
    
// //     return getNodeShape(entity, nodeSize);
// //   };

// //   // Get shape path and style based on entity type
// //   const nodePath = entityType === EntityType.VEHICLE && (isShip || isBooster) 
// //     ? getVehicleShape() 
// //     : getNodeShape(entity, nodeSize);
  
// //   // Generate completion time display
// //   useEffect(() => {
// //     if (entity.metrics?.duration && entity.metrics?.durationUnit) {
// //       setCompletionTime(`${entity.metrics.duration} ${entity.metrics.durationUnit}`);
// //     } else if (entity.properties?.duration) {
// //       setCompletionTime(entity.properties.duration as string);
// //     } else {
// //       setCompletionTime(null);
// //     }
// //   }, [entity]);

// //   // Particle animation effect for highlighted nodes
// //   useEffect(() => {
// //     if (isHighlighted && particleRef.current) {
// //       // Generate particles
// //       const generateParticles = () => {
// //         const newParticles = [];
// //         const count = isAnimating ? 15 : 5;
        
// //         for (let i = 0; i < count; i++) {
// //           newParticles.push({
// //             id: Math.random(),
// //             x: Math.random() * nodeSize,
// //             y: Math.random() * nodeSize,
// //             size: Math.random() * 4 + 2,
// //             speed: Math.random() * 1 + 0.5,
// //             opacity: Math.random() * 0.7 + 0.3
// //           });
// //         }
        
// //         setParticles(newParticles);
// //       };
      
// //       // Animation frames
// //       const animate = () => {
// //         setParticles(prev => 
// //           prev.map(p => ({
// //             ...p,
// //             y: p.y - p.speed,
// //             opacity: p.y < nodeSize * 0.2 ? p.opacity * 0.95 : p.opacity
// //           })).filter(p => p.opacity > 0.05)
// //         );
        
// //         frameRef.current = requestAnimationFrame(animate);
// //       };
      
// //       // Initialize particles
// //       generateParticles();
// //       frameRef.current = requestAnimationFrame(animate);
      
// //       // Regenerate particles periodically
// //       const interval = setInterval(generateParticles, 1000);
      
// //       return () => {
// //         cancelAnimationFrame(frameRef.current);
// //         clearInterval(interval);
// //       };
// //     }
// //   }, [isHighlighted, isAnimating, nodeSize]);

// //   // Set node colors and styles
// //   let nodeColor = color;
// //   let strokeColor = entityStyle.shadowColor || '#344054';
  
// //   // Special colors for ships and boosters
// //   if (isShip) {
// //     nodeColor = '#9b87f5'; // Purple for ships
// //     strokeColor = '#6b46c1';
// //   } else if (isBooster) {
// //     nodeColor = '#F97316'; // Orange for boosters
// //     strokeColor = '#c2410c';
// //   }
  
// //   // Apply highlighting
// //   if (isHighlighted) {
// //     nodeColor = isShip ? '#8b5cf6' : isBooster ? '#fb923c' : '#818cf8';
// //     strokeColor = isShip ? '#6d28d9' : isBooster ? '#ea580c' : '#4f46e5';
// //   }
  
// //   return (
// //     <div className="process-node-wrapper flex justify-center items-center"
// //          style={{ width: nodeSize, height: nodeSize }}>
// //       {/* Handles for connecting to other nodes */}
// //       <Handle
// //         type="target"
// //         position={Position.Top}
// //         className={`w-3 h-1.5 bg-gray-400 border-0 rounded-sm ${isHighlighted ? 'bg-indigo-400' : ''}`}
// //       />
// //       <Handle
// //         type="source"
// //         position={Position.Bottom}
// //         className={`w-3 h-1.5 bg-gray-400 border-0 rounded-sm ${isHighlighted ? 'bg-indigo-400' : ''}`}
// //       />
      
// //       {/* Node container with SVG shape */}
// //       <div 
// //         ref={particleRef}
// //         className={`relative flex items-center justify-center transition-all ${selected ? 'ring-2 ring-offset-2 ring-indigo-600' : ''}`}
// //         style={{ width: nodeSize, height: nodeSize }}
// //         onClick={onClick}
// //       >
// //         {/* SVG shape for the node */}
// //         <svg width={nodeSize} height={nodeSize} className="absolute top-0 left-0">
// //           <path
// //             d={nodePath}
// //             fill={nodeColor}
// //             stroke={strokeColor}
// //             strokeWidth={selected || isHighlighted ? 3 : 2}
// //             filter={`drop-shadow(0px 4px 6px rgba(0,0,0,0.2))`}
// //           />
// //         </svg>
        
// //         {/* Entity name label */}
// //         <div className={`absolute inset-0 flex flex-col items-center justify-center p-1 ${isShip || isBooster ? 'text-white' : 'text-gray-800'}`}>
// //           <div className="text-xs font-semibold leading-tight text-center" style={{ fontSize: Math.max(8, Math.min(12, 10 * scaleFactor)) }}>
// //             {entity.name}
// //           </div>
          
// //           {/* Entity type tag */}
// //           {showLabel && (
// //             <div className="text-[8px] opacity-80 mt-1 px-1 rounded bg-black/20">
// //               {entityType}
// //             </div>
// //           )}
// //         </div>
        
// //         {/* Particle effects for highlighted nodes */}
// //         {isHighlighted && particles.length > 0 && (
// //           <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '50%' }}>
// //             {particles.map(particle => (
// //               <div
// //                 key={particle.id}
// //                 className="absolute rounded-full"
// //                 style={{
// //                   left: particle.x,
// //                   top: particle.y,
// //                   width: particle.size,
// //                   height: particle.size,
// //                   backgroundColor: isShip ? '#c4b5fd' : isBooster ? '#fed7aa' : '#bfdbfe',
// //                   opacity: particle.opacity,
// //                 }}
// //               />
// //             ))}
// //           </div>
// //         )}
        
// //         {/* Completion time indicator */}
// //         {completionTime && (
// //           <div 
// //             className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
// //             style={{ fontSize: '0.65rem' }}
// //           >
// //             {completionTime}
// //           </div>
// //         )}
        
// //         {/* Frequency indicator */}
// //         {entity.metrics?.frequency && entity.metrics.frequency > 1 && (
// //           <div 
// //             className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center"
// //           >
// //             {entity.metrics.frequency}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // });

// // export default ProcessNode;





// import React, { useState, useEffect, useRef, memo } from 'react';
// import { Handle, Position } from '@xyflow/react';
// import { EntityType, Entity } from '@/types/processTypes';
// import { enhancedEntityStyles, getNodeShape } from '@/utils/visualizationHelpers';
// import { motion, AnimatePresence } from 'framer-motion';

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
//   const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number; color: string }>>([]);
//   const particleRef = useRef<HTMLDivElement>(null);
//   const frameRef = useRef<number>(0);
//   const [completionTime, setCompletionTime] = useState<string | null>(null);
//   const [hover, setHover] = useState(false);
  
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
//   const baseSize = 90;
//   const frequency = entity.metrics?.frequency || 1;
//   const importance = entity.metrics?.importance || 1;
//   const scaleFactor = Math.min(Math.max(1, Math.log2(frequency + importance + 1) * 0.35 + 1), 2.0);
//   const nodeSize = baseSize * scaleFactor;

//   // Define special 3D shapes with gradients
//   const getVehicleShape = () => {
//     if (isShip) {
//       return {
//         path: `M${nodeSize/2},0 
//                 L${nodeSize*0.85},${nodeSize*0.25} 
//                 L${nodeSize*0.85},${nodeSize*0.8} 
//                 L${nodeSize/2},${nodeSize*1.05} 
//                 L${nodeSize*0.15},${nodeSize*0.8} 
//                 L${nodeSize*0.15},${nodeSize*0.25} Z`,
//         gradient: {
//           id: "shipGradient",
//           stops: [
//             { offset: "0%", color: "#a78bfa" },
//             { offset: "60%", color: "#8b5cf6" },
//             { offset: "100%", color: "#7c3aed" }
//           ]
//         }
//       };
//     }
//     if (isBooster) {
//       return {
//         path: `M${nodeSize/2},0 
//                 L${nodeSize*0.85},${nodeSize*0.3} 
//                 L${nodeSize*0.75},${nodeSize*0.95} 
//                 L${nodeSize*0.25},${nodeSize*0.95} 
//                 L${nodeSize*0.15},${nodeSize*0.3} Z`,
//         gradient: {
//           id: "boosterGradient",
//           stops: [
//             { offset: "0%", color: "#fdba74" },
//             { offset: "60%", color: "#f97316" },
//             { offset: "100%", color: "#ea580c" }
//           ]
//         }
//       };
//     }
    
//     const defaultShape = getNodeShape(entity, nodeSize);
//     return {
//       path: defaultShape,
//       gradient: {
//         id: "defaultGradient",
//         stops: [
//           { offset: "0%", color: colorLighten(color, 20) },
//           { offset: "70%", color: color },
//           { offset: "100%", color: colorDarken(color, 20) }
//         ]
//       }
//     };
//   };
  
//   // Helper functions for color manipulation
//   const colorLighten = (color: string, percent: number): string => {
//     // Simple implementation - in production use a proper color library
//     return color; // Placeholder
//   };
  
//   const colorDarken = (color: string, percent: number): string => {
//     // Simple implementation - in production use a proper color library
//     return color; // Placeholder
//   };

//   // Get shape path and gradient
//   const nodeShape = entityType === EntityType.VEHICLE && (isShip || isBooster) 
//     ? getVehicleShape() 
//     : {
//         path: getNodeShape(entity, nodeSize),
//         gradient: {
//           id: `gradient-${entity.id}`,
//           stops: [
//             { offset: "0%", color: colorLighten(color, 20) },
//             { offset: "70%", color: color },
//             { offset: "100%", color: colorDarken(color, 20) }
//           ]
//         }
//       };
  
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

//   // Advanced particle animation effect
//   useEffect(() => {
//     if ((isHighlighted || hover) && particleRef.current) {
//       // Generate particles with more variety
//       const generateParticles = () => {
//         const newParticles = [];
//         const count = isAnimating ? 20 : hover ? 10 : 5;
//         const particleColors = isShip 
//           ? ['#c4b5fd', '#a78bfa', '#8b5cf6'] 
//           : isBooster 
//             ? ['#fed7aa', '#fdba74', '#fb923c'] 
//             : ['#bfdbfe', '#93c5fd', '#60a5fa'];
            
//         for (let i = 0; i < count; i++) {
//           newParticles.push({
//             id: Math.random(),
//             x: Math.random() * nodeSize,
//             y: Math.random() * nodeSize,
//             size: Math.random() * 5 + 2,
//             speed: Math.random() * 1.5 + 0.5,
//             opacity: Math.random() * 0.7 + 0.3,
//             color: particleColors[Math.floor(Math.random() * particleColors.length)]
//           });
//         }
        
//         setParticles(newParticles);
//       };
      
//       // Enhanced animation with spiral movement
//       const animate = () => {
//         setParticles(prev => 
//           prev.map(p => {
//             const angle = p.y / 40;
//             const xOffset = Math.sin(angle) * 1.5;
            
//             return {
//               ...p,
//               x: p.x + xOffset,
//               y: p.y - p.speed,
//               opacity: p.y < nodeSize * 0.2 ? p.opacity * 0.93 : p.opacity
//             };
//           }).filter(p => p.opacity > 0.05)
//         );
        
//         frameRef.current = requestAnimationFrame(animate);
//       };
      
//       generateParticles();
//       frameRef.current = requestAnimationFrame(animate);
      
//       const interval = setInterval(generateParticles, 800);
      
//       return () => {
//         cancelAnimationFrame(frameRef.current);
//         clearInterval(interval);
//       };
//     }
//   }, [isHighlighted, isAnimating, nodeSize, hover]);

//   // Set node colors and styles
//   let nodeColor = color;
//   let strokeColor = entityStyle.shadowColor || '#344054';
  
//   // Enhanced colors based on state
//   if (isShip) {
//     nodeColor = '#9b87f5';
//     strokeColor = '#6b46c1';
//   } else if (isBooster) {
//     nodeColor = '#F97316';
//     strokeColor = '#c2410c';
//   }
  
//   if (isHighlighted || hover) {
//     nodeColor = isShip ? '#8b5cf6' : isBooster ? '#fb923c' : '#818cf8';
//     strokeColor = isShip ? '#6d28d9' : isBooster ? '#ea580c' : '#4f46e5';
//   }
  
//   // Icon/symbol based on entity type
//   const getEntityIcon = () => {
//     switch(entityType) {
//       case EntityType.TASK:
//         return '⚙️';
//       case EntityType.VEHICLE:
//         return isShip ? '🚀' : isBooster ? '🔥' : '🛸';
//       case EntityType.LOCATION:
//         return '📍';
//       case EntityType.RESOURCE:
//         return '📦';
//       default:
//         return '✦';
//     }
//   };
  
//   return (
//     <div className="process-node-wrapper flex justify-center items-center"
//          style={{ width: nodeSize, height: nodeSize }}>
//       {/* Animated handles with pulse effect */}
//       <motion.div 
//         initial={{ opacity: 0.7 }}
//         animate={{ opacity: isHighlighted ? [0.7, 1, 0.7] : 0.7 }}
//         transition={{ repeat: Infinity, duration: 2 }}
//       >
//         <Handle
//           type="target"
//           position={Position.Top}
//           className={`w-3 h-2 border-0 rounded-sm transition-all duration-300 ${isHighlighted || hover ? 'bg-indigo-400' : 'bg-gray-400'}`}
//           style={{ 
//             boxShadow: (isHighlighted || hover) ? '0 0 8px rgba(99, 102, 241, 0.6)' : 'none'
//           }}
//         />
//       </motion.div>
      
//       <motion.div 
//         initial={{ opacity: 0.7 }}
//         animate={{ opacity: isHighlighted ? [0.7, 1, 0.7] : 0.7 }}
//         transition={{ repeat: Infinity, duration: 2, delay: 1 }}
//       >
//         <Handle
//           type="source"
//           position={Position.Bottom}
//           className={`w-3 h-2 border-0 rounded-sm transition-all duration-300 ${isHighlighted || hover ? 'bg-indigo-400' : 'bg-gray-400'}`}
//           style={{ 
//             boxShadow: (isHighlighted || hover) ? '0 0 8px rgba(99, 102, 241, 0.6)' : 'none'
//           }}
//         />
//       </motion.div>
      
//       {/* Main node container */}
//       <motion.div 
//         ref={particleRef}
//         className={`relative flex items-center justify-center transition-all duration-300 cursor-pointer ${selected ? 'ring-2 ring-offset-2 ring-indigo-600' : ''}`}
//         style={{ width: nodeSize, height: nodeSize }}
//         onClick={onClick}
//         onMouseEnter={() => setHover(true)}
//         onMouseLeave={() => setHover(false)}
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.98 }}
//       >
//         {/* SVG shape with advanced gradients and 3D effects */}
//         <svg width={nodeSize} height={nodeSize} className="absolute top-0 left-0">
//           <defs>
//             <linearGradient id={nodeShape.gradient.id} x1="0%" y1="0%" x2="0%" y2="100%">
//               {nodeShape.gradient.stops.map((stop, i) => (
//                 <stop key={i} offset={stop.offset} stopColor={stop.color} />
//               ))}
//             </linearGradient>
            
//             {/* 3D effect with inner shadow */}
//             <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
//               <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
//               <feOffset in="blur" dx="2" dy="2" result="offsetBlur" />
//               <feComposite in="SourceAlpha" in2="offsetBlur" operator="out" result="innerShadow" />
//               <feFlood floodColor="rgba(0,0,0,0.3)" floodOpacity="1" result="color" />
//               <feComposite in="color" in2="innerShadow" operator="in" result="shadow" />
//               <feComposite in="shadow" in2="SourceAlpha" operator="in" result="finalShadow" />
//               <feMerge>
//                 <feMergeNode in="SourceGraphic" />
//                 <feMergeNode in="finalShadow" />
//               </feMerge>
//             </filter>
            
//             {/* Glowing effect for highlighted nodes */}
//             <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
//               <feGaussianBlur stdDeviation="5" result="blur" />
//               <feFlood 
//                 floodColor={isShip ? "#c4b5fd" : isBooster ? "#fed7aa" : "#bfdbfe"} 
//                 floodOpacity="0.7" 
//                 result="glowColor" 
//               />
//               <feComposite in="glowColor" in2="blur" operator="in" result="softGlow" />
//               <feMerge>
//                 <feMergeNode in="softGlow" />
//                 <feMergeNode in="SourceGraphic" />
//               </feMerge>
//             </filter>
//           </defs>
          
//           {/* Background shape with 3D and highlight effects */}
//           <path
//             d={nodeShape.path}
//             fill={`url(#${nodeShape.gradient.id})`}
//             stroke={strokeColor}
//             strokeWidth={selected || isHighlighted ? 3 : 2}
//             filter={(isHighlighted || hover) ? "url(#glow)" : "url(#innerShadow)"}
//           />
          
//           {/* Texture overlay for more depth */}
//           <path
//             d={nodeShape.path}
//             fill="url(#pattern-dots)"
//             fillOpacity="0.1"
//             stroke="none"
//           />
          
//           {/* Optional pattern definition */}
//           <pattern id="pattern-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
//             <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.3)" />
//           </pattern>
//         </svg>
        
//         {/* Entity content with improved styling */}
//         <div className={`absolute inset-0 flex flex-col items-center justify-center p-1 ${isShip || isBooster ? 'text-white' : 'text-gray-800'}`}>
//           {/* Icon container */}
//           <div className="mb-1 opacity-90 text-lg">
//             {getEntityIcon()}
//           </div>
          
//           {/* Entity name with better typography */}
//           <motion.div 
//             className="text-xs font-semibold leading-tight text-center"
//             style={{ 
//               fontSize: Math.max(9, Math.min(13, 11 * scaleFactor)),
//               textShadow: (isHighlighted || hover) ? '0px 0px 3px rgba(255,255,255,0.5)' : 'none'
//             }}
//             animate={{ scale: isHighlighted ? [1, 1.05, 1] : 1 }}
//             transition={{ duration: 2, repeat: isHighlighted ? Infinity : 0 }}
//           >
//             {entity.name}
//           </motion.div>
          
//           {/* Entity type tag */}
//           {showLabel && (
//             <motion.div 
//               className="text-[8px] mt-1 px-1.5 py-0.5 rounded"
//               style={{
//                 background: 'rgba(0,0,0,0.2)',
//                 backdropFilter: 'blur(4px)',
//                 boxShadow: 'inset 0 0 2px rgba(255,255,255,0.3)'
//               }}
//               initial={{ opacity: 0.7 }}
//               animate={{ opacity: [0.7, 0.9, 0.7] }}
//               transition={{ duration: 3, repeat: Infinity }}
//             >
//               {entityType}
//             </motion.div>
//           )}
//         </div>
        
//         {/* Enhanced particle effects */}
//         <AnimatePresence>
//           {(isHighlighted || hover) && particles.length > 0 && (
//             <div className="absolute inset-0 overflow-hidden pointer-events-none">
//               {particles.map(particle => (
//                 <motion.div
//                   key={particle.id}
//                   className="absolute rounded-full"
//                   style={{
//                     left: particle.x,
//                     top: particle.y,
//                     width: particle.size,
//                     height: particle.size,
//                     backgroundColor: particle.color,
//                     boxShadow: `0 0 ${particle.size}px ${particle.color}`,
//                     opacity: particle.opacity,
//                   }}
//                   initial={{ opacity: 0, scale: 0 }}
//                   animate={{ opacity: particle.opacity, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0 }}
//                 />
//               ))}
//             </div>
//           )}
//         </AnimatePresence>
        
//         {/* Improved completion time indicator */}
//         {completionTime && (
//           <motion.div 
//             className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-2.5 py-0.5 rounded-full whitespace-nowrap"
//             style={{ 
//               fontSize: '0.65rem',
//               background: 'rgba(17, 24, 39, 0.8)',
//               backdropFilter: 'blur(4px)',
//               border: '1px solid rgba(255,255,255,0.1)',
//               color: 'white',
//               boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
//             }}
//             initial={{ y: 5, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.2 }}
//           >
//             {completionTime}
//           </motion.div>
//         )}
        
//         {/* Improved frequency indicator with animation */}
//         {entity.metrics?.frequency && entity.metrics.frequency > 1 && (
//           <motion.div 
//             className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center"
//             style={{
//               boxShadow: '0 0 8px rgba(79, 70, 229, 0.5)'
//             }}
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ type: "spring", stiffness: 500 }}
//             whileHover={{ scale: 1.2 }}
//           >
//             {entity.metrics.frequency}
//           </motion.div>
//         )}
        
//         {/* New feature: importance indicator */}
//         {entity.metrics?.importance && entity.metrics.importance > 2 && (
//           <motion.div 
//             className="absolute -top-1 -left-1 text-yellow-400 text-[10px] w-5 h-5 flex items-center justify-center"
//             initial={{ rotate: 0 }}
//             animate={{ rotate: 360 }}
//             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//           >
//             ★
//           </motion.div>
//         )}
//       </motion.div>
//     </div>
//   );
// });

// export default ProcessNode;



























import { memo, useRef, useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import * as d3 from 'd3';
import { Entity, EntityType } from '@/types/processTypes';

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
}

const ProcessNode = memo(({ data }: ProcessNodeProps) => {
  const { entity, color, isHighlighted, showLabel, onClick, animationStep, isAnimating } = data;
  const nodeSize = 60;
  const svgRef = useRef<SVGSVGElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Determine if this is a ship or booster based on properties or custom metadata
  const isShip = entity.properties?.role === 'ship' || 
                 entity.properties?.category === 'ship' ||
                 entity.name.toLowerCase().includes('ship') || 
                 entity.name.toLowerCase().includes('starship');
                 
  const isBooster = entity.properties?.role === 'booster' || 
                    entity.properties?.category === 'booster' ||
                    entity.name.toLowerCase().includes('booster') || 
                    entity.name.toLowerCase().includes('super heavy');

  // Enhanced colors for ships and boosters
  const shipColor = '#9b87f5'; // Purple for ships
  const boosterColor = '#F97316'; // Orange for boosters
  const entityColor = isShip ? shipColor : isBooster ? boosterColor : color;

  // Use D3 to render the node shape based on entity type
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content
    
    // Create the base group for the node
    const nodeGroup = svg.append("g");
    
    // Draw different shapes based on entity type
    switch (entity.type) {
      case EntityType.ACTOR:
        // Human figure
        const actorGroup = nodeGroup.append("g")
          .attr("transform", `translate(${nodeSize/2}, ${nodeSize/2})`);
          
        // Head
        actorGroup.append("circle")
          .attr("cx", 0)
          .attr("cy", -15)
          .attr("r", 10)
          .attr("fill", "white")
          .attr("stroke", entityColor)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        // Body
        actorGroup.append("line")
          .attr("x1", 0)
          .attr("y1", -5)
          .attr("x2", 0)
          .attr("y2", 15)
          .attr("stroke", entityColor)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        // Arms
        actorGroup.append("line")
          .attr("x1", -12)
          .attr("y1", 0)
          .attr("x2", 12)
          .attr("y2", 0)
          .attr("stroke", entityColor)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        // Legs
        actorGroup.append("line")
          .attr("x1", 0)
          .attr("y1", 15)
          .attr("x2", -10)
          .attr("y2", 25)
          .attr("stroke", entityColor)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        actorGroup.append("line")
          .attr("x1", 0)
          .attr("y1", 15)
          .attr("x2", 10)
          .attr("y2", 25)
          .attr("stroke", entityColor)
          .attr("stroke-width", isHighlighted ? 2 : 1);
        break;
        
      case EntityType.SYSTEM:
        // Server/computer symbol
        nodeGroup.append("rect")
          .attr("x", 10)
          .attr("y", 10)
          .attr("width", nodeSize - 20)
          .attr("height", nodeSize - 20)
          .attr("rx", 3)
          .attr("ry", 3)
          .attr("fill", "white")
          .attr("stroke", entityColor)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        // Server lines
        for (let i = 1; i < 4; i++) {
          nodeGroup.append("line")
            .attr("x1", 15)
            .attr("y1", 10 + i * 10)
            .attr("x2", nodeSize - 15)
            .attr("y2", 10 + i * 10)
            .attr("stroke", entityColor)
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", 1);
        }
        
        // Server lights
        nodeGroup.append("circle")
          .attr("cx", nodeSize - 17)
          .attr("cy", 17)
          .attr("r", 3)
          .attr("fill", isAnimating ? "#10b981" : "#d1d5db");
        break;
        
      case EntityType.EVENT:
        // Hexagon shape for event
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          const angleDeg = 60 * i - 30;
          const angleRad = (Math.PI / 180) * angleDeg;
          const x = nodeSize/2 + 22 * Math.cos(angleRad);
          const y = nodeSize/2 + 22 * Math.sin(angleRad);
          hexPoints.push([x, y]);
        }
        
        nodeGroup.append("polygon")
          .attr("points", hexPoints.map(p => p.join(",")).join(" "))
          .attr("fill", "white")
          .attr("stroke", entityColor)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        // Lightning bolt for event
        const boltPoints = [
          [nodeSize/2 - 5, nodeSize/2 - 12],
          [nodeSize/2 + 5, nodeSize/2 - 5],
          [nodeSize/2 - 2, nodeSize/2 - 2],
          [nodeSize/2 + 8, nodeSize/2 + 12],
          [nodeSize/2, nodeSize/2],
          [nodeSize/2 + 3, nodeSize/2 - 3],
          [nodeSize/2 - 8, nodeSize/2 - 10]
        ];
        
        nodeGroup.append("polygon")
          .attr("points", boltPoints.map(p => p.join(",")).join(" "))
          .attr("fill", entityColor)
          .attr("opacity", 0.8);
        break;
        
      case EntityType.RESOURCE:
        // Document/resource icon
        nodeGroup.append("path")
          .attr("d", `
            M15,10
            h30
            a5,5 0 0 1 5,5
            v30
            a5,5 0 0 1 -5,5
            h-30
            a5,5 0 0 1 -5,-5
            v-30
            a5,5 0 0 1 5,-5
            z
          `)
          .attr("fill", "white")
          .attr("stroke", entityColor)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        // Document lines
        for (let i = 1; i < 4; i++) {
          nodeGroup.append("line")
            .attr("x1", 18)
            .attr("y1", 18 + i * 7)
            .attr("x2", nodeSize - 18)
            .attr("y2", 18 + i * 7)
            .attr("stroke", entityColor)
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", 1);
        }
        
        // Corner fold
        nodeGroup.append("path")
          .attr("d", `
            M45,10
            v5
            h5
            z
          `)
          .attr("fill", entityColor)
          .attr("opacity", 0.5);
        break;

      case EntityType.VEHICLE:
        // ENHANCED: Different designs for ships vs boosters
        if (isShip) {
          // Starship design
          const shipGroup = nodeGroup.append("g")
            .attr("transform", `translate(${nodeSize/2}, ${nodeSize/2})`);
          
          // Ship body
          shipGroup.append("path")
            .attr("d", `
              M0,-25
              C8,-22 12,-18 12,0
              L8,18
              C4,22 -4,22 -8,18
              L-12,0
              C-12,-18 -8,-22 0,-25
              Z
            `)
            .attr("fill", "white")
            .attr("stroke", entityColor)
            .attr("stroke-width", isHighlighted ? 2 : 1);
          
          // Windows
          shipGroup.append("circle")
            .attr("cx", 0)
            .attr("cy", -10)
            .attr("r", 3)
            .attr("fill", entityColor)
            .attr("opacity", 0.7);
            
          shipGroup.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 2)
            .attr("fill", entityColor)
            .attr("opacity", 0.7);
          
          // Fins
          shipGroup.append("path")
            .attr("d", `
              M8,10
              L15,18
              L8,18
              Z
            `)
            .attr("fill", entityColor)
            .attr("opacity", 0.7);
            
          shipGroup.append("path")
            .attr("d", `
              M-8,10
              L-15,18
              L-8,18
              Z
            `)
            .attr("fill", entityColor)
            .attr("opacity", 0.7);
          
          // Flames when animating
          if (isAnimating) {
            const flameGroup = shipGroup.append("g")
              .attr("class", "ship-flames");
              
            flameGroup.append("path")
              .attr("d", `
                M-6,22
                Q0,35 6,22
                Z
              `)
              .attr("fill", "#ff6b6b")
              .attr("opacity", 0.9);
              
            flameGroup.append("path")
              .attr("d", `
                M-3,22
                Q0,30 3,22
                Z
              `)
              .attr("fill", "#ffc107")
              .attr("opacity", 0.9);
              
            // Animation style
            const style = document.createElement('style');
            style.textContent = `
              @keyframes flicker {
                0% { opacity: 0.7; transform: scaleY(0.8); }
                50% { opacity: 0.9; transform: scaleY(1.1); }
                100% { opacity: 0.7; transform: scaleY(0.8); }
              }
              .ship-flames {
                animation: flicker 0.5s infinite;
                transform-origin: center bottom;
              }
            `;
            document.head.appendChild(style);
          }
        } else {
          // Super Heavy Booster design
          const boosterGroup = nodeGroup.append("g")
            .attr("transform", `translate(${nodeSize/2}, ${nodeSize/2})`);
          
          // Booster body - wider and more cylindrical
          boosterGroup.append("path")
            .attr("d", `
              M-12,-25
              L-12,15
              C-12,20 12,20 12,15
              L12,-25
              C12,-28 -12,-28 -12,-25
              Z
            `)
            .attr("fill", "white")
            .attr("stroke", entityColor)
            .attr("stroke-width", isHighlighted ? 2 : 1);
          
          // Grid pattern
          for (let i = -20; i < 15; i += 7) {
            boosterGroup.append("line")
              .attr("x1", -11)
              .attr("y1", i)
              .attr("x2", 11)
              .attr("y2", i)
              .attr("stroke", entityColor)
              .attr("stroke-opacity", 0.3)
              .attr("stroke-width", 1);
          }
          
          // Engine details
          for (let i = -8; i <= 8; i += 8) {
            boosterGroup.append("circle")
              .attr("cx", i)
              .attr("cy", 18)
              .attr("r", 3)
              .attr("fill", entityColor)
              .attr("opacity", 0.5);
          }
          
          // Flames when animating
          if (isAnimating) {
            const flameGroup = boosterGroup.append("g")
              .attr("class", "booster-flames");
            
            // Multiple engine flames
            for (let i = -8; i <= 8; i += 8) {
              flameGroup.append("path")
                .attr("d", `
                  M${i-3},20
                  Q${i},30 ${i+3},20
                  Z
                `)
                .attr("fill", "#ff6b6b")
                .attr("opacity", 0.9);
                
              flameGroup.append("path")
                .attr("d", `
                  M${i-1.5},20
                  Q${i},25 ${i+1.5},20
                  Z
                `)
                .attr("fill", "#ffc107")
                .attr("opacity", 0.9);
            }
              
            // Animation style
            const style = document.createElement('style');
            style.textContent = `
              @keyframes boosterFlicker {
                0% { opacity: 0.7; transform: scaleY(0.8); }
                50% { opacity: 0.9; transform: scaleY(1.2); }
                100% { opacity: 0.7; transform: scaleY(0.8); }
              }
              .booster-flames {
                animation: boosterFlicker 0.4s infinite;
                transform-origin: center bottom;
              }
            `;
            document.head.appendChild(style);
          }
        }
        break;
          
      case EntityType.FACILITY:
        // Building shape for facilities
        nodeGroup.append("path")
          .attr("d", `
            M10,10
            h40
            v40
            h-40
            z
            M20,50
            v-15
            h7
            v15
            M33,50
            v-15
            h7
            v15
            M15,20
            h7
            v7
            h-7
            z
            M30,20
            h7
            v7
            h-7
            z
            M15,33
            h7
            v7
            h-7
            z
            M30,33
            h7
            v7
            h-7
            z
          `)
          .attr("fill", "white")
          .attr("stroke", entityColor)
          .attr("stroke-width", isHighlighted ? 2 : 1);
        break;
          
      case EntityType.COMPONENT:
        // Mechanical component shape
        const componentGroup = nodeGroup.append("g")
          .attr("transform", `translate(${nodeSize/2}, ${nodeSize/2})`);
          
        // Gear for mechanical component
        const gearTeeth = 10;
        const innerRadius = 12;
        const outerRadius = 20;
          
        const gearPath = [];
        for (let i = 0; i < gearTeeth; i++) {
          const angle1 = (Math.PI * 2 * i) / gearTeeth;
          const angle2 = (Math.PI * 2 * (i + 0.5)) / gearTeeth;
          const angle3 = (Math.PI * 2 * (i + 1)) / gearTeeth;
            
          const x1 = innerRadius * Math.cos(angle1);
          const y1 = innerRadius * Math.sin(angle1);
          const x2 = outerRadius * Math.cos(angle2);
          const y2 = outerRadius * Math.sin(angle2);
          const x3 = innerRadius * Math.cos(angle3);
          const y3 = innerRadius * Math.sin(angle3);
            
          if (i === 0) {
            gearPath.push(`M${x1},${y1}`);
          } else {
            gearPath.push(`L${x1},${y1}`);
          }
          gearPath.push(`L${x2},${y2}`);
          gearPath.push(`L${x3},${y3}`);
        }
        gearPath.push('Z');
          
        componentGroup.append("path")
          .attr("d", gearPath.join(' '))
          .attr("fill", "white")
          .attr("stroke", entityColor)
          .attr("stroke-width", isHighlighted ? 2 : 1);
            
        // Center hole
        componentGroup.append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 5)
          .attr("fill", entityColor)
          .attr("opacity", 0.8);
          
        if (isAnimating) {
          componentGroup.attr("transform-origin", "center")
            .style("animation", "spin 10s linear infinite");
            
          const style = document.createElement('style');
          style.textContent = `
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `;
          document.head.appendChild(style);
        }
        break;
          
      case EntityType.TEST:
        // Test tube/experiment shape
        const testGroup = nodeGroup.append("g");
        
        // Flask shape
        testGroup.append("path")
          .attr("d", `
            M25,12
            h10
            v3
            L45,40
            a5,5 0 0 1 -5,5
            h-20
            a5,5 0 0 1 -5,-5
            L25,15
            z
          `)
          .attr("fill", "white")
          .attr("stroke", entityColor)
          .attr("stroke-width", isHighlighted ? 2 : 1);
          
        // Liquid in flask
        testGroup.append("path")
          .attr("d", `
            M20,35
            L15,40
            a5,5 0 0 0 5,5
            h20
            a5,5 0 0 0 5,-5
            L40,35
            z
          `)
          .attr("fill", entityColor)
          .attr("opacity", 0.3);
          
        // Bubbles animation when active
        if (isAnimating) {
          const bubbles = [
            { x: 25, y: 38, r: 2 },
            { x: 30, y: 36, r: 1.5 },
            { x: 35, y: 39, r: 1 }
          ];
            
          bubbles.forEach((bubble, i) => {
            testGroup.append("circle")
              .attr("cx", bubble.x)
              .attr("cy", bubble.y)
              .attr("r", bubble.r)
              .attr("fill", "white")
              .attr("opacity", 0.7)
              .style("animation", `rise ${1 + i * 0.5}s infinite`);
          });
            
          const style = document.createElement('style');
          style.textContent = `
            @keyframes rise {
              0% { transform: translateY(0); opacity: 0.7; }
              100% { transform: translateY(-10px); opacity: 0; }
            }
          `;
          document.head.appendChild(style);
        }
        break;
          
      case EntityType.MILESTONE:
        // Flag/milestone marker
        const milestoneGroup = nodeGroup.append("g");
        
        // Base
        milestoneGroup.append("rect")
          .attr("x", 15)
          .attr("y", 35)
          .attr("width", 30)
          .attr("height", 10)
          .attr("rx", 2)
          .attr("fill", "white")
          .attr("stroke", entityColor)
          .attr("stroke-width", isHighlighted ? 2 : 1);
        
        // Pole
        milestoneGroup.append("rect")
          .attr("x", 27)
          .attr("y", 10)
          .attr("width", 6)
          .attr("height", 25)
          .attr("fill", "white")
          .attr("stroke", entityColor)
          .attr("stroke-width", isHighlighted ? 2 : 1);
        
        // Flag
        milestoneGroup.append("path")
          .attr("d", `
            M33,10
            L45,15
            L33,20
            Z
          `)
          .attr("fill", entityColor)
          .attr("opacity", 0.8);
          
        // Sparkle effect when highlighted
        if (isHighlighted) {
          const sparkles = [
            { x: 20, y: 25, r: 2 },
            { x: 40, y: 30, r: 2 },
            { x: 30, y: 15, r: 1.5 },
            { x: 45, y: 20, r: 1 }
          ];
            
          sparkles.forEach((sparkle, i) => {
            milestoneGroup.append("circle")
              .attr("cx", sparkle.x)
              .attr("cy", sparkle.y)
              .attr("r", sparkle.r)
              .attr("fill", "white")
              .attr("stroke", entityColor)
              .attr("stroke-width", 1)
              .style("animation", `sparkle ${1 + i * 0.3}s infinite alternate`);
          });
            
          const style = document.createElement('style');
          style.textContent = `
            @keyframes sparkle {
              0% { opacity: 0.2; transform: scale(0.8); }
              100% { opacity: 0.8; transform: scale(1.2); }
            }
          `;
          document.head.appendChild(style);
        }
        break;
        
      default: // TASK is the default
        // Rounded rectangle with gear icon
        nodeGroup.append("rect")
          .attr("x", 10)
          .attr("y", 10)
          .attr("width", nodeSize - 20)
          .attr("height", nodeSize - 20)
          .attr("rx", 5)
          .attr("fill", "white")
          .attr("stroke", entityColor)
          .attr("stroke-width", isHighlighted ? 2 : 1);
        
        // Gear/cog for task
        const gearGroup = nodeGroup.append("g")
          .attr("transform", `translate(${nodeSize/2}, ${nodeSize/2})`);
          
        const gearRadius = 12;
        const toothCount = 8;
        
        // Create gear teeth
        for (let i = 0; i < toothCount; i++) {
          const angle = (Math.PI * 2 * i) / toothCount;
          const x1 = gearRadius * Math.cos(angle);
          const y1 = gearRadius * Math.sin(angle);
          const x2 = (gearRadius + 4) * Math.cos(angle);
          const y2 = (gearRadius + 4) * Math.sin(angle);
          
          gearGroup.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", entityColor)
            .attr("stroke-width", 2)
            .attr("opacity", 0.8);
        }
        
        // Gear center
        gearGroup.append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 5)
          .attr("fill", entityColor)
          .attr("opacity", 0.8);
    }
    
    // Add frequency indicator if available
    if (entity.metrics && entity.metrics.frequency > 0) {
      nodeGroup.append("circle")
        .attr("cx", nodeSize - 8)
        .attr("cy", 8)
        .attr("r", 8)
        .attr("fill", "rgb(139, 92, 246)")
        .attr("stroke", "white")
        .attr("stroke-width", 1);
        
      nodeGroup.append("text")
        .attr("x", nodeSize - 8)
        .attr("y", 12)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "9px")
        .attr("font-weight", "bold")
        .text(entity.metrics.frequency);
    }
    
    // NEW: Add visual indicator for event timing if available
    if (entity.metrics && entity.metrics.duration) {
      // Create a small clock/timer indicator
      const timerGroup = nodeGroup.append("g")
        .attr("transform", `translate(${nodeSize - 8}, ${nodeSize - 8})`);
        
      // Background circle for timer
      timerGroup.append("circle")
        .attr("r", 8)
        .attr("fill", "#1E293B")
        .attr("stroke", "white")
        .attr("stroke-width", 1);
      
      // Clock hands
      timerGroup.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", -5)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5);
        
      timerGroup.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 4)
        .attr("y2", 1)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5);
        
      // Add the duration text in a tooltip that shows on hover
      if (isHovered) {
        nodeGroup.append("rect")
          .attr("x", nodeSize / 2 - 20)
          .attr("y", -25)
          .attr("width", 40)
          .attr("height", 20)
          .attr("rx", 5)
          .attr("fill", "rgba(0, 0, 0, 0.7)")
          .attr("class", "animate-fade-in");
          
        nodeGroup.append("text")
          .attr("x", nodeSize / 2)
          .attr("y", -12)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .attr("font-size", "10px")
          .attr("class", "animate-fade-in")
          .text(`${entity.metrics.duration} ${entity.metrics.durationUnit || 'days'}`);
      }
    }
    
    // Add pulse animation for highlighted nodes
    if (isHighlighted) {
      const pulseCircle = nodeGroup.append("circle")
        .attr("cx", nodeSize / 2)
        .attr("cy", nodeSize / 2)
        .attr("r", nodeSize / 2 - 5)
        .attr("fill", "none")
        .attr("stroke", entityColor)
        .attr("stroke-width", 2)
        .attr("opacity", 0.5)
        .attr("stroke-dasharray", "5,5");
        
      if (isAnimating) {
        pulseCircle.style("animation", "pulse 1.5s infinite");
        
        // Define the pulse animation if not already defined
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse {
            0% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.2; transform: scale(1.1); }
            100% { opacity: 0.5; transform: scale(1); }
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    // Enhanced hover effect
    if (isHovered) {
      nodeGroup.append("circle")
        .attr("cx", nodeSize / 2)
        .attr("cy", nodeSize / 2)
        .attr("r", nodeSize / 2 + 5)
        .attr("fill", "none")
        .attr("stroke", entityColor)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2")
        .attr("opacity", 0.7)
        .attr("class", "animate-fade-in");
    }
    
    // Make node clickable
    svg.on("click", onClick);
    
  }, [entity, entityColor, color, isHighlighted, animationStep, isAnimating, onClick, isHovered, isShip, isBooster]);

  return (
    <div 
      className={`relative w-[${nodeSize}px] h-[${nodeSize}px] transition-all duration-200 cursor-pointer ${isHighlighted ? 'shadow-lg' : ''}`}
      style={{ transform: isHighlighted ? 'scale(1.05)' : 'scale(1)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      
      <svg 
        ref={svgRef} 
        width={nodeSize} 
        height={nodeSize} 
        viewBox={`0 0 ${nodeSize} ${nodeSize}`}
        className="entity-node"
      />
      
      {showLabel && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium px-1 py-0.5 bg-white/80 rounded shadow-sm">
          {entity.name.length > 15 ? entity.name.substring(0, 12) + '...' : entity.name}
        </div>
      )}
    </div>
  );
});

export default ProcessNode;
