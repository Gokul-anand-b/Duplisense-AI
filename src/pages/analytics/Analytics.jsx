import { useState, useEffect, useRef } from 'react';
import { mockAnalytics } from '../../data/mockData';
import { formatCurrency } from '../../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts';

const COLORS = ['#ffffff', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b'];

function useCountUp(end, duration = 1200) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const endNum = typeof end === 'number' ? end : parseInt(String(end).replace(/[^0-9]/g, ''), 10) || 0;
    if (endNum === 0) { setCount(0); return; }

    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * endNum));
      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate);
      }
    };
    countRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(countRef.current);
  }, [end, duration]);

  return count;
}

function AnimatedNumber({ value }) {
  const animated = useCountUp(value, 1400);
  return <>{animated.toLocaleString('en-IN')}</>;
}

export default function Analytics() {
  const data = mockAnalytics;

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Enterprise Analytics & ROI</h1>
        <p className="page-subtitle">Detailed breakdown of duplicate detection, reuse efficiency, and organization savings</p>
      </div>

      {/* Savings Summary Banner */}
      <div className="savings-highlight mb-4">
        <div className="savings-amount">
          ₹<AnimatedNumber value={data.totalCostSaved} />
        </div>
        <div className="savings-label">Total Organization Cost Saved Through Work Reuse</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              <AnimatedNumber value={data.totalHoursSaved} /> hrs
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Dev Hours Saved</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#e4e4e7' }}>
              <AnimatedNumber value={data.approvedReuse} />
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Reused Modules</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              {((data.approvedReuse / data.similarProjectsDetected) * 100).toFixed(0)}%
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Reuse Conversion Rate</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Monthly Trends */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Monthly Submission & Detection Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthlyTrends}>
              <defs>
                <linearGradient id="agp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="agd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#71717a" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} />
              <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '12px', color: '#ffffff' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="projects" stroke="#ffffff" fill="url(#agp)" strokeWidth={2} name="Projects" />
              <Area type="monotone" dataKey="duplicatesFound" stroke="#a1a1aa" fill="url(#agd)" strokeWidth={2} name="Duplicates Found" />
              <Line type="monotone" dataKey="reused" stroke="#e4e4e7" strokeWidth={2} dot={{ fill: '#e4e4e7' }} name="Reused" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Savings by Category */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Savings by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.savingsByCategory.filter(c => c.hoursSaved > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="category" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '12px', color: '#ffffff' }}
                formatter={(value, name) => [name === 'costSaved' ? formatCurrency(value) : value + ' hrs', name === 'costSaved' ? 'Cost Saved' : 'Hours Saved']}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="hoursSaved" fill="#ffffff" radius={[4, 4, 0, 0]} name="Hours Saved" />
              <Bar dataKey="costSaved" fill="#a1a1aa" radius={[4, 4, 0, 0]} name="Cost Saved (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Similarity Distribution */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Similarity Level Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.similarityDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                dataKey="count"
                nameKey="level"
                stroke="none"
                label={({ level, count }) => `${level}: ${count}`}
                labelLine={false}
              >
                {data.similarityDistribution.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '12px', color: '#ffffff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department Reuse */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Department Reuse Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.departmentReuse} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} />
              <YAxis type="category" dataKey="department" tick={{ fill: '#a1a1aa', fontSize: 12 }} width={100} axisLine={false} />
              <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '12px', color: '#ffffff' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="total" fill="#a1a1aa" radius={[0, 4, 4, 0]} name="Total Projects" />
              <Bar dataKey="reused" fill="#ffffff" radius={[0, 4, 4, 0]} name="Reused" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
