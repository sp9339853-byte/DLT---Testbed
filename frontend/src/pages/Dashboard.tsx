import { Card } from '../components/Card';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const tpsData = [
  { name: 'Mon', tps: 1800 },
  { name: 'Tue', tps: 2100 },
  { name: 'Wed', tps: 1900 },
  { name: 'Thu', tps: 2400 },
  { name: 'Fri', tps: 2184 },
];

export default function Dashboard() {
  return (
    <div className="p-8 max-w-scaffold mx-auto w-full">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-semibold mb-2">DLT Performance Command Center</h1>
          <p className="text-text-secondary">Monitor, benchmark and optimize distributed ledger workloads.</p>
        </div>
        <Link 
          to="/app/benchmark" 
          className="bg-primary-interaction text-white px-5 py-2.5 rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          + New Benchmark
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="flex flex-col">
          <span className="text-xs text-text-muted font-mono mb-2">Total Experiments</span>
          <span className="text-2xl font-semibold">128</span>
          <span className="text-xs text-status-success mt-2">↑ 12 this week</span>
        </Card>
        <Card className="flex flex-col">
          <span className="text-xs text-text-muted font-mono mb-2">Average TPS</span>
          <span className="text-2xl font-semibold">2,184</span>
          <span className="text-xs text-status-success mt-2">↑ 5% avg</span>
        </Card>
        <Card className="flex flex-col">
          <span className="text-xs text-text-muted font-mono mb-2">Average Latency</span>
          <span className="text-2xl font-semibold">43.2 ms</span>
          <span className="text-xs text-status-warning mt-2">~ stable</span>
        </Card>
        <Card className="flex flex-col">
          <span className="text-xs text-text-muted font-mono mb-2">Reliability</span>
          <span className="text-2xl font-semibold">98.7%</span>
          <span className="text-xs text-status-success mt-2">↑ 0.2%</span>
        </Card>
        <Card className="flex flex-col">
          <span className="text-xs text-text-muted font-mono mb-2">Energy Efficiency</span>
          <span className="text-2xl font-semibold">0.038 Wh</span>
          <span className="text-xs text-text-muted mt-2">per 1K tx</span>
        </Card>
      </div>

      {/* Charts Skyline Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold mb-6">TPS Trend Analysis</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tpsData}>
                <defs>
                  <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0055FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0055FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8A8A' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8A8A' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', color: '#fff', borderRadius: '8px', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="tps" stroke="#0055FF" strokeWidth={2} fillOpacity={1} fill="url(#colorTps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-sm font-semibold mb-6">Recent Status Distribution</h3>
          <div className="h-64 w-full flex flex-col justify-end">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={[{name: 'Success', val: 98.7}, {name: 'Fail', val: 1.3}]}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.15)" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8A8A' }} />
                 <Tooltip cursor={{fill: 'rgba(128,128,128,0.05)'}} contentStyle={{ backgroundColor: '#111', color: '#fff', borderRadius: '8px', border: 'none' }} />
                 <Bar dataKey="val" fill="#0055FF" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
