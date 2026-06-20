import io
import re
import pandas as pd
import pdfplumber
from typing import Dict, Any, Optional


FINANCIAL_KEYWORDS = {
    "revenue": [
        "revenue", "total revenue", "net revenue", "sales", "total sales",
        "operating revenue", "net sales", "turnover", "income from operations"
    ],
    "operating_revenue": [
        "operating revenue", "revenue from operations", "operating income",
        "operating sales"
    ],
    "cost_of_goods_sold": [
        "cost of goods sold", "cogs", "cost of sales", "cost of revenue",
        "cost of products", "direct costs", "cost of services"
    ],
    "gross_profit": [
        "gross profit", "gross income", "gross margin", "gross earnings"
    ],
    "operating_expenses": [
        "operating expenses", "operating costs", "opex", "total operating expenses",
        "selling general administrative", "sg&a", "general and administrative"
    ],
    "net_profit": [
        "net profit", "net income", "net earnings", "profit after tax",
        "net profit after tax", "net loss", "profit for the year", "net income after tax"
    ],
    "ebitda": ["ebitda", "earnings before interest tax depreciation amortization"],
    "total_assets": [
        "total assets", "assets total", "sum of assets"
    ],
    "current_assets": [
        "current assets", "total current assets", "short-term assets"
    ],
    "non_current_assets": [
        "non-current assets", "noncurrent assets", "long-term assets", "fixed assets"
    ],
    "total_liabilities": [
        "total liabilities", "liabilities total", "sum of liabilities",
        "total debt and liabilities"
    ],
    "current_liabilities": [
        "current liabilities", "total current liabilities", "short-term liabilities",
        "current portion"
    ],
    "non_current_liabilities": [
        "non-current liabilities", "noncurrent liabilities", "long-term liabilities",
        "long term debt"
    ],
    "equity": [
        "total equity", "shareholders equity", "stockholders equity",
        "owner equity", "net worth", "total shareholders equity",
        "total stockholders equity"
    ],
    "cash_and_equivalents": [
        "cash and cash equivalents", "cash equivalents", "cash and bank",
        "cash on hand", "cash"
    ],
    "operating_cash_flow": [
        "operating cash flow", "cash from operations", "net cash from operating",
        "cash flows from operating activities", "net cash provided by operating"
    ],
    "investing_cash_flow": [
        "investing cash flow", "cash from investing", "net cash from investing",
        "cash flows from investing activities"
    ],
    "financing_cash_flow": [
        "financing cash flow", "cash from financing", "net cash from financing",
        "cash flows from financing activities"
    ],
    "depreciation": [
        "depreciation", "depreciation and amortization", "d&a"
    ],
    "interest_expense": [
        "interest expense", "interest cost", "finance cost", "finance charges"
    ],
    "tax_expense": [
        "income tax", "tax expense", "provision for taxes", "income tax expense"
    ],
    "total_debt": [
        "total debt", "long term debt", "short term debt", "borrowings",
        "loans and advances", "total borrowings"
    ],
    "investments": [
        "investments", "total investments", "investment in securities",
        "financial investments"
    ],
    "inventory": [
        "inventory", "inventories", "stock", "merchandise"
    ],
    "accounts_receivable": [
        "accounts receivable", "trade receivables", "debtors", "receivables"
    ],
    "accounts_payable": [
        "accounts payable", "trade payables", "creditors", "payables"
    ],
}


def clean_number(value: Any) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    s = str(value).strip()
    s = s.replace(",", "").replace("$", "").replace("₹", "").replace("€", "")
    s = s.replace("(", "-").replace(")", "")
    s = s.replace("–", "-").replace("—", "-")
    # Remove trailing/leading text like "Cr" "M" "B" "K"
    multiplier = 1
    if s.lower().endswith("b"):
        multiplier = 1_000_000_000
        s = s[:-1]
    elif s.lower().endswith("m"):
        multiplier = 1_000_000
        s = s[:-1]
    elif s.lower().endswith("k"):
        multiplier = 1_000
        s = s[:-1]
    try:
        return float(s) * multiplier
    except (ValueError, TypeError):
        return None


def match_keyword(text: str, keywords: list) -> bool:
    text_lower = text.lower().strip()
    for kw in keywords:
        if kw in text_lower:
            return True
    return False


