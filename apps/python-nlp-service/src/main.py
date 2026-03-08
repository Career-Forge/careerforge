from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

from agents.jd_analyzer import extract_keywords
from agents.resume_selector import select_bullets

app = FastAPI(title="CareerForge NLP Service")

class JDAnalyzeRequest(BaseModel):
    jd_text: str

class JDAnalyzeResponse(BaseModel):
    skills: List[str]
    keywords: List[str]

class ResumeSelectRequest(BaseModel):
    jd_analysis: dict
    master_bullets: List[str]
    top_k: int = 5

class ResumeSelectResponse(BaseModel):
    selected_bullets: List[str]

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/analyze-jd", response_model=JDAnalyzeResponse)
def analyze_jd(request: JDAnalyzeRequest):
    try:
        skills, keywords = extract_keywords(request.jd_text)
        return JDAnalyzeResponse(skills=skills, keywords=keywords)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/select-bullets", response_model=ResumeSelectResponse)
def resume_selector(request: ResumeSelectRequest):
    try:
        selected = select_bullets(
            jd_analysis=request.jd_analysis,
            master_bullets=request.master_bullets,
            top_k=request.top_k
        )
        return ResumeSelectResponse(selected_bullets=selected)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
