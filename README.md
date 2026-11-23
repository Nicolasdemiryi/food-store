# 🍔 Food Store — Sistema de pedidos de comida

Trabajo Práctico Integrador · Programación 4 · Tecnicatura Universitaria en Programación (UTN)

**Alumno:** Nicolás Demiryi

| | |
|---|---|
| 📦 Repositorio | **https://github.com/Nicolasdemiryi/food-store**
| 🎥 Video de demostración | **https://…**

Aplicación web para un negocio de comidas.

- **Clientes:** se registran, recorren el catálogo, arman un carrito y confirman pedidos con dirección y forma de pago.
- **Administrador:** gestiona categorías, productos, stock, pedidos (máquina de estados) y usuarios, y ve un resumen del negocio.

```
food-store/
├── backend/    FastAPI + SQLModel + PostgreSQL (API REST en /api/v1, docs en /docs y /redoc)
├── frontend/   React + TypeScript + Vite + Tailwind (TanStack Query/Form/Table, Zustand, Axios)
└── README.md   este archivo
```

---

## 1. Requisitos

| Herramienta | Versión |
|---|---|
| Python | **3.11 a 3.13** (SQLModel no funciona con 3.14) |
| PostgreSQL | 15 o superior (para desarrollo también se acepta SQLite) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |

## 2. Backend

Todos los comandos se ejecutan **desde la carpeta `backend/`**.

### 2.1 Crear la base de datos

En pgAdmin (o con `psql`):

```sql
CREATE DATABASE foodstore_db;
```

### 2.2 Variables de entorno

Copiar `.env.example` como `.env` y completar los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base (**obligatoria**) | `postgresql://postgres:mi_clave@localhost:5432/foodstore_db` · desarrollo: `sqlite:///./foodstore.db` |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres (**obligatoria**) | se genera con `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS (varios: separados por coma) | `http://localhost:5173` |
| `COOKIE_SECURE` | Cookie solo por HTTPS (en producción `true`) | `false` |

Si falta `DATABASE_URL` o `SECRET_KEY`, o la clave tiene menos de 32 caracteres, la API **no arranca** (fail-fast).

### 2.3 Instalar, cargar datos y ejecutar

