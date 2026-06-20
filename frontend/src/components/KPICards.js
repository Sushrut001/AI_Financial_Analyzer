import React from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Stack, Chip,
  LinearProgress, Divider, Tooltip
} from '@mui/material';
import {
  TrendingUp, TrendingDown, AccountBalance, AttachMoney,
  ShowChart, Speed, Savings, CreditCard, WaterDrop,
  Assessment, MonetizationOn, BarChart
} from '@mui/icons-material';

const fmt = (v, prefix = '$', suffix = '') => {
  if (v === null || v === undefined) return 'N/A';
  const n = parseFloat(v);
  if (isNaN(n)) return 'N/A';
  if (Math.abs(n) >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(2)}M${suffix}`;
  if (Math.abs(n) >= 1_000) return `${prefix}${(n / 1_000).toFixed(1)}K${suffix}`;
  return `${prefix}${n.toFixed(2)}${suffix}`;
};

const fmtPct = (v) => {
  if (v === null || v === undefined) return 'N/A';
  return `${parseFloat(v).toFixed(2)}%`;
};

const fmtRatio = (v) => {
  if (v === null || v === undefined) return 'N/A';
  return parseFloat(v).toFixed(2);
};

const KPI_META = [
  {
    key: 'revenue', label: 'Total Revenue', format: (v) => fmt(v),
    icon: <AttachMoney />, color: '#1565C0', bg: '#E3F2FD',
    desc: 'Total income generated',
  },
  {
    key: 'net_profit', label: 'Net Profit', format: (v) => fmt(v),
    icon: <TrendingUp />, color: '#2E7D32', bg: '#E8F5E9',
    desc: 'Profit after all expenses & taxes',
    positive: (v) => v > 0,
  },
  {
    key: 'gross_margin', label: 'Gross Margin', format: fmtPct,
    icon: <ShowChart />, color: '#7B1FA2', bg: '#F3E5F5',
    desc: 'Revenue remaining after COGS',
    good: 30, great: 50,
  },
  {
    key: 'net_profit_margin', label: 'Net Margin', format: fmtPct,
    icon: <MonetizationOn />, color: '#E65100', bg: '#FBE9E7',
    desc: 'Percentage of revenue = net profit',
    good: 10, great: 20,
  },
  {
    key: 'ebitda', label: 'EBITDA', format: (v) => fmt(v),
    icon: <Assessment />, color: '#00695C', bg: '#E0F2F1',
    desc: 'Earnings before interest, tax, D&A',
  },
  {
    key: 'current_ratio', label: 'Current Ratio', format: fmtRatio,
    icon: <Speed />, color: '#1565C0', bg: '#E3F2FD',
    desc: 'Ability to cover short-term debt',
    good: 1.5, great: 2.0, isRatio: true,
  },
  {
    key: 'debt_ratio', label: 'Debt Ratio', format: fmtPct,
    icon: <CreditCard />, color: '#B71C1C', bg: '#FFEBEE',
    desc: 'Liabilities as % of total assets',
    inverse: true, good: 50, great: 30,
  },
  {
    key: 'roe', label: 'ROE', format: fmtPct,
    icon: <AccountBalance />, color: '#4A148C', bg: '#EDE7F6',
    desc: 'Return on shareholders equity',
    good: 15, great: 25,
  },
  {
    key: 'roa', label: 'ROA', format: fmtPct,
    icon: <Savings />, color: '#006064', bg: '#E0F7FA',
    desc: 'Return on total assets',
    good: 5, great: 10,
  },
  {
    key: 'cash_flow_health_score', label: 'CF Health', format: (v) => `${v}/100`,
    icon: <WaterDrop />, color: '#0277BD', bg: '#E1F5FE',
    desc: 'Cash flow health score (0-100)',
    good: 60, great: 80, isScore: true,
  },
  {
    key: 'working_capital', label: 'Working Capital', format: (v) => fmt(v),
    icon: <BarChart />, color: '#558B2F', bg: '#F1F8E9',
    desc: 'Current assets minus current liabilities',
    positive: (v) => v > 0,
  },
  {
    key: 'free_cash_flow', label: 'Free Cash Flow', format: (v) => fmt(v),
    icon: <TrendingDown />, color: '#4E342E', bg: '#EFEBE9',
    desc: 'Operating CF minus capital expenditure',
    positive: (v) => v > 0,
  },
];

function KPICard({ meta, value, aiAnalysis }) {
  const displayVal = meta.format(value);
  const isNA = displayVal === 'N/A';
  const numVal = parseFloat(value);

  let sentiment = 'neutral';
  if (!isNA) {
    if (meta.positive) {
      sentiment = meta.positive(numVal) ? 'good' : 'bad';
    } else if (meta.good !== undefined) {
      if (meta.inverse) {
        sentiment = numVal <= meta.great ? 'great' : numVal <= meta.good ? 'good' : 'bad';
      } else {
        sentiment = numVal >= meta.great ? 'great' : numVal >= meta.good ? 'good' : 'bad';
      }
    }
  }

  const sentimentColors = {
    great: '#2E7D32',
    good: '#1565C0',
    bad: '#C62828',
    neutral: '#4A5568',
  };

  const progressVal = meta.isScore ? numVal : meta.isRatio ? Math.min(100, numVal * 50) : null;

  return (
    <Card sx={{
      height: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
      },
    }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '10px',
            background: meta.bg, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {React.cloneElement(meta.icon, { sx: { fontSize: 20, color: meta.color } })}
          </Box>
          {!isNA && sentiment !== 'neutral' && (
            <Chip
              label={sentiment === 'great' ? '✓ Strong' : sentiment === 'good' ? '✓ OK' : '⚠ Review'}
              size="small"
              sx={{
                fontSize: 10, fontWeight: 700, height: 20,
                background: sentiment === 'bad' ? '#FFEBEE' : '#E8F5E9',
                color: sentiment === 'bad' ? '#C62828' : '#2E7D32',
              }}
            />
          )}
        </Stack>

        <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={0.5}>
          {meta.label}
        </Typography>

        <Typography
          variant="h5"
          fontWeight={800}
          fontFamily='"Plus Jakarta Sans"'
          color={isNA ? 'text.disabled' : sentimentColors[sentiment]}
          lineHeight={1.1}
        >
          {displayVal}
        </Typography>

        {progressVal !== null && !isNA && (
          <Box mt={1.5}>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, progressVal))}
              sx={{
                height: 4, borderRadius: 2,
                backgroundColor: `${meta.bg}`,
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})`,
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        )}

        <Tooltip title={meta.desc}>
          <Typography variant="caption" color="text.secondary" mt={1} display="block" sx={{ cursor: 'help' }}>
            {meta.desc}
          </Typography>
        </Tooltip>
      </CardContent>
    </Card>
  );
}

