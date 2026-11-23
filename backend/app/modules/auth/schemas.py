from sqlmodel import SQLModel

# El registro usa UserCreate y responde UserPublic (módulo usuarios).
from app.modules.usuarios.schemas import UserCreate, UserPublic  # noqa: F401


class LoginResponse(SQLModel):
    message: str
