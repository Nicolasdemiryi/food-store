"""Datos iniciales. Idempotente: solo inserta lo que falta, se puede correr varias veces.

    python -m app.db.seed      (desde la carpeta backend/)
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

USUARIOS = [
    # username, contraseña, nombre completo, email, rol
    ("admin", "Admin1234!", "Administrador Food Store", "admin@foodstore.com", "admin"),
    ("cliente", "Cliente1234!", "Cliente de Prueba", "cliente@foodstore.com", "user"),
]

CATEGORIAS = [
    ("Pizzas", "Pizzas a la piedra"),
    ("Hamburguesas", "Con papas fritas"),
    ("Empanadas", "Al horno"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Dulces caseros"),
]

IMG = "https://images.unsplash.com/photo-{}?w=600&h=400&fit=crop"

PRODUCTOS = [
    # nombre, descripción, precio, stock, categoría, foto de Unsplash
    ("Pizza muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9500, 20, "Pizzas", "1513104890138-7c749659a591"),
    ("Pizza napolitana", "Muzzarella, tomate en rodajas y ajo", 10800, 15, "Pizzas", "1574071318508-1cdbab80d002"),
    ("Fugazzeta", "Cebolla y doble muzzarella", 10200, 12, "Pizzas", "1565299624946-b28f40a0ae38"),
    ("Hamburguesa clásica", "Carne, queso, lechuga y tomate", 8900, 25, "Hamburguesas", "1568901346375-23c9450c58cd"),
    ("Hamburguesa doble bacon", "Doble carne, cheddar y bacon", 11500, 18, "Hamburguesas", "1553979459-d2229ba7433b"),
    ("Empanada de carne", "Carne cortada a cuchillo", 1300, 60, "Empanadas", "1604467707321-70c3a4c2b6b6"),
    ("Empanada de jamón y queso", "Clásica", 1200, 60, "Empanadas", "1601050690597-df0568f70950"),
    ("Gaseosa cola 1,5 L", "Bien fría", 2800, 40, "Bebidas", "1622483767028-3f66f32aef97"),
    ("Agua mineral 500 ml", "Sin gas", 1100, 50, "Bebidas", "1560023907-5f339617ea30"),
    ("Flan con dulce de leche", "Casero, con crema", 3200, 10, "Postres", "1528975604071-b4dc52a2d18c"),
    ("Brownie con helado", "Brownie tibio y helado de crema", 4500, 8, "Postres", "1606313564200-e75d5e30476c"),
]


def main() -> None:
    create_all_tables()
    with Session(engine) as s:
        for username, password, full_name, email, role in USUARIOS:
            if s.exec(select(Usuario).where(Usuario.username == username)).first() is None:
                s.add(
                    Usuario(
                        username=username,
                        full_name=full_name,
                        email=email,
                        hashed_password=hash_password(password),
                        role=role,
                    )
                )

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = s.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                s.add(categoria)
                s.flush()
            categorias[nombre] = categoria

        for nombre, descripcion, precio, stock, cat, foto in PRODUCTOS:
            if s.exec(select(Producto).where(Producto.nombre == nombre)).first() is None:
                s.add(
                    Producto(
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                        imagen_url=IMG.format(foto),
                        categoria_id=categorias[cat].id,  # type: ignore[arg-type]
                    )
                )
        s.commit()

    print("Seed listo.")
    print(f"  {len(CATEGORIAS)} categorías · {len(PRODUCTOS)} productos")
    for username, password, *_ in USUARIOS:
        print(f"  usuario: {username} / {password}")


if __name__ == "__main__":
    main()
