import os
import json
import requests
from typing import Dict, Any

# Load environment variables from a .env file when present
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    # If python-dotenv is not installed or .env is absent, continue and rely on environment
    pass

# Read Groq credentials from environment variables. Use sensible defaults for URL/model.
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_API_URL = os.environ.get("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama3-70b-8192")


def format_currency(value):
    if value is None:
        return "N/A"
    try:
        v = float(value)
        if abs(v) >= 1_000_000:
            return f"${v/1_000_000:.2f}M"
        elif abs(v) >= 1_000:
            return f"${v/1_000:.1f}K"
        return f"${v:.2f}"
    except Exception:
        return str(value)


def build_prompt(kpis: Dict, pl: Dict, raw: Dict) -> str:
    return f"""You are a senior financial analyst and business strategist. Analyze the following company financial data and provide a comprehensive, actionable report.

## FINANCIAL DATA

### Key Performance Indicators
- Revenue: {format_currency(kpis.get('revenue'))}
- Gross Profit: {format_currency(kpis.get('gross_profit'))}
- Net Profit: {format_currency(kpis.get('net_profit'))}
- EBITDA: {format_currency(kpis.get('ebitda'))}
- Gross Margin: {kpis.get('gross_margin', 'N/A')}%
- Net Profit Margin: {kpis.get('net_profit_margin', 'N/A')}%
- Operating Margin: {kpis.get('operating_margin', 'N/A')}%
- Current Ratio: {kpis.get('current_ratio', 'N/A')}
- Quick Ratio: {kpis.get('quick_ratio', 'N/A')}
- Debt Ratio: {kpis.get('debt_ratio', 'N/A')}%
- Debt-to-Equity: {kpis.get('debt_to_equity', 'N/A')}
- ROA: {kpis.get('roa', 'N/A')}%
- ROE: {kpis.get('roe', 'N/A')}%
- ROI: {kpis.get('roi', 'N/A')}%
- Cash Flow Health Score: {kpis.get('cash_flow_health_score', 'N/A')}/100
- Working Capital: {format_currency(kpis.get('working_capital'))}
- Free Cash Flow: {format_currency(kpis.get('free_cash_flow'))}

### P&L Statement
- Revenue: {format_currency(pl.get('revenue'))}
- Cost of Goods Sold: {format_currency(pl.get('cost_of_goods_sold'))}
- Gross Profit: {format_currency(pl.get('gross_profit'))} ({pl.get('gross_margin_pct', 'N/A')}%)
- Operating Expenses: {format_currency(pl.get('operating_expenses'))}
- Operating Profit: {format_currency(pl.get('operating_profit'))} ({pl.get('operating_margin_pct', 'N/A')}%)
- Interest Expense: {format_currency(pl.get('interest_expense'))}
- Tax Expense: {format_currency(pl.get('tax_expense'))}
- Net Profit: {format_currency(pl.get('net_profit'))} ({pl.get('net_profit_margin_pct', 'N/A')}%)

### Balance Sheet
- Total Assets: {format_currency(kpis.get('total_assets'))}
- Total Liabilities: {format_currency(kpis.get('total_liabilities'))}
- Equity: {format_currency(kpis.get('equity'))}
- Cash & Equivalents: {format_currency(kpis.get('cash_and_equivalents'))}

### Cash Flow
- Operating Cash Flow: {format_currency(kpis.get('operating_cash_flow'))}
- Investing Cash Flow: {format_currency(kpis.get('investing_cash_flow'))}
- Financing Cash Flow: {format_currency(kpis.get('financing_cash_flow'))}

Provide your analysis as a JSON object with EXACTLY this structure (no markdown, pure JSON):

{{
  "executive_summary": "2-3 sentence overview of the company's financial health",
  "company_health": "Excellent|Good|Fair|Poor|Critical",
  "health_score": 75,
  "risks": [
    {{"title": "Risk name", "description": "Detailed description", "severity": "High|Medium|Low"}}
  ],
  "recommendations": [
    {{"title": "Recommendation title", "description": "Specific actionable advice", "impact": "High|Medium|Low", "category": "Cost|Revenue|Operations|Finance"}}
  ],
  "growth_opportunities": [
    {{"title": "Opportunity", "description": "How to capture it", "potential": "High|Medium|Low"}}
  ],
  "cost_optimization": [
    {{"area": "Area name", "suggestion": "Specific suggestion", "estimated_savings": "X% of costs"}}
  ],
  "strategy": [
    {{"horizon": "Short-term (0-6 months)|Medium-term (6-18 months)|Long-term (18+ months)", "action": "Strategic action", "rationale": "Why this matters"}}
  ],
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "revenue_growth_suggestions": ["Suggestion 1", "Suggestion 2"],
  "cash_flow_tips": ["Tip 1", "Tip 2"],
  "investment_suggestions": ["Suggestion 1", "Suggestion 2"],
  "risk_warnings": ["Warning 1", "Warning 2"],
  "expansion_opportunities": ["Opportunity 1", "Opportunity 2"]
}}

Be specific, data-driven, and actionable. Base every insight directly on the numbers provided."""


