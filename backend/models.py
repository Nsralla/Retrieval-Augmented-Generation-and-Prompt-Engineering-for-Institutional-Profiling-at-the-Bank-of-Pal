# backend/models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id        = Column(Integer, primary_key=True, index=True)
    name      = Column(String, nullable=False)
    email     = Column(String, unique=True, nullable=False)
    password  = Column(String, nullable=False)
    is_admin  = Column(Boolean, default=False)

    chats = relationship("Chat", back_populates="user", cascade="all, delete-orphan")

class Chat(Base):
    __tablename__ = "chats"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, nullable=False)

    user     = relationship("User", back_populates="chats")
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    id        = Column(Integer, primary_key=True, index=True)
    chat_id   = Column(Integer, ForeignKey("chats.id"), nullable=False)
    sender    = Column(String, nullable=False)   # "user" or "bot"
    content   = Column(Text, nullable=False)
    timestamp = Column(DateTime, nullable=False)

    chat = relationship("Chat", back_populates="messages")

