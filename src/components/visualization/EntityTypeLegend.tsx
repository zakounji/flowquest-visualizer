
import { Card } from '@/components/ui/card';
import { EntityType } from '@/types/processTypes';
import { defaultEntityStyles } from '@/utils/visualizationHelpers';

const EntityTypeLegend = () => {
  // Filter out entity types that don't have style definitions
  const entityTypes = Object.values(EntityType).filter(type => 
    defaultEntityStyles[type] && defaultEntityStyles[type].color
  );

  // Group entity types into columns for better organization
  const columnsCount = 2;
  const itemsPerColumn = Math.ceil(entityTypes.length / columnsCount);
  const columns = Array.from({ length: columnsCount }, (_, i) => 
    entityTypes.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn)
  );

  return (
    <div className="absolute bottom-4 left-4 right-4 z-10">
      <Card className="glass-panel p-2 text-xs">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-1">
              {column.map(type => (
                <div key={type} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: defaultEntityStyles[type]?.color || '#cccccc' }}
                  />
                  <span>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default EntityTypeLegend;
