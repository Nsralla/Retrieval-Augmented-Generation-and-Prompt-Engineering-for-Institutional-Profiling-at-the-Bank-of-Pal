# backend/schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from typing import Literal

# --- Users ---
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    is_admin: bool = False

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool

    class Config:
        from_attributes = True

# --- Chats ---
class ChatResponse(BaseModel):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        form_attributes = True

# --- Messages ---
class MessageCreate(BaseModel):
    chat_id: int
    sender: str
    content: str
    timestamp: datetime

class MessageResponse(BaseModel):
    id: int
    chat_id: int
    sender: str
    content: str
    timestamp: datetime

    class Config:
        form_attributes = True

class MessageInput(BaseModel):
    chat_id: int
    user_message: str

class AnswerRequest(BaseModel):
    question: str
    document: str

class AnswerResponse(BaseModel):
    answer: str

from pydantic import BaseModel

class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str


class ReviewIn(BaseModel):
    """
    The shape of each review as it exists in the JSON file (before we add 'sentiment').
    """
    reviewer: str
    stars: int
    # since is optional, but we use it to filter reviews by year
    since: Optional[int] = None
    review: str
    location: str
    source: str

class ReviewOut(ReviewIn):
    """
    The shape of each review when we return it via API:
    includes 'id' (its index in the JSON array) and 'sentiment'.
    """
    id: int
    sentiment: Literal["Positive", "Neutral", "Negative"]

    class Config:
        orm_mode = True