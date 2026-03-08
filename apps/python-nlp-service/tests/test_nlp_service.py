import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_analyze_jd_fallback():
    # Test with simple fallback extraction if spacy not loaded,
    # or basic extraction if it is.
    sample_jd = "Looking for a Senior Software Engineer with strong Python and React skills. Experience with Kubernetes is a plus."
    response = client.post(
        "/analyze-jd",
        json={"jd_text": sample_jd}
    )
    assert response.status_code == 200
    data = response.json()
    assert "skills" in data
    assert "keywords" in data
    assert isinstance(data["skills"], list)
    assert isinstance(data["keywords"], list)

def test_select_bullets():
    jd_analysis = {
        "skills": ["python", "react"],
        "keywords": ["senior", "engineer", "kubernetes"]
    }
    master_bullets = [
        "Developed a responsive frontend using React and Redux.",
        "Managed a team of 5 marketing professionals.",
        "Built robust backend APIs using Python and FastAPI.",
        "Deployed microservices to Kubernetes clusters.",
        "Designed UI/UX mockups using Figma."
    ]
    response = client.post(
        "/select-bullets",
        json={
            "jd_analysis": jd_analysis,
            "master_bullets": master_bullets,
            "top_k": 3
        }
    )
    assert response.status_code == 200
    data = response.json()
    selected = data["selected_bullets"]
    
    assert len(selected) == 3
    # The selected bullets should likely contain the ones matching python, react, kubernetes
    assert any("React" in bullet for bullet in selected)
    assert any("Python" in bullet for bullet in selected)
    assert any("Kubernetes" in bullet for bullet in selected)
