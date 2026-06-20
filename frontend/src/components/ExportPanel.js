import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Stack, Box, Card, CardContent,
  CircularProgress, Alert, Chip, Divider
} from '@mui/material';
import { PictureAsPdf, TableChart, Close, FileDownload, CheckCircle } from '@mui/icons-material';

const fmt = (v, prefix = '$') => {
  if (v === null || v === undefined) return 'N/A';
  const n = parseFloat(v);
  if (isNaN(n)) return 'N/A';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${prefix}${sign}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${prefix}${sign}${(abs / 1_000).toFixed(1)}K`;
  return `${prefix}${sign}${abs.toFixed(2)}`;
};

function generateCSV(data) {
  const { kpis, pl_statement, ai_analysis, filename, analyzed_at } = data;
  const rows = [
    ['AI Financial Statement Analyzer Report'],
    ['File:', filename],
    ['Analyzed:', new Date(analyzed_at).toLocaleString()],
    ['Company Health:', ai_analysis?.company_health || 'N/A'],
    ['Health Score:', ai_analysis?.health_score || 'N/A'],
    [],
    ['=== KEY PERFORMANCE INDICATORS ==='],
    ['Metric', 'Value'],
    ['Total Revenue', fmt(kpis?.revenue)],
    ['Operating Revenue', fmt(kpis?.operating_revenue)],
    ['Gross Profit', fmt(kpis?.gross_profit)],
    ['Net Profit', fmt(kpis?.net_profit)],
    ['EBITDA', fmt(kpis?.ebitda)],
    ['Gross Margin', kpis?.gross_margin !== null ? `${kpis?.gross_margin}%` : 'N/A'],
    ['Net Profit Margin', kpis?.net_profit_margin !== null ? `${kpis?.net_profit_margin}%` : 'N/A'],
    ['Operating Margin', kpis?.operating_margin !== null ? `${kpis?.operating_margin}%` : 'N/A'],
    ['Current Ratio', kpis?.current_ratio || 'N/A'],
    ['Quick Ratio', kpis?.quick_ratio || 'N/A'],
    ['Debt Ratio', kpis?.debt_ratio !== null ? `${kpis?.debt_ratio}%` : 'N/A'],
    ['Debt-to-Equity', kpis?.debt_to_equity || 'N/A'],
    ['ROA', kpis?.roa !== null ? `${kpis?.roa}%` : 'N/A'],
    ['ROE', kpis?.roe !== null ? `${kpis?.roe}%` : 'N/A'],
    ['ROI', kpis?.roi !== null ? `${kpis?.roi}%` : 'N/A'],
    ['Working Capital', fmt(kpis?.working_capital)],
    ['Free Cash Flow', fmt(kpis?.free_cash_flow)],
    ['CF Health Score', kpis?.cash_flow_health_score ? `${kpis?.cash_flow_health_score}/100` : 'N/A'],
    [],
    ['=== BALANCE SHEET SUMMARY ==='],
    ['Total Assets', fmt(kpis?.total_assets)],
    ['Total Liabilities', fmt(kpis?.total_liabilities)],
    ['Equity', fmt(kpis?.equity)],
    ['Cash & Equivalents', fmt(kpis?.cash_and_equivalents)],
    [],
    ['=== CASH FLOW ==='],
    ['Operating Cash Flow', fmt(kpis?.operating_cash_flow)],
    ['Investing Cash Flow', fmt(kpis?.investing_cash_flow)],
    ['Financing Cash Flow', fmt(kpis?.financing_cash_flow)],
    [],
    ['=== PROFIT & LOSS STATEMENT ==='],
    ['Revenue', fmt(pl_statement?.revenue)],
    ['Cost of Goods Sold', fmt(pl_statement?.cost_of_goods_sold)],
    ['Gross Profit', fmt(pl_statement?.gross_profit)],
    ['Gross Margin %', `${pl_statement?.gross_margin_pct || 'N/A'}%`],
    ['Operating Expenses', fmt(pl_statement?.operating_expenses)],
    ['Operating Profit', fmt(pl_statement?.operating_profit)],
    ['Operating Margin %', `${pl_statement?.operating_margin_pct || 'N/A'}%`],
    ['Interest Expense', fmt(pl_statement?.interest_expense)],
    ['Tax Expense', fmt(pl_statement?.tax_expense)],
    ['Net Profit', fmt(pl_statement?.net_profit)],
    ['Net Margin %', `${pl_statement?.net_profit_margin_pct || 'N/A'}%`],
    ['EBITDA', fmt(pl_statement?.ebitda)],
    ['EBITDA Margin %', `${pl_statement?.ebitda_margin_pct || 'N/A'}%`],
    [],
    ['=== AI ANALYSIS ==='],
    ['Executive Summary', ai_analysis?.executive_summary || 'N/A'],
    [],
    ['RISKS:'],
    ...(ai_analysis?.risks || []).map(r => [`[${r.severity}] ${r.title}`, r.description]),
    [],
    ['RECOMMENDATIONS:'],
    ...(ai_analysis?.recommendations || []).map(r => [`[${r.impact}] ${r.title}`, r.description]),
    [],
    ['GROWTH OPPORTUNITIES:'],
    ...(ai_analysis?.growth_opportunities || []).map(g => [g.title, g.description]),
    [],
    ['COST OPTIMIZATION:'],
    ...(ai_analysis?.cost_optimization || []).map(c => [c.area, `${c.suggestion} (Save: ${c.estimated_savings || 'N/A'})`]),
    [],
    ['STRATEGY:'],
    ...(ai_analysis?.strategy || []).map(s => [s.horizon, `${s.action} — ${s.rationale}`]),
  ];

  return rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
}

function generateHTMLReport(data) {
  const { kpis, pl_statement, ai_analysis, filename, analyzed_at } = data;
  const health = ai_analysis?.company_health || 'N/A';
  const healthColors = { Excellent: '#1B5E20', Good: '#1565C0', Fair: '#E65100', Poor: '#BF360C', Critical: '#B71C1C' };
  const hColor = healthColors[health] || '#4A5568';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Financial Report - ${filename}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; font-size: 13px; }
  .header { background: linear-gradient(135deg, #0D47A1, #1565C0); color: white; padding: 30px 40px; }
  .header h1 { font-size: 24px; margin-bottom: 6px; }
  .header p { opacity: 0.8; font-size: 13px; }
  .health-badge { display: inline-block; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 20px; padding: 4px 14px; font-weight: 700; margin-top: 10px; }
  .container { padding: 30px 40px; }
  .section { margin-bottom: 30px; }
  .section-title { font-size: 16px; font-weight: 700; color: #0D47A1; border-bottom: 2px solid #E3F2FD; padding-bottom: 6px; margin-bottom: 14px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .kpi-card { background: #F5F7FA; border-radius: 8px; padding: 14px; border: 1px solid #E0E0E0; }
  .kpi-label { font-size: 11px; color: #666; margin-bottom: 4px; }
  .kpi-value { font-size: 18px; font-weight: 700; color: #1565C0; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 9px 12px; text-align: left; border-bottom: 1px solid #F0F0F0; }
  th { background: #F5F7FA; font-weight: 600; color: #333; }
  tr:hover td { background: #FAFAFA; }
  .amount { text-align: right; font-family: monospace; }
  .risk-high { color: #B71C1C; font-weight: 600; }
  .risk-medium { color: #E65100; font-weight: 600; }
  .risk-low { color: #1B5E20; font-weight: 600; }
  .summary { background: linear-gradient(135deg, #E3F2FD, #E8F5E9); border-radius: 10px; padding: 20px; border-left: 4px solid #1565C0; }
  .footer { background: #F5F7FA; padding: 16px 40px; font-size: 11px; color: #999; border-top: 1px solid #E0E0E0; }
  @media print { body { -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <h1>AI Financial Statement Analysis</h1>
  <p>${filename} &nbsp;|&nbsp; ${new Date(analyzed_at).toLocaleString()}</p>
  <div class="health-badge">Company Health: ${health} (${ai_analysis?.health_score || 'N/A'}/100)</div>
</div>
<div class="container">
  <div class="section">
    <div class="section-title">Executive Summary</div>
    <div class="summary">${ai_analysis?.executive_summary || 'N/A'}</div>
  </div>

  <div class="section">
    <div class="section-title">Key Performance Indicators</div>
    <div class="kpi-grid">
      ${[
        ['Total Revenue', fmt(kpis?.revenue)],
        ['Net Profit', fmt(kpis?.net_profit)],
        ['EBITDA', fmt(kpis?.ebitda)],
        ['Gross Margin', `${kpis?.gross_margin || 'N/A'}%`],
        ['Net Margin', `${kpis?.net_profit_margin || 'N/A'}%`],
        ['Current Ratio', kpis?.current_ratio || 'N/A'],
        ['Debt Ratio', `${kpis?.debt_ratio || 'N/A'}%`],
        ['ROE', `${kpis?.roe || 'N/A'}%`],
        ['CF Health', `${kpis?.cash_flow_health_score || 'N/A'}/100`],
      ].map(([l, v]) => `<div class="kpi-card"><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div></div>`).join('')}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Profit & Loss Statement</div>
    <table>
      <tr><th>Line Item</th><th class="amount">Amount</th><th class="amount">% of Revenue</th></tr>
      <tr><td><b>Revenue</b></td><td class="amount"><b>${fmt(pl_statement?.revenue)}</b></td><td class="amount">100%</td></tr>
      <tr><td>Cost of Goods Sold</td><td class="amount">${fmt(pl_statement?.cost_of_goods_sold)}</td><td class="amount">—</td></tr>
      <tr><td><b>Gross Profit</b></td><td class="amount"><b>${fmt(pl_statement?.gross_profit)}</b></td><td class="amount">${pl_statement?.gross_margin_pct || 'N/A'}%</td></tr>
      <tr><td>Operating Expenses</td><td class="amount">${fmt(pl_statement?.operating_expenses)}</td><td class="amount">—</td></tr>
      <tr><td><b>Operating Profit</b></td><td class="amount"><b>${fmt(pl_statement?.operating_profit)}</b></td><td class="amount">${pl_statement?.operating_margin_pct || 'N/A'}%</td></tr>
      <tr><td>Tax Expense</td><td class="amount">${fmt(pl_statement?.tax_expense)}</td><td class="amount">—</td></tr>
      <tr><td><b>NET PROFIT</b></td><td class="amount" style="color:${(pl_statement?.net_profit||0)>=0?'#1B5E20':'#B71C1C'}"><b>${fmt(pl_statement?.net_profit)}</b></td><td class="amount">${pl_statement?.net_profit_margin_pct || 'N/A'}%</td></tr>
      <tr><td><b>EBITDA</b></td><td class="amount"><b>${fmt(pl_statement?.ebitda)}</b></td><td class="amount">${pl_statement?.ebitda_margin_pct || 'N/A'}%</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Risk Assessment</div>
    <table>
      <tr><th>Risk</th><th>Severity</th><th>Description</th></tr>
      ${(ai_analysis?.risks || []).map(r => `<tr><td>${r.title}</td><td class="risk-${(r.severity||'').toLowerCase()}">${r.severity}</td><td>${r.description}</td></tr>`).join('')}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Strategic Recommendations</div>
    <table>
      <tr><th>Recommendation</th><th>Impact</th><th>Category</th><th>Description</th></tr>
      ${(ai_analysis?.recommendations || []).map(r => `<tr><td><b>${r.title}</b></td><td>${r.impact}</td><td>${r.category}</td><td>${r.description}</td></tr>`).join('')}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Growth Opportunities</div>
    ${(ai_analysis?.growth_opportunities || []).map(g => `<p style="margin-bottom:8px"><b>${g.title}</b> (${g.potential}) — ${g.description}</p>`).join('')}
  </div>

  <div class="section">
    <div class="section-title">Strategic Roadmap</div>
    ${(ai_analysis?.strategy || []).map((s, i) => `<p style="margin-bottom:8px"><b>${i+1}. [${s.horizon}]</b> ${s.action} — ${s.rationale}</p>`).join('')}
  </div>
</div>
<div class="footer">Generated by AI Financial Analyzer &nbsp;|&nbsp; ${new Date().toLocaleString()}</div>
</body></html>`;
}

