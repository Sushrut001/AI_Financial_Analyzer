from typing import Dict, Any, Optional


def safe_div(numerator, denominator, default=None):
    try:
        if denominator is None or denominator == 0:
            return default
        return numerator / denominator
    except Exception:
        return default


def pct(value, default=None):
    if value is None:
        return default
    return round(value * 100, 2)


def fmt(value, decimals=2):
    if value is None:
        return None
    return round(float(value), decimals)


def calculate_kpis(data: Dict[str, Any]) -> Dict[str, Any]:
    revenue = data.get("revenue")
    operating_revenue = data.get("operating_revenue") or revenue
    gross_profit = data.get("gross_profit")
    net_profit = data.get("net_profit")
    operating_expenses = data.get("operating_expenses")
    cogs = data.get("cost_of_goods_sold")
    total_assets = data.get("total_assets")
    current_assets = data.get("current_assets")
    non_current_assets = data.get("non_current_assets")
    total_liabilities = data.get("total_liabilities")
    current_liabilities = data.get("current_liabilities")
    non_current_liabilities = data.get("non_current_liabilities")
    equity = data.get("equity")
    cash = data.get("cash_and_equivalents")
    operating_cf = data.get("operating_cash_flow")
    investing_cf = data.get("investing_cash_flow")
    financing_cf = data.get("financing_cash_flow")
    depreciation = data.get("depreciation", 0) or 0
    interest_expense = data.get("interest_expense", 0) or 0
    tax_expense = data.get("tax_expense", 0) or 0
    total_debt = data.get("total_debt")
    investments = data.get("investments")
    inventory = data.get("inventory")
    accounts_receivable = data.get("accounts_receivable")
    accounts_payable = data.get("accounts_payable")

    # EBITDA
    ebitda = None
    if net_profit is not None:
        ebitda = net_profit + interest_expense + tax_expense + depreciation

    # Gross Margin
    gross_margin = pct(safe_div(gross_profit, revenue))

    # Net Profit Margin
    net_profit_margin = pct(safe_div(net_profit, revenue))

    # Operating Margin
    operating_profit = None
    if gross_profit is not None and operating_expenses is not None:
        operating_profit = gross_profit - operating_expenses
    operating_margin = pct(safe_div(operating_profit, revenue))

    # Current Ratio
    current_ratio = fmt(safe_div(current_assets, current_liabilities))

    # Quick Ratio
    quick_assets = (current_assets or 0) - (inventory or 0)
    quick_ratio = fmt(safe_div(quick_assets, current_liabilities))

    # Debt Ratio
    debt_ratio = pct(safe_div(total_liabilities, total_assets))

    # Debt-to-Equity
    debt_to_equity = fmt(safe_div(total_liabilities, equity))

    # ROA
    roa = pct(safe_div(net_profit, total_assets))

    # ROE
    roe = pct(safe_div(net_profit, equity))

    # ROI (using net_profit / total_assets as proxy)
    roi = pct(safe_div(net_profit, (total_assets or 0) - (total_liabilities or 0)))

    # Asset Turnover
    asset_turnover = fmt(safe_div(revenue, total_assets))

    # Inventory Turnover
    inventory_turnover = fmt(safe_div(cogs, inventory))

    # Cash Flow Health Score (0-100)
    cf_score = None
    if operating_cf is not None:
        score = 50
        if operating_cf > 0:
            score += 20
        if revenue and operating_cf / revenue > 0.1:
            score += 15
        if investing_cf and investing_cf < 0:
            score += 10  # Investing in growth
        if financing_cf is not None:
            score += 5
        cf_score = min(100, max(0, score))

    # Free Cash Flow
    free_cash_flow = None
    if operating_cf is not None and investing_cf is not None:
        free_cash_flow = operating_cf + investing_cf

    # Interest Coverage
    ebit = None
    if net_profit is not None:
        ebit = net_profit + interest_expense + tax_expense
    interest_coverage = fmt(safe_div(ebit, interest_expense)) if interest_expense else None

    # Working Capital
    working_capital = None
    if current_assets is not None and current_liabilities is not None:
        working_capital = current_assets - current_liabilities

    return {
        "revenue": fmt(revenue),
        "operating_revenue": fmt(operating_revenue),
        "gross_profit": fmt(gross_profit),
        "net_profit": fmt(net_profit),
        "ebitda": fmt(ebitda),
        "operating_profit": fmt(operating_profit),
        "gross_margin": gross_margin,
        "net_profit_margin": net_profit_margin,
        "operating_margin": operating_margin,
        "current_ratio": current_ratio,
        "quick_ratio": quick_ratio,
        "debt_ratio": debt_ratio,
        "debt_to_equity": debt_to_equity,
        "roa": roa,
        "roe": roe,
        "roi": roi,
        "asset_turnover": asset_turnover,
        "inventory_turnover": inventory_turnover,
        "interest_coverage": interest_coverage,
        "cash_flow_health_score": cf_score,
        "free_cash_flow": fmt(free_cash_flow),
        "working_capital": fmt(working_capital),
        "total_assets": fmt(total_assets),
        "total_liabilities": fmt(total_liabilities),
        "equity": fmt(equity),
        "cash_and_equivalents": fmt(cash),
        "operating_cash_flow": fmt(operating_cf),
        "investing_cash_flow": fmt(investing_cf),
        "financing_cash_flow": fmt(financing_cf),
        "total_debt": fmt(total_debt),
        "investments": fmt(investments),
        "current_assets": fmt(current_assets),
        "current_liabilities": fmt(current_liabilities),
        "non_current_assets": fmt(non_current_assets),
        "non_current_liabilities": fmt(non_current_liabilities),
    }