def extract_from_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    extracted = {}
    # Try to find label-value patterns
    for _, row in df.iterrows():
        for col_idx, cell in enumerate(row):
            if cell is None or pd.isna(cell) if not isinstance(cell, str) else False:
                continue
            cell_str = str(cell).strip()
            if len(cell_str) < 2:
                continue
            for field, keywords in FINANCIAL_KEYWORDS.items():
                if field in extracted:
                    continue
                if match_keyword(cell_str, keywords):
                    # Look for a number in the same row
                    for val in list(row)[col_idx + 1:col_idx + 5]:
                        num = clean_number(val)
                        if num is not None:
                            extracted[field] = num
                            break
    return extracted


def process_excel(contents: bytes) -> Dict[str, Any]:
    extracted = {}
    xls = pd.ExcelFile(io.BytesIO(contents))
    for sheet_name in xls.sheet_names:
        df = xls.parse(sheet_name, header=None)
        sheet_data = extract_from_dataframe(df)
        for k, v in sheet_data.items():
            if k not in extracted:
                extracted[k] = v
    return extracted


def extract_numbers_from_text(text: str) -> Dict[str, Any]:
    extracted = {}
    lines = text.split("\n")
    for line in lines:
        line_clean = line.strip()
        if len(line_clean) < 3:
            continue
        for field, keywords in FINANCIAL_KEYWORDS.items():
            if field in extracted:
                continue
            if match_keyword(line_clean, keywords):
                # Find numbers in the line
                numbers = re.findall(
                    r"[-]?\(?\d[\d,]*\.?\d*\)?(?:\s?(?:billion|million|thousand|B|M|K))?",
                    line_clean
                )
                for n in numbers:
                    num = clean_number(n)
                    if num is not None and abs(num) > 0:
                        extracted[field] = num
                        break
    return extracted


def process_pdf(contents: bytes) -> Dict[str, Any]:
    extracted = {}
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        for page in pdf.pages:
            # Try table extraction
            tables = page.extract_tables()
            for table in tables:
                if not table:
                    continue
                df = pd.DataFrame(table)
                table_data = extract_from_dataframe(df)
                for k, v in table_data.items():
                    if k not in extracted:
                        extracted[k] = v
            # Also try text
            text = page.extract_text() or ""
            text_data = extract_numbers_from_text(text)
            for k, v in text_data.items():
                if k not in extracted:
                    extracted[k] = v
    return extracted


def generate_synthetic_data() -> Dict[str, Any]:
    """Generate plausible demo data when extraction yields nothing useful."""
    return {
        "revenue": 5_000_000,
        "operating_revenue": 4_800_000,
        "cost_of_goods_sold": 2_500_000,
        "gross_profit": 2_500_000,
        "operating_expenses": 1_200_000,
        "net_profit": 800_000,
        "total_assets": 8_000_000,
        "current_assets": 3_000_000,
        "non_current_assets": 5_000_000,
        "total_liabilities": 3_500_000,
        "current_liabilities": 1_500_000,
        "non_current_liabilities": 2_000_000,
        "equity": 4_500_000,
        "cash_and_equivalents": 600_000,
        "operating_cash_flow": 900_000,
        "investing_cash_flow": -400_000,
        "financing_cash_flow": -200_000,
        "depreciation": 300_000,
        "interest_expense": 150_000,
        "tax_expense": 200_000,
        "total_debt": 2_000_000,
        "investments": 500_000,
        "inventory": 800_000,
        "accounts_receivable": 900_000,
        "accounts_payable": 600_000,
        "_synthetic": True,
    }


def process_file(contents: bytes, ext: str, filename: str) -> Dict[str, Any]:
    if ext in ["xlsx", "xls"]:
        data = process_excel(contents)
    elif ext == "pdf":
        data = process_pdf(contents)
    else:
        raise ValueError(f"Unsupported file extension: {ext}")

    # If we couldn't extract meaningful data, use demo data
    meaningful_fields = [k for k, v in data.items() if v is not None and v != 0]
    if len(meaningful_fields) < 3:
        data = generate_synthetic_data()
        data["_extraction_note"] = (
            "Limited data extracted from file. Sample data shown for demonstration."
        )

    # Derive missing values where possible
    if "gross_profit" not in data and "revenue" in data and "cost_of_goods_sold" in data:
        data["gross_profit"] = data["revenue"] - data["cost_of_goods_sold"]

    if "net_profit" not in data and "gross_profit" in data and "operating_expenses" in data:
        interest = data.get("interest_expense", 0) or 0
        tax = data.get("tax_expense", 0) or 0
        data["net_profit"] = data["gross_profit"] - data["operating_expenses"] - interest - tax

    if "equity" not in data and "total_assets" in data and "total_liabilities" in data:
        data["equity"] = data["total_assets"] - data["total_liabilities"]

    return data
