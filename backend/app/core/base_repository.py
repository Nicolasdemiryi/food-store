"""Repositorio genérico. Solo acceso a datos: sin reglas de negocio y sin commit."""

from collections.abc import Sequence
from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

ModelT = TypeVar("ModelT", bound=SQLModel)


class BaseRepository(Generic[ModelT]):
    model: type[ModelT]

    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_id(self, entity_id: int) -> ModelT | None:
        return self.session.get(self.model, entity_id)

    def get_all(self) -> Sequence[ModelT]:
        return self.session.exec(select(self.model)).all()

    def add(self, entity: ModelT) -> ModelT:
        """INSERT o UPDATE dentro de la transacción. flush (no commit): la entidad
        ya tiene su id para el paso siguiente, pero nada se confirma todavía."""
        self.session.add(entity)
        self.session.flush()
        return entity

    def delete(self, entity: ModelT) -> None:
        self.session.delete(entity)
        self.session.flush()
