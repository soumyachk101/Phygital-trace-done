"""
Phygital-Trace AI Anomaly Detection Service
Analyzes environmental sensor fingerprints to detect spoofing, manipulation, or anomalies.
"""

from datetime import datetime
from typing import Any

from anomaly_detector import AnomalyDetector
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


class AnomalyResult(BaseModel):
    anomaly_score: float = Field(ge=0.0, le=1.0)
    anomaly_status: str  # CLEAN | SUSPICIOUS | HIGH_RISK
    triggered_flags: list[str]
    details: dict[str, Any]
    model_version: str = "1.0.0"
    analysis_timestamp: str


class AnalysisRequest(BaseModel):
    fingerprint: dict[str, Any]


app = FastAPI(title="Phygital-Trace AI Service")
detector = AnomalyDetector()


@app.post("/analyze", response_model=AnomalyResult)
async def analyze(request: AnalysisRequest) -> AnomalyResult:
    try:
        result = detector.analyze(request.fingerprint)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    return AnomalyResult(
        anomaly_score=result["anomaly_score"],
        anomaly_status=result["anomaly_status"],
        triggered_flags=result["triggered_flags"],
        details=result["details"],
        model_version="1.0.0",
        analysis_timestamp=datetime.now(datetime.timezone.utc).isoformat(),
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-anomaly-detector", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