```bash
python -m venv .venv
source .venv/Scripts/activate        # Windows (Git Bash) · PowerShell: .venv\Scripts\Activate.ps1
# source .venv/bin/activate          # macOS / Linux
pip install -r requirements.txt
python -m app.db.seed                # admin, categorías y productos (idempotente)
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación: http://localhost:8000/docs (Swagger) y http://localhost:8000/redoc

### 2.4 Usuarios del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| **`admin`** | **`Admin1234!`** | admin |
| `cliente` | `Cliente1234!` | user |

El seed también carga **5 categorías y 11 productos con stock**. Se puede correr varias veces: solo inserta lo que falta.

## 3. Frontend

Todos los comandos se ejecutan **desde la carpeta `frontend/`**, con el backend corriendo.

```bash
cp .env.example .env                 # VITE_API_URL=http://localhost:8000/api/v1
pnpm install
pnpm build                           # tsc -b (verifica los tipos) + vite build
pnpm dev                             # http://localhost:5173
```

> Abrir la aplicación en **http://localhost:5173**, no en 127.0.0.1. Así el frontend y la API quedan en el mismo sitio (`localhost`) y el navegador envía la cookie de sesión.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

---

## 4. Funcionalidades

### Cliente (rol `user`)

| Ruta | Pantalla |
|---|---|
| `/` | Catálogo público: paginado en el servidor, búsqueda por nombre, filtro por categoría, skeleton y estado vacío |
| `/carrito` | Carrito persistido en el navegador: cantidades (con tope de stock), subtotales y total |
| `/checkout` | Confirmación con TanStack Form: dirección (5 a 200 caracteres), forma de pago (efectivo o transferencia) y notas |
| `/mis-pedidos` | Pedidos propios con detalle y botón **Cancelar** si están PENDIENTE |
| `/login`, `/register` | Formularios con TanStack Form |

### Administrador (rol `admin`, `/admin/…`)

| Ruta | Pantalla |
|---|---|
| `/admin/resumen` | Tarjetas: pendientes, en preparación, entregados, cancelados, pedidos de hoy e ingresos |
| `/admin/pedidos` | Tabla con filtro por estado; botones según la máquina de estados (avanzar o cancelar) y detalle |
| `/admin/productos` | ABM con TanStack Table + Form, cambio de stock y disponibilidad, baja lógica |
| `/admin/categorias` | ABM con TanStack Table + Form, baja lógica |
| `/admin/usuarios` | Activar y desactivar (sin botón Desactivar en la fila propia) |

## 5. Backend: arquitectura y reglas

```
backend/app/
├── main.py                 FastAPI, CORS con credenciales, routers bajo /api/v1
├── core/                   config.py · database.py · security.py · deps.py · unit_of_work.py · base_repository.py
├── modules/
│   ├── auth/               router · service · schemas (usa el modelo Usuario)
│   ├── usuarios/           models · schemas · repository · unit_of_work · service · router
│   ├── categorias/         ídem
│   ├── productos/          ídem
│   └── pedidos/            ídem (+ máquina de estados, excepciones de dominio y resumen)
└── db/seed.py              python -m app.db.seed
```

- **Capas:** Router → Service → Unit of Work → Repository → Model.
  - El Router obtiene el Service con `Depends(get_<modulo>_service)`, no abre el Unit of Work y traduce las excepciones de dominio a `HTTPException`.
  - El Service abre `with self.uow as uow:` y devuelve el schema **dentro** del bloque.
  - El `commit`, el `rollback` y el `close` ocurren solo en `UnitOfWork.__exit__`: ningún Service ni Router llama a `commit()`.
- **Modelo:** las 5 entidades del UML. Relaciones con `back_populates`:
  - `Categoria.productos` ↔ `Producto.categoria`;
  - `Usuario.pedidos` ↔ `Pedido.usuario`;
  - `Pedido.items` ↔ `DetallePedido.pedido`;
  - `Producto.detalles` ↔ `DetallePedido.producto`.
- **Baja lógica:** `activo` en categorías y productos, `disabled` en usuarios. Los pedidos no se borran: se cancelan.
- **Seguridad:**
  - contraseñas con bcrypt (`passlib[bcrypt]==1.7.4` + `bcrypt==4.0.1`);
  - JWT HS256 en la cookie **HttpOnly** `access_token` (`SameSite=Lax`, 30 minutos);
  - el cuerpo del login no incluye el token;
  - `get_current_user` (401) → `get_current_active_user` (400) → `require_role` (403).
- **Reglas de negocio de pedidos:**
  - **RN-01:** el pedido se crea en una sola transacción. Por cada ítem se verifica que el producto exista y esté activo (404), que esté disponible y que haya stock (400); se descuenta el stock y se crea la línea con copia del nombre y del precio. Si una validación falla, se hace rollback y no se guarda nada, ni el pedido ni el descuento de stock.
  - **RN-02:** las transiciones válidas se definen en el diccionario `TRANSICIONES` del Service. Una transición inválida responde 400.
  - **RN-03:** al cancelar, el stock se restituye en la misma transacción.
  - **RN-04:** el cliente ve y cancela solo sus pedidos (403 si es ajeno), y solo en PENDIENTE (400). El admin ve todos los pedidos.
  - **RN-05:** las líneas y el total son inmutables: no hay endpoint para editar ni para borrar pedidos.
  - **RN-06:** la forma de pago es `EFECTIVO` o `TRANSFERENCIA`, y la dirección tiene entre 5 y 200 caracteres (se valida en el schema, 422).

### Pruebas de la API

`backend/http/` contiene tres archivos para la extensión **REST Client** de VS Code: `1_auth_usuarios.http`, `2_catalogo.http` y `3_pedidos.http`. Cada petición indica el código esperado. Se corren en orden, con la base recién cargada por el seed.

## 6. Frontend: arquitectura

```
frontend/src/
├── shared/
│   ├── api/          axiosInstance (withCredentials + interceptor de 401), handleApiError, queryClient
│   ├── ui/           Button, Card, Input, Modal, BadgeEstado, Alert
│   ├── components/   Paginacion, Skeleton, EstadoVacio, EstadoError, DataTable (TanStack Table)
│   └── layout/       Navbar, MainLayout, AdminLayout
├── features/         auth · categorias · productos · usuarios · pedidos (pages, components, hooks, api, types)
├── store/            authStore (usuario, cargando, login, logout, checkSession; persist con partialize)
│                     cartStore (items, agregar, quitar, cambiarCantidad, vaciar, total; persist)
├── routes/           AppRouter (BrowserRouter) y ProtectedRoute (sesión y rol)
├── App.tsx           checkSession al montar + AppRouter
└── main.tsx          QueryClientProvider
```

- **Estado del servidor:** TanStack Query.
  - `useQuery` con `queryKey` descriptivas, por ejemplo `['productos', filtros]`.
  - `useMutation` con `invalidateQueries`: crear o cancelar un pedido también invalida los productos, porque cambia el stock.
  - Ningún componente pide datos con `fetch` dentro de `useEffect`.
- **Estado del cliente:** Zustand.
  - `authStore` persiste **solo** los datos del usuario, en `sessionStorage`. El token nunca pasa por JavaScript.
  - `cartStore` persiste el carrito en `localStorage`.
- **Interceptor de Axios:** ante un 401 (fuera de `/auth/token` y `/auth/me`) o un 400 «Cuenta de usuario desactivada», limpia el `authStore`, y `ProtectedRoute` lleva al login.
- **`ProtectedRoute`:**
  - muestra «Verificando la sesión…» mientras `checkSession` confirma la sesión;
  - sin sesión lleva a `/login` y, después del login, vuelve a la página que se pidió;
  - sin el rol requerido lleva a `/unauthorized`.
- **TypeScript:** `strict: true` y sin `any`.
