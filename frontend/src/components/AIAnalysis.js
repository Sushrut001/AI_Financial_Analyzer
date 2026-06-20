import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Stack, Chip,
  Accordion, AccordionSummary, AccordionDetails, Alert,
  List, ListItem, ListItemIcon, ListItemText, Divider,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore, Warning, CheckCircle, TrendingUp, Psychology,
  Lightbulb, AttachMoney, Speed, Security, AutoAwesome,
  ErrorOutline, Info, Star, Timeline
} from '@mui/icons-material';

const SEVERITY_COLORS = {
  High: { bg: '#FFEBEE', text: '#B71C1C', border: '#EF5350', icon: <ErrorOutline sx={{ fontSize: 18 }} /> },
  Medium: { bg: '#FFF8E1', text: '#E65100', border: '#FFA726', icon: <Warning sx={{ fontSize: 18 }} /> },
  Low: { bg: '#E8F5E9', text: '#1B5E20', border: '#66BB6A', icon: <Info sx={{ fontSize: 18 }} /> },
};

const IMPACT_COLORS = {
  High: '#1565C0',
  Medium: '#00897B',
  Low: '#7B1FA2',
};

const HEALTH_GRADIENT = {
  Excellent: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
  Good: 'linear-gradient(135deg, #0D47A1, #1565C0)',
  Fair: 'linear-gradient(135deg, #E65100, #FB8C00)',
  Poor: 'linear-gradient(135deg, #BF360C, #D84315)',
  Critical: 'linear-gradient(135deg, #B71C1C, #C62828)',
};

function SectionCard({ title, icon, children, defaultExpanded = true }) {
  return (
    <Accordion defaultExpanded={defaultExpanded} sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
      <AccordionSummary expandIcon={<ExpandMore />} sx={{ borderRadius: 2, minHeight: 56 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ color: 'primary.main' }}>{icon}</Box>
          <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>{children}</AccordionDetails>
    </Accordion>
  );
}

