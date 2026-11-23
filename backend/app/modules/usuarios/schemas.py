"""Schemas de usuario (SQLModel sin table=True). UserPublic nunca incluye hashed_password."""

import re
from datetime import datetime

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=100)
    email: EmailStr = Field(max_length=254)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("username")
    @classmethod
    def username_valido(cls, v: str) -> str:
        v = v.strip()
        if not re.fullmatch(r"[A-Za-z0-9_.-]{3,50}", v):
            raise ValueError("Solo letras, números, punto, guion y guion bajo (3 a 50 caracteres)")
        return v

    @field_validator("full_name")
    @classmethod
    def nombre_no_vacio(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("El nombre completo es obligatorio")
        return v

    @field_validator("email")
    @classmethod
    def email_minusculas(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def maximo_72_bytes(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:  # bcrypt ignora lo que pasa de 72 bytes
            raise ValueError("La contraseña no puede superar los 72 bytes")
        return v


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
