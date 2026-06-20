import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, AreaChart, Area
} from 'recharts';

const COLORS = ['#1565C0', '#00897B', '#7B1FA2', '#E65100', '#2E7D32', '#0277BD'];

const fmtAxis = (v) => {
  const n = Math.abs(v);
  if (n >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: 'rgba(255,255,255,0.97)',
      border: '1px solid #E0E0E0',
      borderRadius: 2,
      p: 1.5,
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    }}>
      {label && <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>{label}</Typography>}
      {payload.map((p, i) => (
        <Typography key={i} variant="caption" color={p.color} display="block">
          {p.name}: {typeof p.value === 'number' && Math.abs(p.value) > 100 ? fmtAxis(p.value) : p.value}
        </Typography>
      ))}
    </Box>
  );
};

function ChartCard({ title, children, height = 260 }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>{title}</Typography>
        <Box sx={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function FinancialCharts({ kpis, pl }) {
  // Revenue & Profit breakdown bar chart
  const revenueData = [
    { name: 'Revenue', value: pl?.revenue || 0, fill: '#1565C0' },
    { name: 'Gross Profit', value: pl?.gross_profit || 0, fill: '#00897B' },
    { name: 'Op. Profit', value: pl?.operating_profit || 0, fill: '#7B1FA2' },
    { name: 'Net Profit', value: pl?.net_profit || 0, fill: '#2E7D32' },
    { name: 'EBITDA', value: pl?.ebitda || 0, fill: '#E65100' },
  ].filter(d => d.value !== 0);

  // Expense breakdown
  const expenseData = [
    { name: 'COGS', value: Math.abs(pl?.cost_of_goods_sold || 0) },
    { name: 'Op. Expenses', value: Math.abs(pl?.operating_expenses || 0) },
    { name: 'Interest', value: Math.abs(pl?.interest_expense || 0) },
    { name: 'Tax', value: Math.abs(pl?.tax_expense || 0) },
  ].filter(d => d.value > 0);

  // Asset vs Liability
  const balanceData = [
    {
      name: 'Current',
      Assets: kpis?.current_assets || 0,
      Liabilities: kpis?.current_liabilities || 0,
    },
    {
      name: 'Non-Current',
      Assets: kpis?.non_current_assets || 0,
      Liabilities: kpis?.non_current_liabilities || 0,
    },
    {
      name: 'Total',
      Assets: kpis?.total_assets || 0,
      Liabilities: kpis?.total_liabilities || 0,
      Equity: kpis?.equity || 0,
    },
  ];

  // Cash Flow
  const cfData = [
    { name: 'Operating', value: kpis?.operating_cash_flow || 0 },
    { name: 'Investing', value: kpis?.investing_cash_flow || 0 },
    { name: 'Financing', value: kpis?.financing_cash_flow || 0 },
    { name: 'Free CF', value: kpis?.free_cash_flow || 0 },
  ].filter(d => d.value !== 0);

  // Margin radar
  const marginData = [
    { metric: 'Gross Margin', value: Math.min(100, Math.max(0, kpis?.gross_margin || 0)) },
    { metric: 'Net Margin', value: Math.min(100, Math.max(0, kpis?.net_profit_margin || 0)) },
    { metric: 'Op. Margin', value: Math.min(100, Math.max(0, kpis?.operating_margin || 0)) },
    { metric: 'ROE', value: Math.min(100, Math.max(0, kpis?.roe || 0)) },
    { metric: 'ROA', value: Math.min(100, Math.max(0, kpis?.roa || 0)) },
    { metric: 'CF Score', value: kpis?.cash_flow_health_score || 0 },
  ];

  // Profitability trend (simulated quarterly from annual)
  const quarterData = [
    { q: 'Q1', revenue: (pl?.revenue || 0) * 0.22, profit: (pl?.net_profit || 0) * 0.18 },
    { q: 'Q2', revenue: (pl?.revenue || 0) * 0.25, profit: (pl?.net_profit || 0) * 0.24 },
    { q: 'Q3', revenue: (pl?.revenue || 0) * 0.26, profit: (pl?.net_profit || 0) * 0.28 },
    { q: 'Q4', revenue: (pl?.revenue || 0) * 0.27, profit: (pl?.net_profit || 0) * 0.30 },
  ];

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={2}>Financial Charts</Typography>
      <Grid container spacing={3}>
        {/* Revenue vs Profit */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Revenue & Profit Breakdown">
            <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Amount" radius={[6, 6, 0, 0]}>
                {revenueData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        </Grid>

        {/* Expense Breakdown Pie */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Expense Breakdown">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {expenseData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} formatter={(v) => fmtAxis(v)} />
              <Legend />
            </PieChart>
          </ChartCard>
        </Grid>

        {/* Asset vs Liability */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Assets vs Liabilities vs Equity">
            <BarChart data={balanceData} margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Assets" fill="#1565C0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Liabilities" fill="#E53935" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Equity" fill="#2E7D32" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
        </Grid>

        {/* Cash Flow */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Cash Flow Analysis">
            <BarChart data={cfData} margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Cash Flow" radius={[6, 6, 0, 0]}>
                {cfData.map((entry, i) => (
                  <Cell key={i} fill={entry.value >= 0 ? '#00897B' : '#E53935'} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        </Grid>

        {/* Financial Health Radar */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Financial Health Radar">
            <RadarChart data={marginData} cx="50%" cy="50%" outerRadius={90}>
              <PolarGrid stroke="#E0E0E0" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <Radar
                name="Metrics"
                dataKey="value"
                stroke="#1565C0"
                fill="#1565C0"
                fillOpacity={0.25}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ChartCard>
        </Grid>

        {/* Quarterly Trend */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Quarterly Trend (Estimated)">
            <AreaChart data={quarterData} margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1565C0" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00897B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00897B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="q" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#1565C0" fill="url(#revGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#00897B" fill="url(#profGrad)" strokeWidth={2} />
            </AreaChart>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
