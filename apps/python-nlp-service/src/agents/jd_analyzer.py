import spacy
from typing import Tuple, List

# Opt for a fallback if the model isn't downloaded yet.
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # We can advise the user to download it during setup, 
    # but for safety in this script we can provide a fallback blank model.
    import warnings
    warnings.warn("spacy 'en_core_web_sm' model not found. Using a fallback deterministic extraction.")
    nlp = None

def _fallback_extract(text: str) -> Tuple[List[str], List[str]]:
    # Very basic naive extraction for MVP without spacy
    words = text.split()
    skills = [w for w in set(words) if len(w) > 4 and w.istitle()]
    keywords = [w for w in set(words) if len(w) > 5]
    return list(set(skills))[:20], list(set(keywords))[:20]

def extract_keywords(jd_text: str) -> Tuple[List[str], List[str]]:
    """
    Extracts key skills and relevant keywords from a job description.
    """
    if nlp is None:
        return _fallback_extract(jd_text)

    doc = nlp(jd_text)
    
    skills = []
    keywords = []
    
    # Heuristic rules for MVP:
    # Organizations, Products, or important Noun Chunks
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT", "LOC"]:
            keywords.append(ent.text)
            
    for chunk in doc.noun_chunks:
        # A simple way to identify 'skills' vs 'keywords' in MVP
        # Without a dedicated skill NER model, noun chunks often contain them.
        if len(chunk.text.split()) <= 3 and chunk.root.pos_ == "NOUN":
            skills.append(chunk.text)

    # De-duplicate and filter
    skills = list(set([s.lower() for s in skills if len(s) > 2]))
    keywords = list(set([k.lower() for k in keywords if len(k) > 2]))
    
    return skills[:30], keywords[:30]
