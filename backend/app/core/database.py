"""Engine, creación de tablas y fábrica de sesiones."""

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings



def _url_con_driver(url: str) -> str:
    """postgresql://… usa el driver psycopg2 (psycopg2-binary, en requirements.txt).
    SQLAlchemy 2.1 eligiría psycopg 3 por defecto, que no está instalado."""
    if url.startswith("postgresql://"):
        return "postgresql+psycopg2://" + url.removeprefix("postgresql://")
    return url


DATABASE_URL = _url_con_driver(settings.DATABASE_URL)
# SQLite (solo desarrollo) necesita check_same_thread=False con FastAPI.
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=_connect_args)


def importar_modelos() -> None:
    """Registra las cinco tablas en SQLModel.metadata. Las relaciones (Relationship)
    se resuelven por nombre, así que todas las clases tienen que estar importadas."""
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401


def create_all_tables() -> None:
    importar_modelos()
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    # expire_on_commit=False: los objetos siguen legibles después del commit.
    return Session(engine, expire_on_commit=False)
