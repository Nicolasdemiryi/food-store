"""Reglas de Categoria: nombre único (también frente a las dadas de baja) y baja lógica."""

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


# ------------------------------------------------------------ excepciones de dominio
class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int) -> None:
        super().__init__(f"Categoría {categoria_id} no encontrada")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"Ya existe una categoría llamada '{nombre}'")


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def _activa_o_error(self, uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        """Una categoría dada de baja se trata como inexistente (404)."""
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(categoria_id)
        return categoria

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa_o_error(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado(data.nombre)
            categoria = uow.categorias.add(Categoria(nombre=data.nombre, descripcion=data.descripcion))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._activa_o_error(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True)  # solo los campos enviados
            if "nombre" in cambios and cambios["nombre"] is not None:
                otra = uow.categorias.get_by_nombre(cambios["nombre"])
                if otra is not None and otra.id != categoria_id:
                    raise NombreDuplicado(cambios["nombre"])
            for campo, valor in cambios.items():
                if campo == "nombre" and valor is None:
                    continue  # el nombre es obligatorio: null no lo borra
                setattr(categoria, campo, valor)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica: activo = false. No oculta sus productos ni libera el nombre."""
        with self.uow as uow:
            categoria = self._activa_o_error(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)
