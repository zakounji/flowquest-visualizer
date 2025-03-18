
import { Card } from '@/components/ui/card';
import { EntityType } from '@/types/processTypes';
import { defaultEntityStyles } from '@/utils/visualizationHelpers';

const EntityTypeLegend = () => {
  // Filter out entity types that don't have style definitions
  const entityTypes = Object.values(EntityType).filter(type => 
    defaultEntityStyles[type] && defaultEntityStyles[type].color
  );

  return (
    <div className="absolute bottom-4 left-4 right-4">
      <Card className="glass-panel p-2 text-xs">
        <div className="flex flex-wrap gap-3">
          {entityTypes.map(type => (
            <div key={type} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: defaultEntityStyles[type].color }}
              />
              <span>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default EntityTypeLegend;
