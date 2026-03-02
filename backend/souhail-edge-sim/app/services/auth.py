"""
Authentication service for IgranSense Edge API.

Handles JWT token generation/validation and password hashing.
"""

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from ..models import User, UserInDB, TokenPayload

# Configuration
SECRET_KEY = "igransense-edge-secret-key-change-in-production"  # TODO: Move to env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Path to users data file
DATA_DIR = Path(__file__).parent.parent.parent / "data"
USERS_FILE = DATA_DIR / "users.json"


def load_users() -> list[UserInDB]:
    """Load users from JSON file."""
    if not USERS_FILE.exists():
        return []
    with open(USERS_FILE, "r") as f:
        data = json.load(f)
    return [UserInDB(**user) for user in data]


def get_user_by_email(email: str) -> Optional[UserInDB]:
    """Find user by email address."""
    users = load_users()
    for user in users:
        if user.email.lower() == email.lower():
            return user
    return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """Hash a password for storage."""
    return pwd_context.hash(password)


def create_access_token(user: User) -> str:
    """Create a JWT access token for a user."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user.email,
        "role": user.role,
        "user_id": user.id,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[TokenPayload]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenPayload(
            sub=payload.get("sub"),
            role=payload.get("role"),
            exp=datetime.fromtimestamp(payload.get("exp"), tz=timezone.utc) if payload.get("exp") else None,
        )
    except JWTError:
        return None


def authenticate_user(email: str, password: str) -> Optional[User]:
    """Authenticate a user with email and password."""
    user = get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    # Return User without hashed_password
    return User(
        id=user.id,
        email=user.email,
        role=user.role,
        farm_ids=user.farm_ids,
        org_id=user.org_id,
    )


def get_current_user(token: str) -> Optional[User]:
    """Get the current user from a token."""
    payload = decode_token(token)
    if not payload:
        return None
    user = get_user_by_email(payload.sub)
    if not user:
        return None
    return User(
        id=user.id,
        email=user.email,
        role=user.role,
        farm_ids=user.farm_ids,
        org_id=user.org_id,
    )