export default function KPICards({ kpis, aiAnalysis }) {
  const balanceData = [
    { label: 'Total Assets', value: fmt(kpis?.total_assets), color: '#1565C0' },
    { label: 'Total Liabilities', value: fmt(kpis?.total_liabilities), color: '#C62828' },
    { label: 'Equity', value: fmt(kpis?.equity), color: '#2E7D32' },
    { label: 'Cash & Equiv.', value: fmt(kpis?.cash_and_equivalents), color: '#0277BD' },
  ];

  const cfData = [
    { label: 'Operating CF', value: fmt(kpis?.operating_cash_flow), color: '#2E7D32' },
    { label: 'Investing CF', value: fmt(kpis?.investing_cash_flow), color: '#E65100' },
    { label: 'Financing CF', value: fmt(kpis?.financing_cash_flow), color: '#7B1FA2' },
    { label: 'Free CF', value: fmt(kpis?.free_cash_flow), color: '#006064' },
  ];

  return (
    <Box>
      {/* KPI Grid */}
      <Typography variant="h6" fontWeight={700} mb={2} color="text.primary">
        Key Performance Indicators
      </Typography>
      <Grid container spacing={2} mb={4}>
        {KPI_META.map((meta) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={meta.key}>
            <KPICard meta={meta} value={kpis?.[meta.key]} aiAnalysis={aiAnalysis} />
          </Grid>
        ))}
      </Grid>

      {/* Balance Sheet & Cash Flow summary */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Balance Sheet Summary</Typography>
              <Stack spacing={1.5}>
                {balanceData.map((item) => (
                  <Stack key={item.label} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={700} color={item.color}>
                      {item.value}
                    </Typography>
                  </Stack>
                ))}
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Debt-to-Equity</Typography>
                  <Chip label={fmtRatio(kpis?.debt_to_equity)} size="small" />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Cash Flow Summary</Typography>
              <Stack spacing={1.5}>
                {cfData.map((item) => (
                  <Stack key={item.label} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={700} color={item.color}>
                      {item.value}
                    </Typography>
                  </Stack>
                ))}
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">CF Health Score</Typography>
                  <Chip
                    label={kpis?.cash_flow_health_score ? `${kpis.cash_flow_health_score}/100` : 'N/A'}
                    size="small"
                    color={kpis?.cash_flow_health_score >= 70 ? 'success' : kpis?.cash_flow_health_score >= 50 ? 'warning' : 'error'}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
