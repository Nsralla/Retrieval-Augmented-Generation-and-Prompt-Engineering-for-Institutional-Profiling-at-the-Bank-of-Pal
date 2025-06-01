# app/core/sentiment.py

from transformers.pipelines import pipeline
from enum import Enum

class SentimentEnum(str, Enum):
    POSITIVE = "Positive"
    NEUTRAL = "Neutral"
    NEGATIVE = "Negative"

# Load the pipeline once at import time
# The default model (multilingual 1–5 star) can be overridden via environment variable if desired.
_sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="nlptown/bert-base-multilingual-uncased-sentiment",
    return_all_scores=False
)

def classify_sentiment(text: str) -> SentimentEnum:
    """
    Run the Hugging Face 'nlptown/bert-base-multilingual-uncased-sentiment' pipeline
    on the first 512 chars of `text`, get a label like "4 stars", then map:
      1–2 stars → NEGATIVE
      3 stars → NEUTRAL
      4–5 stars → POSITIVE
    """
    if not text:
        return SentimentEnum.NEUTRAL

    # Truncate to 512 characters so we don't exceed the model limit
    snippet = text[:512]
    result = _sentiment_pipeline(snippet)[0]  # e.g. { "label": "4 stars", "score": 0.95 }
    label = result["label"]  # "4 stars"
    try:
        num = int(label.split()[0])  # get the integer 4
    except:
        num = 3  # fallback to Neutral

    if num <= 2:
        return SentimentEnum.NEGATIVE
    elif num == 3:
        return SentimentEnum.NEUTRAL
    else:
        return SentimentEnum.POSITIVE
