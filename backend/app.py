import os
import json
import torch
import requests
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends, Query, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.core.sentiment import SentimentEnum, classify_sentiment

from .database import engine, SessionLocal, Base
from .models import User, Chat, Message
from .schemas import (
    ReviewIn, ReviewOut, UserCreate, UserResponse,
    ChatResponse,
    MessageInput, MessageResponse,
    AskRequest, AskResponse
)
from .security import hash_password, verify_password
from .auth import create_access_token, verify_token
from .query_handle import QueryPipeline
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from pydantic_settings import BaseSettings

# ─── locate backend folder and data/index paths ─────────────────────────────────
BACKEND_DIR = Path(__file__).resolve().parent
DATA_PATH   = BACKEND_DIR / "scraped_data" / "bop_website_cleaned.json"
INDEX_DIR   = BACKEND_DIR / "faiss_index"

# Create all tables
Base.metadata.create_all(bind=engine)



# ─── helper functions ─────────────────────────────────────────────────────────
def load_json(path: str):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def chunk_and_embed(
    data: list[dict],
    index_dir: str = str(INDEX_DIR),
):
    """
    Treat each document as a single “chunk.” Index only those with lang == 'ar'.
    """
    texts = []
    metadatas = []

    for doc in data:
        if doc.get("lang") != "ar":
            # Skip any non-Arabic documents
            continue

        # Take the entire document content as one text entry
        full_content = doc.get("content", "").strip()
        if not full_content:
            continue

        texts.append(full_content)
        metadatas.append({
            "source": doc.get("url", ""),
            "lang": doc.get("lang"),
        })

    # Initialize the same embedder you’ll use at query time
    embedder = HuggingFaceEmbeddings(
        model_name="intfloat/multilingual-e5-base",
        model_kwargs={"device": "cuda" if torch.cuda.is_available() else "cpu"},
    )

    # Build FAISS index from the full-document texts
    vectorstore = FAISS.from_texts(texts, embedding=embedder, metadatas=metadatas)

    # Ensure the index directory exists
    os.makedirs(index_dir, exist_ok=True)
    vectorstore.save_local(index_dir)

    print(f"Indexed {len(texts)} documents into FAISS at ./{index_dir}")


# ─── build FAISS index if missing ───────────────────────────────────────────────
if not INDEX_DIR.is_dir() or not (INDEX_DIR / "index.faiss").exists():
    if DATA_PATH.exists():
        print("FAISS index missing—building now…")
        docs = load_json(str(DATA_PATH))
        chunk_and_embed(docs, index_dir=str(INDEX_DIR))
    else:
        print(f"Warning: JSON file not found at {DATA_PATH}. Skipping FAISS build.")


# ─── initialize pipeline ───────────────────────────────────────────────────────
# (Assuming QueryPipeline is defined elsewhere to load from INDEX_DIR)
pipeline = QueryPipeline(index_dir=str(INDEX_DIR))

# ─── FastAPI app setup ────────────────────────────────────────────────────────
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.exception_handler(422)
async def validation_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": await request.body()}
    )


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).get(int(payload.get("sub")))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# --- Auth routes ---
@app.post("/signup", response_model=UserResponse, status_code=201)
def signup(new_user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == new_user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(new_user.password)
    user = User(name=new_user.name, email=new_user.email, password=hashed, is_admin=new_user.is_admin)
    db.add(user); db.commit(); db.refresh(user)
    return user

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

# --- Protected User endpoints ---
@app.get("/me", response_model=UserResponse)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/users/", response_model=List[UserResponse])
def list_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin: raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(User).all()

# --- Chat endpoints ---
@app.get("/chats/", response_model=List[ChatResponse])
def list_chats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    qry = db.query(Chat)
    if not current_user.is_admin: 
        qry = qry.filter(Chat.user_id == current_user.id)
    return qry.all()

@app.delete(
    "/chats/{chat_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a chat by its ID"
)
def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found",
        )
    # only allow owner (or admin) to delete
    if not current_user.is_admin and chat.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this chat",
        )

    db.delete(chat)
    db.commit()
    # 204_NO_CONTENT → empty response body
    return



