import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { alpha } from '@mui/material/styles';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1565C0', light: '#1976D2', dark: '#0D47A1', contrastText: '#fff' },
    secondary: { main: '#00897B', light: '#26A69A', dark: '#00695C', contrastText: '#fff' },
    success: { main: '#2E7D32', light: '#43A047', dark: '#1B5E20' },
    warning: { main: '#E65100', light: '#FB8C00', dark: '#BF360C' },
    error: { main: '#C62828', light: '#E53935', dark: '#B71C1C' },
    info: { main: '#0277BD', light: '#0288D1', dark: '#01579B' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
    text: { primary: '#0D1B2A', secondary: '#4A5568' },
  },
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", sans-serif',
    h1: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0,0,0,0.08), 0px 4px 16px rgba(0,0,0,0.04)',
          borderRadius: 16,
          border: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 10 },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
          boxShadow: '0px 4px 14px rgba(21,101,192,0.3)',
          '&:hover': { boxShadow: '0px 6px 20px rgba(21,101,192,0.4)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

export default function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [view, setView] = useState('upload'); // 'upload' | 'dashboard'

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setView('dashboard');
  };

  const handleNewAnalysis = () => {
    setAnalysisData(null);
    setView('upload');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {view === 'upload' ? (
        <UploadPage onAnalysisComplete={handleAnalysisComplete} />
      ) : (
        <DashboardPage data={analysisData} onNewAnalysis={handleNewAnalysis} />
      )}
    </ThemeProvider>
  );
}
