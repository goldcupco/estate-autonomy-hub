
import { ArrowDownRight, ArrowUpRight, Building, DollarSign, Users } from 'lucide-react';

export const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      <MetricCard 
        title="Total Properties"
        value="342"
        icon={Building}
        change={12.8}
        increased={true}
        bgColor="bg-blue-50 dark:bg-blue-950/30"
        iconColor="text-blue-500"
      />
      <MetricCard 
        title="Active Leads"
        value="165"
        icon={Users}
        change={5.3}
        increased={true}
        bgColor="bg-green-50 dark:bg-green-950/30"
        iconColor="text-green-500"
      />
      <MetricCard 
        title="Properties Sold"
        value="78"
        icon={Building}
        change={2.1}
        increased={false}
        bgColor="bg-purple-50 dark:bg-purple-950/30"
        iconColor="text-purple-500"
      />
      <MetricCard 
        title="Revenue"
        value="$2.4M"
        icon={DollarSign}
        change={8.2}
        increased={true}
        bgColor="bg-orange-50 dark:bg-orange-950/30"
        iconColor="text-orange-500"
      />
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  change: number;
  increased: boolean;
  bgColor: string;
  iconColor: string;
}

const MetricCard = ({ title, value, icon: Icon, change, increased, bgColor, iconColor }: MetricCardProps) => {
  return (
    <div className="glass-card rounded-xl shadow-sm overflow-hidden animate-scale-in">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-2xl font-bold">{value}</h3>
          </div>
          <div className={`${bgColor} p-3 rounded-md ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <div className={`flex items-center ${increased ? 'text-green-500' : 'text-red-500'}`}>
            {increased ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
            <span className="text-sm font-medium">{change}%</span>
          </div>
          <span className="text-xs text-muted-foreground ml-2">vs. last month</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;
