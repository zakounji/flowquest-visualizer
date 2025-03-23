
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Entity, Relationship } from '@/types/processTypes';
import { defaultEntityStyles } from '@/utils/visualizationHelpers';

interface EntityDetailViewProps {
  entity: Entity | null;
  relationships: Relationship[];
  entities: Entity[];
  isOpen: boolean;
  onClose: () => void;
}

const EntityDetailView = ({ entity, relationships, entities, isOpen, onClose }: EntityDetailViewProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!entity || !timelineRef.current || !isOpen) return;
    
    // Clear previous visualization
    d3.select(timelineRef.current).selectAll('*').remove();
    
    // Find relationships where this entity is involved
    const relatedRelationships = relationships.filter(
      r => r.source === entity.id || r.target === entity.id
    );
    
    if (relatedRelationships.length === 0) return;
    
    // Create timeline visualization
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = timelineRef.current.clientWidth - margin.left - margin.right;
    const height = 120 - margin.top - margin.bottom;
    
    const svg = d3.select(timelineRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create x scale (time)
    const x = d3.scaleLinear()
      .domain([0, relatedRelationships.length - 1])
      .range([0, width]);
    
    // Create axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(relatedRelationships.length).tickFormat(() => ''));
    
    // Add events to timeline
    svg.selectAll('.event')
      .data(relatedRelationships)
      .enter()
      .append('circle')
      .attr('class', 'event')
      .attr('cx', (d, i) => x(i))
      .attr('cy', height / 2)
      .attr('r', 8)
      .style('fill', (d) => {
        const relatedEntity = entities.find(e => 
          e.id === (d.source === entity.id ? d.target : d.source)
        );
        return relatedEntity ? defaultEntityStyles[relatedEntity.type]?.color || '#cccccc' : '#cccccc';
      })
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 10);
        
        const relatedEntity = entities.find(e => 
          e.id === (d.source === entity.id ? d.target : d.source)
        );
        
        const tooltip = d3.select(timelineRef.current)
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'white')
          .style('padding', '5px')
          .style('border-radius', '4px')
          .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
          .style('left', `${event.offsetX}px`)
          .style('top', `${event.offsetY - 40}px`);
        
        tooltip.html(`
          <div class="text-xs">
            <div>${d.type || 'Relationship'}: ${relatedEntity?.name || 'Unknown'}</div>
            <div>Frequency: ${d.metrics?.frequency || 0}</div>
          </div>
        `);
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 8);
        d3.select(timelineRef.current).selectAll('.tooltip').remove();
      });
    
    // Add connecting line
    svg.append('line')
      .style('stroke', '#ddd')
      .style('stroke-width', 2)
      .attr('x1', x(0))
      .attr('y1', height / 2)
      .attr('x2', x(relatedRelationships.length - 1))
      .attr('y2', height / 2);
      
  }, [entity, relationships, entities, isOpen]);

  if (!entity) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: defaultEntityStyles[entity.type]?.color || '#cccccc' }}
            />
            {entity.name}
          </SheetTitle>
          <SheetDescription>
            {entity.type.charAt(0) + entity.type.slice(1).toLowerCase()} Details
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium mb-2">Entity Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Type</div>
                <div>{entity.type}</div>
                <div className="text-muted-foreground">Frequency</div>
                <div>{entity.metrics?.frequency || 0}</div>
                {entity.properties && Object.entries(entity.properties).map(([key, value]) => (
                  <>
                    <div className="text-muted-foreground capitalize">{key}</div>
                    <div>{value?.toString()}</div>
                  </>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium mb-2">Timeline</h3>
              <div ref={timelineRef} className="w-full h-[120px] relative"></div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium mb-2">Related Entities</h3>
              <div className="space-y-2">
                {relationships
                  .filter(r => r.source === entity.id || r.target === entity.id)
                  .map(r => {
                    const relatedEntityId = r.source === entity.id ? r.target : r.source;
                    const relatedEntity = entities.find(e => e.id === relatedEntityId);
                    const direction = r.source === entity.id ? 'to' : 'from';
                    
                    return (
                      <div key={r.id} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: relatedEntity ? defaultEntityStyles[relatedEntity.type]?.color || '#ccc' : '#ccc' }}
                          />
                          <span>{relatedEntity?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span>{direction}</span>
                          <span>{r.type?.toLowerCase() || 'relates'}</span>
                          <span className="px-1 py-0.5 bg-background rounded">{r.metrics?.frequency || 0}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EntityDetailView;
