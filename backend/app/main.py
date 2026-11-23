"""Punto de entrada.  Ejecutar desde backend/:  uvicorn app.main:app --reload
Documentación: /docs (Swagger) y /redoc."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables, importar_modelos

importar_modelos()  # las relaciones entre módulos se resuelven por nombre

from app.modules.auth.router import router as auth_router  # noqa: E402
from app.modules.categorias.router import router as categorias_router  # noqa: E402
from app.modules.pedidos.router import router as pedidos_router  # noqa: E402
from app.modules.productos.router import router as productos_router  # noqa: E402
from app.modules.usuarios.router import router as usuarios_router  # noqa: E402


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="Sistema de pedidos de comida · TPI Programación 4",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: el navegador acepta y envía la cookie HttpOnly desde el frontend.
# Con allow_credentials=True el origen tiene que ser explícito (no se admite "*").
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origenes_cors,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api/v1")
api.include_router(auth_router)
api.include_router(usuarios_router)
api.include_router(categorias_router)
api.include_router(productos_router)
api.include_router(pedidos_router)
app.include_router(api)


@app.get("/", include_in_schema=False)
def raiz() -> dict[str, str]:
    return {"app": "Food Store API", "docs": "/docs", "redoc": "/redoc"}