@app.post("/chats/", response_model=ChatResponse)
def create_chat(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat = Chat(user_id=current_user.id, created_at=datetime.utcnow())
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

@app.get("/chats/{chat_id}/messages", response_model=List[MessageResponse])
def get_messages(chat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat: raise HTTPException(status_code=404, detail="Chat not found")
    if chat.user_id != current_user.id and not current_user.is_admin: raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Message).filter(Message.chat_id == chat_id).all()

@app.post("/messages/", response_model=List[MessageResponse])
def send_message(
    message: MessageInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1) find chat & authorize
    chat = db.query(Chat).filter(Chat.id == message.chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    # 2) persist user message
    user_msg = Message(
        chat_id=message.chat_id,
        sender="user",
        content=message.user_message,
        timestamp=datetime.utcnow(),
    )
    db.add(user_msg)

    # 3) get actual AI answer (merge /ask logic here)
    #    first, retrieve context via RAG
    context = pipeline.handleQuery(message.user_message)
    if not context:
        raise HTTPException(status_code=404, detail="No relevant context found")

    #    then call remote answer service
    resp = requests.post(
        "http://176.119.254.185:7111/answer",
        json={"question": message.user_message, "document": context},
        timeout=100,
    )
    if resp.status_code != 200:
        raise HTTPException(
            
            status_code=resp.status_code,
            detail={"error": "Remote answer failed", "info": resp.text},
        )
    data = resp.json()
    if "answer" not in data:
        raise HTTPException(500, detail="Malformed response from answer service")

    # 4) persist assistant message
    bot_msg = Message(
        chat_id=message.chat_id,
        sender="bot",
        content=data["answer"],
        timestamp=datetime.utcnow(),
    )
    db.add(bot_msg)

    db.commit()
    db.refresh(user_msg)
    db.refresh(bot_msg)

    # ) return both
    return [user_msg, bot_msg]

# @app.post("/ask", response_model=AskResponse)
# def ask_user(req: AskRequest, current_user: User = Depends(get_current_user)):
#     context = pipeline.handleQuery(req.question)
#     if not context:
#         raise HTTPException(status_code=404, detail="No relevant context found")

    
#     resp = requests.post(
#         "http://176.119.254.185:7111/answer",
#         json={
#             "question": req.question,
#             "document": context
#         },
#         timeout=10
#     )
#     if resp.status_code != 200:
#         raise HTTPException(
#             status_code=resp.status_code,
#             detail={"error": "Remote answer service failed", "info": resp.text}
#         )

#     data = resp.json()
#     if "answer" not in data:
#         raise HTTPException(500, detail="Malformed response from answer service")

#     return AskResponse(answer=data["answer"])


class Settings(BaseSettings):
    DATA_FILE: str = "core/data/bank_reviews.json"

settings = Settings()


# Global in-memory list of reviews
REVIEWS: List[ReviewOut] = []


def load_and_classify_reviews():
    """
    1. Load the JSON file from disk
    2. For each review (ReviewIn), compute sentiment
    3. Build a ReviewOut with an 'id' and 'sentiment'
    4. Append to the global REVIEWS list
    """
    global REVIEWS
    REVIEWS.clear()

     # 1) Determine the directory where this file (app.py) resides:
    base_dir = Path(__file__).resolve().parent  
    #    If __file__ is ".../nlp_project/backend/app.py", then base_dir == ".../nlp_project/backend"

    # 2) Build the absolute path to "core/data/bank_reviews.json":
    data_path = base_dir / "core" / "data" / "bank_reviews.json"

    if not data_path.exists():
        raise FileNotFoundError(f"Cannot find data file at {data_path}")

    with open(data_path, "r", encoding="utf-8") as f:
        raw_list = json.load(f)  # a list of dicts matching ReviewIn

    for idx, entry in enumerate(raw_list):
        try:
            r = ReviewIn(**entry)
        except Exception as e:
            # Skip invalid entries (or you could log them)
            continue

        sentiment_label = classify_sentiment(r.review)
        review_out = ReviewOut(
            id=idx,
            reviewer=r.reviewer,
            stars=r.stars,
            since=r.since,
            review=r.review,
            location=r.location,
            source=r.source,
            sentiment=sentiment_label.value
        )
        REVIEWS.append(review_out)


@app.on_event("startup")
async def on_startup():
    """
    When the app starts, load & classify all reviews.
    """
    load_and_classify_reviews()


@app.get("/reviews", response_model=List[ReviewOut])
def get_reviews(
    stars: Optional[int] = Query(None, ge=1, le=5),
    sentiment: Optional[SentimentEnum] = Query(None),
    reviewer: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    since: Optional[int] = Query(None, ge=0),
):
    """
    Return all reviews, optionally filtered by:
      - stars (exact integer 1–5)
      - sentiment (Positive | Neutral | Negative)
      - reviewer (exact string match)
      - location (exact string match)
      - source (exact string match)
      - since (exact integer match)
    """
    results = REVIEWS

    if stars is not None:
        results = [r for r in results if r.stars == stars]

    if sentiment is not None:
        results = [r for r in results if r.sentiment == sentiment.value]

    if reviewer is not None:
        results = [r for r in results if r.reviewer == reviewer]

    if location is not None:
        results = [r for r in results if r.location == location]

    if source is not None:
        results = [r for r in results if r.source == source]

    if since is not None:
        results = [r for r in results if r.since == since]

    return results


@app.get("/reviews/{review_id}", response_model=ReviewOut)
def get_review_by_id(review_id: int):
    """
    Return a single review by its numeric index (`id`).
    """
    if review_id < 0 or review_id >= len(REVIEWS):
        raise HTTPException(status_code=404, detail="Review not found")
    return REVIEWS[review_id]