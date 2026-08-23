"""
Auth Pydantic Schemas
---------------------
Request/response models for the authentication API.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=80, description="Full name")
    email: EmailStr
    department: Optional[str] = Field("Mechanical & Rotating Equipment", description="Plant department / specialization")
    role: Optional[str] = Field("Field Technician", description="Technician role / title")
    technician_id: Optional[str] = Field("", description="Employee badge / Technician ID code")
    password: str = Field(..., min_length=8, description="Password (min 8 chars)")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    department: Optional[str] = "Mechanical & Rotating Equipment"
    role: Optional[str] = "Field Technician"
    technician_id: Optional[str] = ""
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