export default function AIAnalysis({ analysis, kpis }) {
  if (!analysis) {
    return (
      <Alert severity="info">No AI analysis available. Please upload a financial statement.</Alert>
    );
  }

  if (analysis.error) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 3 }}>
        <Typography fontWeight={600} mb={0.5}>AI Analysis Unavailable</Typography>
        <Typography variant="body2">{analysis.error}</Typography>
        <Typography variant="caption" mt={1} display="block">
          Rule-based analysis is shown below. Add a Groq API key for enhanced AI insights.
        </Typography>
      </Alert>
    );
  }

  const health = analysis.company_health || 'Fair';
  const score = analysis.health_score || 50;
  const gradient = HEALTH_GRADIENT[health] || HEALTH_GRADIENT.Fair;

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={2}>AI-Powered Financial Analysis</Typography>

      {/* Executive Summary Hero */}
      <Card sx={{ mb: 3, background: gradient, color: 'white', borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                <AutoAwesome sx={{ fontSize: 20 }} />
                <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2 }}>
                  Executive Summary
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ opacity: 0.95, lineHeight: 1.7, mb: 2 }}>
                {analysis.executive_summary}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {(analysis.strengths || []).slice(0, 3).map((s, i) => (
                  <Chip key={i} label={s} size="small" sx={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 500 }} />
                ))}
              </Stack>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Box sx={{
                width: 110, height: 110, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '3px solid rgba(255,255,255,0.4)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 1,
              }}>
                <Typography variant="h3" fontWeight={800} lineHeight={1}>{score}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>/100</Typography>
              </Box>
              <Chip
                label={health}
                sx={{ background: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: 13 }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          {/* Risks */}
          <SectionCard title="Risk Assessment" icon={<Warning />}>
            <Stack spacing={1.5}>
              {(analysis.risks || []).map((risk, i) => {
                const s = SEVERITY_COLORS[risk.severity] || SEVERITY_COLORS.Medium;
                return (
                  <Box key={i} sx={{
                    p: 2, borderRadius: 2,
                    background: s.bg, border: `1px solid ${s.border}`,
                  }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Box sx={{ color: s.text, mt: 0.2 }}>{s.icon}</Box>
                      <Box flex={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight={700} color={s.text}>{risk.title}</Typography>
                          <Chip label={risk.severity} size="small" sx={{ background: s.border, color: 'white', fontWeight: 700, fontSize: 11, height: 20 }} />
                        </Stack>
                        <Typography variant="caption" color={s.text} sx={{ opacity: 0.85 }}>{risk.description}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </SectionCard>

          {/* Recommendations */}
          <SectionCard title="Strategic Recommendations" icon={<Lightbulb />}>
            <Stack spacing={1.5}>
              {(analysis.recommendations || []).map((rec, i) => (
                <Box key={i} sx={{ p: 2, borderRadius: 2, border: '1px solid #E0E0E0', background: '#FAFAFA' }}>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="subtitle2" fontWeight={700}>{rec.title}</Typography>
                    <Stack direction="row" spacing={0.5}>
                      {rec.category && <Chip label={rec.category} size="small" variant="outlined" sx={{ fontSize: 10, height: 18 }} />}
                      {rec.impact && (
                        <Chip
                          label={`${rec.impact} Impact`}
                          size="small"
                          sx={{ background: `${IMPACT_COLORS[rec.impact]}22`, color: IMPACT_COLORS[rec.impact], fontWeight: 700, fontSize: 10, height: 18 }}
                        />
                      )}
                    </Stack>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">{rec.description}</Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>

          {/* Strategy */}
          <SectionCard title="Strategic Roadmap" icon={<Timeline />}>
            <Stack spacing={1.5}>
              {(analysis.strategy || []).map((s, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: i === 0 ? '#E3F2FD' : i === 1 ? '#E8F5E9' : '#F3E5F5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, mt: 0.5,
                  }}>
                    <Typography variant="caption" fontWeight={700} color={i === 0 ? '#1565C0' : i === 1 ? '#2E7D32' : '#7B1FA2'}>
                      {i + 1}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip label={s.horizon} size="small" sx={{ mb: 0.5, fontSize: 11 }} />
                    <Typography variant="subtitle2" fontWeight={700} mb={0.3}>{s.action}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.rationale}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          {/* Growth Opportunities */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <TrendingUp sx={{ color: '#2E7D32' }} />
                <Typography variant="subtitle1" fontWeight={700}>Growth Opportunities</Typography>
              </Stack>
              <Stack spacing={1}>
                {(analysis.growth_opportunities || []).map((opp, i) => (
                  <Box key={i} sx={{ p: 1.5, borderRadius: 2, background: '#F1F8E9', border: '1px solid #C8E6C9' }}>
                    <Stack direction="row" justifyContent="space-between" mb={0.3}>
                      <Typography variant="caption" fontWeight={700} color="#2E7D32">{opp.title}</Typography>
                      {opp.potential && <Chip label={opp.potential} size="small" sx={{ fontSize: 10, height: 16 }} />}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{opp.description}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Cost Optimization */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <AttachMoney sx={{ color: '#E65100' }} />
                <Typography variant="subtitle1" fontWeight={700}>Cost Optimization</Typography>
              </Stack>
              <Stack spacing={1}>
                {(analysis.cost_optimization || []).map((opt, i) => (
                  <Box key={i} sx={{ p: 1.5, borderRadius: 2, background: '#FBE9E7', border: '1px solid #FFCCBC' }}>
                    <Typography variant="caption" fontWeight={700} color="#E65100" display="block" mb={0.3}>{opt.area}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{opt.suggestion}</Typography>
                    {opt.estimated_savings && (
                      <Chip label={`Save: ${opt.estimated_savings}`} size="small" sx={{ mt: 0.5, fontSize: 10, background: '#E65100', color: 'white', height: 18 }} />
                    )}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Revenue Growth Tips */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="primary.main">Revenue Growth</Typography>
              <Stack spacing={0.8}>
                {(analysis.revenue_growth_suggestions || []).map((tip, i) => (
                  <Stack key={i} direction="row" spacing={1}>
                    <Star sx={{ fontSize: 14, color: '#1565C0', mt: 0.3, flexShrink: 0 }} />
                    <Typography variant="caption" color="text.secondary">{tip}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Warnings */}
          {(analysis.risk_warnings || []).length > 0 && (
            <Card sx={{ background: '#FFF8E1', border: '1px solid #FFE082' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <Warning sx={{ color: '#E65100', fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight={700} color="#E65100">Risk Warnings</Typography>
                </Stack>
                <Stack spacing={0.8}>
                  {(analysis.risk_warnings || []).map((w, i) => (
                    <Typography key={i} variant="caption" color="#BF360C" display="block">⚠ {w}</Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
