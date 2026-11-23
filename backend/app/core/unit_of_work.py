"""Unit of Work base: una transacción por caso de uso.

    with self.uow as uow:
        ...repositorios...
    # __exit__: commit si no hubo excepción; rollback si la hubo; close siempre.

Ningún Service ni Router llama a session.commit(): el commit vive acá.
"""

from collections.abc import Callable
from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory as _session_factory


class UnitOfWork:
    def __init__(self, session_factory: Callable[[], Session] = _session_factory) -> None:
        self._session_factory = session_factory

    def __enter__(self) -> Self:
        self.session = self._session_factory()
        self._crear_repositorios()
        return self

    def _crear_repositorios(self) -> None:
        """Cada Unit of Work de módulo crea acá sus repositorios sobre self.session."""

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()  # no se persiste nada del caso de uso
        finally:
            self.session.close()
        # No se devuelve True: la excepción sigue hasta el Router, que la traduce a HTTP.
