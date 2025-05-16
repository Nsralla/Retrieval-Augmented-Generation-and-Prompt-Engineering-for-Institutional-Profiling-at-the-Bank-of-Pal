# backend/config.py
import os
from dotenv import load_dotenv

# Point at the .env file in your project root
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not set in .env")
