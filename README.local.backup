# AI Financial Statement Analyzer

A production-ready web application that extracts financial data from PDF/Excel statements, calculates KPIs, generates P&L reports, and provides AI-powered business recommendations via Groq LLM.

---

## Features

- **File Upload**: PDF and Excel (.xlsx) with drag-and-drop support
- **Data Extraction**: Revenue, COGS, Gross Profit, Net Profit, Assets, Liabilities, Equity, Cash Flow, and more
- **Financial Dashboard**: 12+ KPIs including Gross Margin, Net Margin, ROE, ROA, Current Ratio, Debt Ratio, EBITDA, CF Health Score
- **Interactive Charts**: Revenue trend, Expense breakdown, Asset vs Liability, Cash Flow, Radar chart
- **P&L Statement**: Auto-generated with margin analysis
- **AI Financial Advisor**: Powered by Groq LLM (or rule-based fallback)
- **Export Reports**: CSV/Excel and HTML (print to PDF) reports
- **Material Design 3**: Modern, responsive UI

---

## Project Structure

```
app/
├── backend/
│   ├── main.py               # FastAPI app
│   ├── file_processor.py     # PDF + Excel parsing
│   ├── financial_calculator.py # KPI + P&L calculations
│   ├── groq_client.py        # Groq AI integration
│   ├── db.py                 # SQLite storage
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/
│   │   │   ├── UploadPage.js
│   │   │   └── DashboardPage.js
│   │   └── components/
│   │       ├── KPICards.js
│   │       ├── FinancialCharts.js
│   │       ├── PLStatement.js
│   │       ├── AIAnalysis.js
│   │       └── ExportPanel.js
│   └── package.json
└── start.sh
```

---

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
# Optional: Set Groq API key for AI analysis
export GROQ_API_KEY=gsk_your_key_here
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend

```bash
cd frontend
npm install --legacy-peer-deps
REACT_APP_API_URL=http://localhost:8000 npm start
# Or build for production:
REACT_APP_API_URL=http://localhost:8000 npm run build
npx serve -s build -p 3000
```

---

## Configuration

| Variable | Description | Default |
|---|---|---|
| `GROQ_API_KEY` | Groq API key for AI analysis | (rule-based fallback) |
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:8000` |
| `DB_PATH` | SQLite database path | `/tmp/financial_analyzer.db` |

### Getting a Groq API Key (Free)
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up and create an API key
3. Set `GROQ_API_KEY` environment variable OR enter it in the app's API Key field

---

## Supported File Formats

### Excel (.xlsx)
- Any Excel file with labeled rows (Label in col A, Value in col B)
- Recognizes 100+ keyword variations for each financial field
- Multi-sheet support

### PDF
- Table-based PDFs (annual reports, quarterly filings)
- Text-based financial statements
- Uses pdfplumber for robust extraction

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload` | Upload and analyze financial file |
| GET | `/api/analyses` | List recent analyses |
| GET | `/health` | Health check |

### Upload Response Schema

```json
{
  "filename": "report.xlsx",
  "extracted_data": { "revenue": 5000000, "net_profit": 800000, ... },
  "kpis": {
    "gross_margin": 52.0,
    "net_profit_margin": 22.4,
    "current_ratio": 2.33,
    "roe": 28.0,
    "cash_flow_health_score": 85,
    ...
  },
  "pl_statement": {
    "revenue": 5000000,
    "gross_profit": 2600000,
    "net_profit": 800000,
    ...
  },
  "ai_analysis": {
    "executive_summary": "...",
    "company_health": "Good",
    "health_score": 75,
    "risks": [...],
    "recommendations": [...],
    "growth_opportunities": [...],
    "strategy": [...]
  }
}
```

---

## Tech Stack

**Backend**: FastAPI, Python, pandas, pdfplumber, openpyxl, SQLite  
**Frontend**: React 18, Material UI 5, Recharts, Axios  
**AI**: Groq LLM API (llama3-70b) with rule-based fallback

---

## Production Deployment

```bash
# Build frontend
cd frontend && npm run build

# Run backend with production settings
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Serve frontend with nginx or:
npx serve -s frontend/build -p 3000
```

For Docker deployment, add a `Dockerfile` and `docker-compose.yml` as needed.
