from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def select_bullets(jd_analysis: dict, master_bullets: List[str], top_k: int = 5) -> List[str]:
    """
    Selects the most relevant bullets from the master resume based on JD analysis
    using TF-IDF cosine similarity.
    """
    if not master_bullets:
        return []

    # Reconstruct a "target document" from the JD analysis
    target_skills = " ".join(jd_analysis.get("skills", []))
    target_keywords = " ".join(jd_analysis.get("keywords", []))
    target_text = f"{target_skills} {target_keywords}"
    
    if not target_text.strip():
        # Fallback if JD analysis empty
        return master_bullets[:min(top_k, len(master_bullets))]

    # Add the target query as the first document
    documents = [target_text] + master_bullets
    
    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = vectorizer.fit_transform(documents)
    except ValueError:
        # Fails if vocabulary is completely empty (e.g. all stop words)
        return master_bullets[:min(top_k, len(master_bullets))]
        
    # Calculate similarity of each bullet (index 1 to N) against target_text (index 0)
    cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    
    # Get indices of top_k most similar bullets
    # argsort sorts in ascending order, so we take the last `top_k` and reverse
    top_indices = cosine_similarities.argsort()[-top_k:][::-1]
    
    selected_bullets = [master_bullets[i] for i in top_indices]
    return selected_bullets
