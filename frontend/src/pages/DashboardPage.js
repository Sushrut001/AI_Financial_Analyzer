import React, { useState } from 'react';
import {
  Box, Container, Typography, Button, Tabs, Tab, Paper,
  Stack, Chip, Divider, useMediaQuery, useTheme, Alert,
  IconButton, Tooltip, Fade
} from '@mui/material';
 

const TABS = [
  { label: 'Overview', icon: <BarChart sx={{ fontSize: 18 }} /> },
  { label: 'P&L Statement', icon: <AccountBalance sx={{ fontSize: 18 }} /> },
  { label: 'Charts', icon: <TrendingUp sx={{ fontSize: 18 }} /> },
  { label: 'AI Insights', icon: <Psychology sx={{ fontSize: 18 }} /> },
];

const HEALTH_COLORS = {
  Excellent: { bg: '#E8F5E9', text: '#1B5E20', border: '#43A047' },
  Good: { bg: '#E3F2FD', text: '#0D47A1', border: '#1976D2' },
  Fair: { bg: '#FFF8E1', text: '#E65100', border: '#FB8C00' },
  Poor: { bg: '#FBE9E7', text: '#BF360C', border: '#E64A19' },
  Critical: { bg: '#FFEBEE', text: '#B71C1C', border: '#E53935' },
};

export default function DashboardPage({ data, onNewAnalysis }) {
  const [tab, setTab] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!data) return null;

  const { kpis, pl_statement, ai_analysis, filename, analyzed_at } = data;
  const health = ai_analysis?.company_health || 'Fair';
  const healthStyle = HEALTH_COLORS[health] || HEALTH_COLORS.Fair;
  const healthScore = ai_analysis?.health_score; 

  const formatDate = (iso) => {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#F5F7FA' }}>
      {/* Top Bar */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 60%, #1976D2 100%)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(13,71,161,0.3)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Container maxWidth="xl">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 1.5 }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Tooltip title="New Analysis">
                <IconButton onClick={onNewAnalysis} sx={{ color: 'rgba(255,255,255,0.8)' }} size="small">
                  <ArrowBack />
                </IconButton>
              </Tooltip>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AutoAwesome sx={{ fontSize: 18, opacity: 0.9 }} />
                  <Typography variant="subtitle1" fontWeight={700} fontFamily='"Plus Jakarta Sans"'>
                    AI Financial Analyzer
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {filename} • {formatDate(analyzed_at)}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                label={`${health}${healthScore ? ` · ${healthScore}/100` : ''}`}
                size="small"
                sx={{
                  background: healthStyle.bg,
                  color: healthStyle.text,
                  border: `1px solid ${healthStyle.border}`,
                  fontWeight: 700,
                  fontSize: 12,
                }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownload />}
                onClick={() => setShowExport(true)}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.4)',
                  '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.1)' },
                  display: { xs: 'none', sm: 'flex' },
                }}
              >
                Export
              </Button>
            </Stack>
          </Stack>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.65)',
                fontWeight: 600,
                fontSize: 13,
                minHeight: 44,
                textTransform: 'none',
                fontFamily: '"Inter", sans-serif',
                '&.Mui-selected': { color: 'white' },
              },
              '& .MuiTabs-indicator': { background: 'white', height: 3, borderRadius: 2 },
            }}
          >
            {TABS.map((t) => (
              <Tab key={t.label} label={t.label} icon={t.icon} iconPosition="start" />
            ))}
          </Tabs>
        </Container>
      </Box>
 
      {/* Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Fade in key={tab}>
          <Box>
            {tab === 0 && <KPICards kpis={kpis} aiAnalysis={ai_analysis} />}
            {tab === 1 && <PLStatement pl={pl_statement} />}
            {tab === 2 && <FinancialCharts kpis={kpis} pl={pl_statement} />}
            {tab === 3 && <AIAnalysis analysis={ai_analysis} kpis={kpis} />}
          </Box>
        </Fade>
      </Container>

      {/* Export Modal */}
      {showExport && (
        <ExportPanel
          open={showExport}
          onClose={() => setShowExport(false)}
          data={data}
        />
      )}
    </Box>
  );
}
