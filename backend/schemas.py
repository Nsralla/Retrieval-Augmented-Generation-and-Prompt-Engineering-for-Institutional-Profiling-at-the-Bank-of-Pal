# backend/schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

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
        orm_mode = True

# --- Chats ---
class ChatResponse(BaseModel):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

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
        orm_mode = True

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

