"""
Authentication endpoints.
Handles login and token generation.
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.core.security import (
    RequireUser,
    UserRole,
    create_access_token,
    hash_password,
    verify_password,
)

router = APIRouter()

# In-memory users for demo (replace with database in production)
# Pre-computed hashes to avoid bcrypt initialization issues
# admin123 and user123 hashed with bcrypt
DEMO_USERS: dict = {}

def _init_demo_users():
    """Initialize demo users lazily."""
    global DEMO_USERS
    if not DEMO_USERS:
        DEMO_USERS = {
            "admin": {
                "id": "admin",
                "username": "admin",
                "password_hash": hash_password("admin123"),
                "role": UserRole.ADMIN,
            },
            "user": {
                "id": "user",
                "username": "user",
                "password_hash": hash_password("user123"),
                "role": UserRole.USER,
            },
        }


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str


class UserResponse(BaseModel):
    id: str
    username: str
    role: str


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Authenticate user and return JWT token.

    Demo credentials:
    - admin / admin123 (role: admin)
    - user / user123 (role: user)
    """
    _init_demo_users()
    user = DEMO_USERS.get(request.username)

    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token(user["id"], user["role"])

    return LoginResponse(
        access_token=token,
        role=user["role"].value,
        username=user["username"],
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: RequireUser):
    """Get current authenticated user information."""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        role=current_user.role.value,
    )
