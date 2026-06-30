import { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { CalculatedAction } from '../types';

interface WorkloadChartProps {
  actions: CalculatedAction[];
}

export default function WorkloadChart({ actions }: WorkloadChartProps) {
  // Aggregate data by month-year
  const chartData = useMemo(() => {
    const aggregated: Record<string, { month: string; hours: number; cost: number; sortKey: string }> = {};

    actions.forEach(action => {
      const date = parseISO(action.scheduledStartDate);
      // "MMM yyyy" -> "mrt 2024"
      const monthLabel = format(date, 'MMM yyyy', { locale: nl });
      const sortKey = format(date, 'yyyy-MM');

      if (!aggregated[sortKey]) {
        aggregated[sortKey] = {
          month: monthLabel,
          hours: 0,
          cost: 0,
          sortKey
        };
      }

      // Assumption: 1 durationDay = 8 hours for the workload chart
      aggregated[sortKey].hours += action.durationDays * 8;
      aggregated[sortKey].cost += action.cost;
    });

    return Object.values(aggregated).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [actions]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <h3 className="mb-4">Belasting & Kosten over de Tijd</h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
            
            {/* Left Y Axis for Hours */}
            <YAxis 
              yAxisId="left" 
              stroke="var(--primary)" 
              tick={{ fill: 'var(--text-secondary)' }} 
              label={{ value: 'Uren', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }}
            />
            
            {/* Right Y Axis for Cost */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="var(--secondary)" 
              tick={{ fill: 'var(--text-secondary)' }}
              tickFormatter={(val) => `€${val / 1000}k`}
              label={{ value: 'Kosten', angle: 90, position: 'insideRight', fill: 'var(--text-secondary)' }}
            />
            
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
              formatter={(value: any, name: any) => {
                if (name === 'Kosten') return [new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value), name];
                return [`${value} uur`, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="hours" name="Benodigde Uren" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="cost" name="Kosten" stroke="var(--secondary)" strokeWidth={3} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
