"""
Authentication API Routes
-------------------------
Handles user registration, login, and profile validation using MongoDB.
"""
from datetime import datetime, timezone
import logging
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId

from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse
from app.core.auth import hash_password, verify_password, create_access_token, get_current_user
from app.db.mongodb import db_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    """
    Register a new user in MongoDB and return a signed JWT token.
    """
    if db_service.database is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable. Ensure MongoDB is running and configured."
        )

    normalized_email = payload.email.strip().lower()
    users_col = db_service.get_collection("users")

    # Check for existing email
    existing_user = await users_col.find_one({"email": normalized_email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    now = datetime.now(timezone.utc)
    hashed_pwd = hash_password(payload.password)

    user_doc = {
        "name": payload.name.strip(),
        "email": normalized_email,
        "department": payload.department or "Mechanical & Rotating Equipment",
        "role": payload.role or "Field Technician",
        "technician_id": payload.technician_id.strip() if payload.technician_id else f"TECH-{int(now.timestamp()) % 10000:04d}",
        "password_hash": hashed_pwd,
        "created_at": now,
        "updated_at": now,
    }

    result = await users_col.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Issue JWT token
    token = create_access_token(data={"sub": user_id, "email": normalized_email})

    user_response = UserResponse(
        id=user_id,
        name=user_doc["name"],
        email=normalized_email,
        department=user_doc["department"],
        role=user_doc["role"],
        technician_id=user_doc["technician_id"],
        created_at=now
    )

    logger.info(f"New technician registered: {normalized_email} (ID: {user_id}, Code: {user_doc['technician_id']})")

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_response
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    """
    Authenticate an existing user with email and password, returning a JWT token.
    """
    if db_service.database is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable. Ensure MongoDB is running and configured."
        )

    normalized_email = payload.email.strip().lower()
    users_col = db_service.get_collection("users")

    user = await users_col.find_one({"email": normalized_email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_id = str(user["_id"])
    token = create_access_token(data={"sub": user_id, "email": normalized_email})

    user_response = UserResponse(
        id=user_id,
        name=user.get("name", "User"),
        email=normalized_email,
        department=user.get("department", "Mechanical & Rotating Equipment"),
        role=user.get("role", "Field Technician"),
        technician_id=user.get("technician_id", ""),
        created_at=user.get("created_at", datetime.now(timezone.utc))
    )

    logger.info(f"User logged in: {normalized_email} (ID: {user_id})")

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_response
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Return currently authenticated user information.
    """
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        department=current_user.get("department", "Mechanical & Rotating Equipment"),
        role=current_user.get("role", "Field Technician"),
        technician_id=current_user.get("technician_id", ""),
        created_at=current_user["created_at"]
    )
