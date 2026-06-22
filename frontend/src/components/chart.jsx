import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// In ScanDetail, compute severity counts
const severityCounts = findings.reduce((acc, f) => {
  acc[f.severity] = (acc[f.severity] || 0) + 1;
  return acc;
}, {});

const data = Object.entries(severityCounts).map(([name, value]) => ({ name, value }));
const COLORS = ['#ff4444', '#ff8800', '#ffcc00', '#44aaff', '#888888'];

// Render chart if data exists
{data.length > 0 && (
  <div className="mt-6 bg-[#161b22] p-4 rounded-lg">
    <h4 className="text-sm font-semibold text-gray-400 mb-2">Severity Distribution</h4>
    <PieChart width={300} height={200}>
      <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </div>
)}