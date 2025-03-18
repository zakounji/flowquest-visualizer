
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Entity, Relationship, ProcessData } from '@/types/processTypes';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { defaultEntityStyles } from '@/utils/visualizationHelpers';

interface MetricsDashboardProps {
  processData: ProcessData;
}

const MetricsDashboard = ({ processData }: MetricsDashboardProps) => {
  const entityFrequencyData = useMemo(() => {
    if (!processData?.entities?.length) return [];
    
    return processData.entities
      .sort((a, b) => b.metrics.frequency - a.metrics.frequency)
      .slice(0, 5)
      .map(entity => ({
        name: entity.name.length > 15 ? entity.name.substring(0, 12) + '...' : entity.name,
        frequency: entity.metrics.frequency,
        type: entity.type,
        color: defaultEntityStyles[entity.type].color
      }));
  }, [processData?.entities]);
  
  const entityTypeDistribution = useMemo(() => {
    if (!processData?.entities?.length) return [];
    
    const typeCounts = processData.entities.reduce((acc, entity) => {
      acc[entity.type] = (acc[entity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type.charAt(0) + type.slice(1).toLowerCase(),
      value: count,
      color: defaultEntityStyles[type as keyof typeof defaultEntityStyles]?.color
    }));
  }, [processData?.entities]);
  
  const relationshipData = useMemo(() => {
    if (!processData?.relationships?.length) return [];
    
    return processData.relationships
      .sort((a, b) => b.metrics.frequency - a.metrics.frequency)
      .slice(0, 5)
      .map(rel => {
        const source = processData.entities.find(e => e.id === rel.source);
        const target = processData.entities.find(e => e.id === rel.target);
        
        return {
          name: `${source?.name.substring(0, 6) || 'Unknown'}...→${target?.name.substring(0, 6) || 'Unknown'}...`,
          frequency: rel.metrics.frequency,
          sourceType: source?.type || 'unknown',
          targetType: target?.type || 'unknown'
        };
      });
  }, [processData?.relationships, processData?.entities]);
  
  const relationshipLineData = useMemo(() => {
    if (!processData?.relationships?.length) return [];
    
    // Group by source
    const sourceGroups = processData.relationships.reduce((acc, rel) => {
      const source = processData.entities.find(e => e.id === rel.source)?.name || rel.source;
      if (!acc[source]) acc[source] = 0;
      acc[source] += rel.metrics.frequency;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(sourceGroups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], index) => ({
        name: name.length > 10 ? name.substring(0, 7) + '...' : name,
        value,
        index
      }));
  }, [processData?.relationships, processData?.entities]);
  
  const summaryStats = useMemo(() => {
    if (!processData) return { entities: 0, relationships: 0, events: 0 };
    
    return {
      entities: processData.entities.length,
      relationships: processData.relationships.length,
      events: processData.metadata.totalEvents
    };
  }, [processData]);

  if (!processData || !processData.entities.length) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Metrics Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <p>No metrics available</p>
            <p className="text-sm">Process a log to see analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
      <Card className="col-span-1 backdrop-blur-sm bg-white/80 shadow-md border border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Process Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">{summaryStats.entities}</span>
              <span className="text-xs text-muted-foreground">Entities</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">{summaryStats.relationships}</span>
              <span className="text-xs text-muted-foreground">Flows</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">{summaryStats.events}</span>
              <span className="text-xs text-muted-foreground">Events</span>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Entity Distribution</h4>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={entityTypeDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {entityTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1 backdrop-blur-sm bg-white/80 shadow-md border border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Entities by Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={entityFrequencyData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                formatter={(value, name, props) => [value, 'Frequency']}
                labelFormatter={(label) => `Entity: ${label}`}
              />
              <Bar dataKey="frequency">
                {entityFrequencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="col-span-1 md:col-span-2 lg:col-span-1 backdrop-blur-sm bg-white/80 shadow-md border border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Relationships</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={relationshipData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => [value, 'Frequency']}
                labelFormatter={(label) => `Relationship: ${label}`}
              />
              <Bar dataKey="frequency" fill="#3182CE" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Relationship Activity</h4>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={relationshipLineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Frequency" 
                  stroke="#3182CE" 
                  strokeWidth={2} 
                  dot={{ fill: '#3182CE', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsDashboard;