export default function ExportPanel({ open, onClose, data }) {
  const [exporting, setExporting] = useState('');
  const [done, setDone] = useState('');

  const exportCSV = () => {
    setExporting('csv');
    setTimeout(() => {
      try {
        const csv = generateCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setDone('csv');
      } finally {
        setExporting('');
      }
    }, 800);
  };

  const exportHTML = () => {
    setExporting('pdf');
    setTimeout(() => {
      try {
        const html = generateHTMLReport(data);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${Date.now()}.html`;
        a.click();
        URL.revokeObjectURL(url);
        setDone('pdf');
      } finally {
        setExporting('');
      }
    }, 800);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <FileDownload color="primary" />
            <Typography variant="h6" fontWeight={700}>Export Report</Typography>
          </Stack>
          <Button onClick={onClose} size="small" sx={{ minWidth: 0 }}><Close /></Button>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          Reports include KPIs, P&L statement, AI recommendations, risk assessment, and strategic roadmap.
        </Alert>
        <Stack spacing={2}>
          <Card
            onClick={!exporting ? exportCSV : undefined}
            sx={{ cursor: 'pointer', border: done === 'csv' ? '2px solid #2E7D32' : '1px solid #E0E0E0', '&:hover': { border: '2px solid #1565C0', background: '#F5F7FA' }, transition: 'all 0.2s' }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TableChart sx={{ fontSize: 36, color: '#1565C0' }} />
                <Box flex={1}>
                  <Typography fontWeight={700}>Excel / CSV Report</Typography>
                  <Typography variant="caption" color="text.secondary">All KPIs, P&L, AI analysis in spreadsheet format</Typography>
                  <Box mt={0.5}>
                    {['KPIs', 'P&L', 'Balance Sheet', 'AI Insights', 'Strategy'].map(tag => (
                      <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, fontSize: 10, height: 18 }} />
                    ))}
                  </Box>
                </Box>
                {exporting === 'csv' ? <CircularProgress size={24} /> : done === 'csv' ? <CheckCircle color="success" /> : <FileDownload color="action" />}
              </Stack>
            </CardContent>
          </Card>

          <Card
            onClick={!exporting ? exportHTML : undefined}
            sx={{ cursor: 'pointer', border: done === 'pdf' ? '2px solid #2E7D32' : '1px solid #E0E0E0', '&:hover': { border: '2px solid #E53935', background: '#FFF5F5' }, transition: 'all 0.2s' }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <PictureAsPdf sx={{ fontSize: 36, color: '#E53935' }} />
                <Box flex={1}>
                  <Typography fontWeight={700}>HTML Report (Print to PDF)</Typography>
                  <Typography variant="caption" color="text.secondary">Formatted report — open and print/save as PDF from browser</Typography>
                  <Box mt={0.5}>
                    {['Executive Summary', 'Charts', 'Full Analysis', 'Printable'].map(tag => (
                      <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, fontSize: 10, height: 18 }} />
                    ))}
                  </Box>
                </Box>
                {exporting === 'pdf' ? <CircularProgress size={24} /> : done === 'pdf' ? <CheckCircle color="success" /> : <FileDownload color="action" />}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