def generate_pl_statement(data: Dict[str, Any]) -> Dict[str, Any]:
    revenue = data.get("revenue", 0) or 0
    operating_revenue = data.get("operating_revenue") or revenue
    cogs = data.get("cost_of_goods_sold", 0) or 0
    gross_profit = data.get("gross_profit")
    if gross_profit is None:
        gross_profit = revenue - cogs

    operating_expenses = data.get("operating_expenses", 0) or 0
    operating_profit = gross_profit - operating_expenses

    interest_expense = data.get("interest_expense", 0) or 0
    other_income = data.get("other_income", 0) or 0
    ebt = operating_profit - interest_expense + other_income

    tax_expense = data.get("tax_expense", 0) or 0
    if tax_expense == 0 and ebt > 0:
        # Estimate 25% tax
        tax_expense = ebt * 0.25

    net_profit = data.get("net_profit")
    if net_profit is None:
        net_profit = ebt - tax_expense

    depreciation = data.get("depreciation", 0) or 0
    ebitda = net_profit + interest_expense + tax_expense + depreciation

    return {
        "revenue": fmt(revenue),
        "operating_revenue": fmt(operating_revenue),
        "cost_of_goods_sold": fmt(cogs),
        "gross_profit": fmt(gross_profit),
        "gross_margin_pct": pct(safe_div(gross_profit, revenue)),
        "operating_expenses": fmt(operating_expenses),
        "operating_profit": fmt(operating_profit),
        "operating_margin_pct": pct(safe_div(operating_profit, revenue)),
        "interest_expense": fmt(interest_expense),
        "other_income": fmt(other_income),
        "earnings_before_tax": fmt(ebt),
        "tax_expense": fmt(tax_expense),
        "net_profit": fmt(net_profit),
        "net_profit_margin_pct": pct(safe_div(net_profit, revenue)),
        "depreciation": fmt(depreciation),
        "ebitda": fmt(ebitda),
        "ebitda_margin_pct": pct(safe_div(ebitda, revenue)),
    }


def fmt(value, decimals=2):
    if value is None:
        return None
    try:
        return round(float(value), decimals)
    except Exception:
        return None


def pct(value, default=None):
    if value is None:
        return default
    return round(value * 100, 2)


def safe_div(numerator, denominator, default=None):
    try:
        if denominator is None or denominator == 0:
            return default
        return numerator / denominator
    except Exception:
        return default
