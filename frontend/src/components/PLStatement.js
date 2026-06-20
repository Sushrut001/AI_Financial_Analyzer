import React from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Divider,
  Chip, LinearProgress, Grid
} from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';

const fmt = (v) => {
  if (v === null || v === undefined) return '—';
  const n = parseFloat(v);
  if (isNaN(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(3)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(2)}K`;
  return `${sign}$${abs.toFixed(2)}`;
};

const fmtPct = (v) => {
  if (v === null || v === undefined) return '—';
  return `${parseFloat(v).toFixed(2)}%`;
};

function PLRow({ label, value, pct, indent = 0, bold = false, isSubtotal = false, color, borderTop }) {
  return (
    <Box sx={{
      py: 1.2,
      px: 2,
      borderTop: borderTop ? '2px solid #E0E0E0' : undefined,
      borderBottom: isSubtotal ? '1px solid #E0E0E0' : undefined,
      background: isSubtotal ? 'rgba(21,101,192,0.03)' : undefined,
      '&:hover': { background: 'rgba(0,0,0,0.02)' },
    }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          variant={bold || isSubtotal ? 'subtitle2' : 'body2'}
          fontWeight={bold || isSubtotal ? 700 : 400}
          color={bold ? color || 'text.primary' : 'text.secondary'}
          sx={{ pl: indent * 2 }}
        >
          {label}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {pct !== undefined && (
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60, textAlign: 'right' }}>
              {fmtPct(pct)}
            </Typography>
          )}
          <Typography
            variant={bold || isSubtotal ? 'subtitle2' : 'body2'}
            fontWeight={bold || isSubtotal ? 700 : 500}
            color={color || (parseFloat(value) < 0 ? '#C62828' : 'text.primary')}
            sx={{ minWidth: 100, textAlign: 'right', fontFamily: 'monospace', fontSize: 13 }}
          >
            {fmt(value)}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

export default function PLStatement({ pl }) {
  if (!pl) return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography color="text.secondary">No P&L data available.</Typography>
    </Box>
  );

  const metrics = [
    { label: 'Gross Margin', value: pl.gross_margin_pct, good: 30, great: 50 },
    { label: 'Operating Margin', value: pl.operating_margin_pct, good: 10, great: 20 },
    { label: 'Net Margin', value: pl.net_profit_margin_pct, good: 8, great: 15 },
    { label: 'EBITDA Margin', value: pl.ebitda_margin_pct, good: 15, great: 25 },
  ];

  const isProfit = (pl.net_profit || 0) > 0;

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={2}>Profit & Loss Statement</Typography>

      <Grid container spacing={3}>
        {/* Main P&L Table */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {/* Header */}
              <Box sx={{ px: 3, py: 2, background: 'linear-gradient(135deg, #0D47A1, #1565C0)', color: 'white' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={700}>Statement of Profit & Loss</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={isProfit ? 'Profitable' : 'Loss-Making'}
                      size="small"
                      sx={{
                        background: isProfit ? 'rgba(46,125,50,0.3)' : 'rgba(198,40,40,0.3)',
                        color: 'white',
                        fontWeight: 700,
                        border: `1px solid ${isProfit ? '#4CAF50' : '#E53935'}`,
                      }}
                    />
                  </Stack>
                </Stack>
                <Typography variant="caption" sx={{ opacity: 0.75 }}>
                  Annual Financial Period
                </Typography>
              </Box>

              {/* Column headers */}
              <Stack direction="row" justifyContent="space-between" sx={{ px: 2, py: 1, background: '#F5F7FA' }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">LINE ITEM</Typography>
                <Stack direction="row" spacing={2}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ minWidth: 60, textAlign: 'right' }}>% OF REV</Typography>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ minWidth: 100, textAlign: 'right' }}>AMOUNT</Typography>
                </Stack>
              </Stack>

              <Divider />

              {/* Revenue Section */}
              <Box sx={{ background: 'rgba(21,101,192,0.02)' }}>
                <PLRow label="Total Revenue" value={pl.revenue} bold color="#1565C0" />
                <PLRow label="Operating Revenue" value={pl.operating_revenue} indent={1} pct={pl.operating_revenue && pl.revenue ? (pl.operating_revenue / pl.revenue * 100).toFixed(1) : undefined} />
              </Box>

              <Divider />

              {/* COGS */}
              <PLRow label="Cost of Goods Sold" value={pl.cost_of_goods_sold ? -Math.abs(pl.cost_of_goods_sold) : pl.cost_of_goods_sold} indent={1} color="#C62828" />
              <PLRow
                label="Gross Profit"
                value={pl.gross_profit}
                pct={pl.gross_margin_pct}
                bold
                isSubtotal
                color={pl.gross_profit >= 0 ? '#2E7D32' : '#C62828'}
                borderTop
              />

              <Divider />

              {/* Operating */}
              <PLRow label="Operating Expenses" value={pl.operating_expenses ? -Math.abs(pl.operating_expenses) : pl.operating_expenses} indent={1} color="#C62828" />
              <PLRow
                label="Operating Profit (EBIT)"
                value={pl.operating_profit}
                pct={pl.operating_margin_pct}
                bold
                isSubtotal
                color={pl.operating_profit >= 0 ? '#1565C0' : '#C62828'}
                borderTop
              />

              <Divider />

              {/* Below EBIT */}
              <PLRow label="Interest Expense" value={pl.interest_expense ? -Math.abs(pl.interest_expense) : pl.interest_expense} indent={1} color="#E65100" />
              <PLRow label="Other Income" value={pl.other_income} indent={1} color="#2E7D32" />
              <PLRow label="Earnings Before Tax (EBT)" value={pl.earnings_before_tax} bold isSubtotal borderTop />

              <Divider />

              {/* Tax & Net */}
              <PLRow label="Income Tax Expense" value={pl.tax_expense ? -Math.abs(pl.tax_expense) : pl.tax_expense} indent={1} color="#C62828" />
              <PLRow
                label="NET PROFIT"
                value={pl.net_profit}
                pct={pl.net_profit_margin_pct}
                bold
                isSubtotal
                color={isProfit ? '#2E7D32' : '#C62828'}
                borderTop
              />

              <Divider />

              {/* EBITDA */}
              <Box sx={{ background: 'rgba(0,137,123,0.04)' }}>
                <PLRow label="Depreciation & Amortization" value={pl.depreciation} indent={1} />
                <PLRow
                  label="EBITDA"
                  value={pl.ebitda}
                  pct={pl.ebitda_margin_pct}
                  bold
                  color="#00897B"
                  borderTop
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Margin Cards */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            {metrics.map((m) => {
              const val = parseFloat(m.value) || 0;
              const pctNorm = Math.min(100, Math.max(0, val));
              const color = val >= m.great ? '#2E7D32' : val >= m.good ? '#1565C0' : '#C62828';
              const label = val >= m.great ? 'Strong' : val >= m.good ? 'Adequate' : 'Needs Work';

              return (
                <Card key={m.label}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight={600}>{m.label}</Typography>
                      <Chip label={label} size="small" sx={{ background: `${color}22`, color, fontWeight: 700, fontSize: 11 }} />
                    </Stack>
                    <Typography variant="h5" fontWeight={800} color={color} mb={1.5}>
                      {fmtPct(m.value)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={pctNorm}
                      sx={{
                        height: 6, borderRadius: 3,
                        backgroundColor: '#F0F0F0',
                        '& .MuiLinearProgress-bar': { background: color, borderRadius: 3 },
                      }}
                    />
                    <Stack direction="row" justifyContent="space-between" mt={0.5}>
                      <Typography variant="caption" color="text.secondary">0%</Typography>
                      <Typography variant="caption" color="text.secondary">Good: {m.good}%</Typography>
                      <Typography variant="caption" color="text.secondary">Great: {m.great}%</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}

            {/* Quick Summary */}
            <Card sx={{ background: 'linear-gradient(135deg, #E3F2FD, #E8F5E9)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Quick Analysis</Typography>
                {[
                  { label: 'Revenue', val: pl.revenue },
                  { label: 'Total Costs', val: (pl.cost_of_goods_sold || 0) + (pl.operating_expenses || 0) },
                  { label: 'Net Profit', val: pl.net_profit, bold: true },
                ].map((item) => (
                  <Stack key={item.label} direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="caption" fontWeight={item.bold ? 700 : 500}>
                      {fmt(item.val)}
                    </Typography>
                  </Stack>
                ))}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
