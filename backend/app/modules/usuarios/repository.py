from collections.abc import Sequence

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    model = Usuario

    def get_by_username(self, username: str) -> Usuario | None:
        return self.session.exec(select(Usuario).where(func.lower(Usuario.username) == username.strip().lower())).first()

    def get_by_email(self, email: str) -> Usuario | None:
        return self.session.exec(select(Usuario).where(func.lower(Usuario.email) == email.strip().lower())).first()

    def listar(self) -> Sequence[Usuario]:
        return self.session.exec(select(Usuario).order_by(col(Usuario.id))).all()
