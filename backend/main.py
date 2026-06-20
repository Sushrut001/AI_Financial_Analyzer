from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import json
import sqlite3
import traceback
from datetime import datetime
from typing import Optional

from file_processor import process_file
from financial_calculator import calculate_kpis, generate_pl_statement
from groq_client import get_ai_analysis
from db import init_db, save_analysis, get_analyses

app = FastAPI(title="AI Financial Statement Analyzer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


@app.get("/")
def root():
    return {"message": "AI Financial Statement Analyzer API", "version": "1.0.0"}


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    ]
    filename = file.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in ["pdf", "xlsx", "xls"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Please upload PDF or Excel (.xlsx) files.",
        )

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="File is empty.")

    try:
        extracted_data = process_file(contents, ext, filename)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to extract financial data: {str(e)}",
        )

    try:
        kpis = calculate_kpis(extracted_data)
        pl_statement = generate_pl_statement(extracted_data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate financial metrics: {str(e)}",
        )

    try:
        ai_analysis = get_ai_analysis(kpis, pl_statement, extracted_data)
    except Exception as e:
        ai_analysis = {
            "error": str(e),
            "executive_summary": "AI analysis unavailable. Please check your Groq API key.",
            "company_health": "N/A",
            "risks": [],
            "recommendations": [],
            "growth_opportunities": [],
            "cost_optimization": [],
            "strategy": [],
        }

    result = {
        "filename": filename,
        "extracted_data": extracted_data,
        "kpis": kpis,
        "pl_statement": pl_statement,
        "ai_analysis": ai_analysis,
        "analyzed_at": datetime.utcnow().isoformat(),
    }

    try:
        analysis_id = save_analysis(filename, result)
        result["id"] = analysis_id
    except Exception:
        result["id"] = None

    return JSONResponse(content=result)


@app.get("/api/analyses")
def list_analyses():
    return get_analyses()


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