def get_ai_analysis(kpis: Dict, pl: Dict, raw: Dict) -> Dict[str, Any]:
    if not GROQ_API_KEY:
        return _generate_rule_based_analysis(kpis, pl)

    prompt = build_prompt(kpis, pl, raw)

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a senior financial analyst. Always respond with valid JSON only, no markdown formatting, no code blocks.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 3000,
    }

    response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=60)

    if response.status_code != 200:
        raise Exception(f"Groq API error {response.status_code}: {response.text}")

    data = response.json()
    content = data["choices"][0]["message"]["content"].strip()

    # Strip markdown code fences if present
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()

    return json.loads(content)


def _generate_rule_based_analysis(kpis: Dict, pl: Dict) -> Dict[str, Any]:
    """Fallback rule-based analysis when no API key is present."""
    revenue = kpis.get("revenue") or 0
    net_profit = kpis.get("net_profit") or 0
    gross_margin = kpis.get("gross_margin") or 0
    net_margin = kpis.get("net_profit_margin") or 0
    current_ratio = kpis.get("current_ratio") or 0
    debt_ratio = kpis.get("debt_ratio") or 0
    roe = kpis.get("roe") or 0
    cf_score = kpis.get("cash_flow_health_score") or 50

    # Determine health
    health_score = 50
    if net_profit > 0:
        health_score += 15
    if gross_margin > 30:
        health_score += 10
    if current_ratio > 1.5:
        health_score += 10
    if debt_ratio < 50:
        health_score += 10
    if roe > 15:
        health_score += 5
    health_score = min(100, max(0, health_score))

    if health_score >= 80:
        company_health = "Excellent"
    elif health_score >= 65:
        company_health = "Good"
    elif health_score >= 45:
        company_health = "Fair"
    elif health_score >= 25:
        company_health = "Poor"
    else:
        company_health = "Critical"

    risks = []
    if debt_ratio > 70:
        risks.append({"title": "High Debt Burden", "description": f"Debt ratio of {debt_ratio}% indicates significant leverage risk.", "severity": "High"})
    if current_ratio < 1.0:
        risks.append({"title": "Liquidity Risk", "description": f"Current ratio of {current_ratio} suggests potential short-term cash flow issues.", "severity": "High"})
    if net_margin < 5:
        risks.append({"title": "Low Profit Margin", "description": f"Net margin of {net_margin}% leaves little buffer for downturns.", "severity": "Medium"})

    return {
        "executive_summary": f"The company shows {company_health.lower()} financial health with a health score of {health_score}/100. Revenue stands at {format_currency(revenue)} with a net profit margin of {net_margin}%. {'Profitability is positive.' if net_profit > 0 else 'The company is operating at a loss.'}",
        "company_health": company_health,
        "health_score": health_score,
        "risks": risks or [{"title": "Market Risk", "description": "General market volatility may impact revenue.", "severity": "Low"}],
        "recommendations": [
            {"title": "Optimize Operating Costs", "description": "Review operating expenses for efficiency gains and eliminate non-essential spending.", "impact": "High", "category": "Cost"},
            {"title": "Improve Cash Collection", "description": "Tighten accounts receivable cycles to improve cash flow.", "impact": "Medium", "category": "Finance"},
            {"title": "Diversify Revenue Streams", "description": "Explore new product lines or market segments to reduce revenue concentration risk.", "impact": "High", "category": "Revenue"},
        ],
        "growth_opportunities": [
            {"title": "Market Expansion", "description": "Target adjacent markets or geographies to drive top-line growth.", "potential": "High"},
            {"title": "Product Innovation", "description": "Invest in R&D to develop higher-margin offerings.", "potential": "Medium"},
        ],
        "cost_optimization": [
            {"area": "Operating Expenses", "suggestion": "Benchmark operating costs against industry peers and identify 10-15% reduction opportunities.", "estimated_savings": "10-15% of OpEx"},
            {"area": "Supply Chain", "suggestion": "Renegotiate supplier contracts and optimize inventory levels.", "estimated_savings": "5-8% of COGS"},
        ],
        "strategy": [
            {"horizon": "Short-term (0-6 months)", "action": "Stabilize cash flow and reduce high-interest debt.", "rationale": "Improves financial resilience."},
            {"horizon": "Medium-term (6-18 months)", "action": "Invest in sales and marketing to drive revenue growth.", "rationale": "Scales top-line sustainably."},
            {"horizon": "Long-term (18+ months)", "action": "Pursue strategic partnerships or acquisitions.", "rationale": "Accelerates market position."},
        ],
        "strengths": ["Established revenue base", "Ongoing operations generating cash"],
        "weaknesses": ["Margin improvement needed" if net_margin < 10 else "Cost structure is competitive", "Debt management required" if debt_ratio > 50 else "Healthy leverage"],
        "revenue_growth_suggestions": ["Launch targeted marketing campaigns", "Expand into new customer segments", "Upsell and cross-sell to existing customers"],
        "cash_flow_tips": ["Accelerate invoice collection", "Negotiate extended payment terms with suppliers", "Reduce capital expenditure where possible"],
        "investment_suggestions": ["Reinvest profits into high-ROI marketing", "Upgrade technology infrastructure for efficiency", "Consider dividend or buyback if excess cash"],
        "risk_warnings": ["Monitor debt covenants closely" if debt_ratio > 60 else "Maintain current leverage discipline", "Watch for margin compression from inflation"],
        "expansion_opportunities": ["Geographic expansion", "Digital transformation initiatives", "Strategic acquisitions of complementary businesses"],
    }
