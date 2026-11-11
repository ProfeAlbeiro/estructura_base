# Paso 5: Mejoras adicionales

## 📚 Explicación

En esta versión revisada del Paso 4 incorporamos **tres ajustes al diseño** que cambian el modelo respecto a la versión anterior:

1. **Un usuario SÍ puede ser cliente y vendedor a la vez** → ya lo teníamos resuelto con `ROLES_USUARIO` (N:M), pero **debemos reforzarlo** con restricciones y ejemplos explícitos.
2. **RBAC (Role-Based Access Control)** → formalizamos el modelo de **roles y permisos** para que el sistema pueda **autorizar acciones** (no solo etiquetar usuarios). Agregamos `PERMISOS` y `ROLES_PERMISOS`.
3. **Cada pedido tiene exactamente UN vendedor** → la relación es **1:N (VENDEDOR → PEDIDOS)**, no N:M. Esto cambia `VENDEDORES_PEDIDOS`: pasa de tabla puente a una **FK en `PEDIDOS`** (`codigo_seller`) con un atributo de comisión.

> ⚠️ **Advertencia pedagógica importante**: el ajuste 3 es una **decisión de negocio**, no una verdad universal. En el contexto original se dijo *"los vendedores se ganan una comisión cada vez que ayudan a una venta"*, lo que sugería N:M (varios vendedores por pedido). Si el negocio ahora define **1 vendedor por pedido**, el modelo debe reflejarlo. La lección para los estudiantes es: **el modelo se adapta al negocio, no al revés**. Documenta la decisión y prepárate para cambiarla si el negocio cambia.

---

## 🔍 Análisis del contexto vs. el modelo (revisado)

| Requisito del contexto | ¿Modelado? | Observación |
|---|---|---|
| Tienda vende en **local físico** y **en línea** | ✅ Sí | `CANALES_VENTA` + `PEDIDOS.codigo_canal`. |
| Compra y vende productos con **ánimo de lucro** | ✅ Sí | `COMPRAS` + `PEDIDOS`. |
| Lleva **stock / inventario** | ✅ Sí (vía vista) | `V_STOCK_PRODUCTOS`. |
| Vendedores ganan **comisión** por venta en local | ✅ Sí | `PEDIDOS.comision_seller_pedido`. |
| **Cada pedido tiene exactamente UN vendedor** | ✅ Sí (nuevo) | `PEDIDOS.codigo_seller` (FK, `NOT NULL` para canal Local). |
| Vendedores **no** participan en ventas en línea | ✅ Sí | `PEDIDOS.codigo_seller` es `NULL` si canal = En línea. |
| Cada venta en línea requiere **domicilio** | ✅ Sí | `DOMICILIOS` (1:1 con pedido en línea). |
| Todos los pedidos registran **pago** y **método de pago** | ✅ Sí | `PAGOS` + `METODOS_PAGO`. |
| **Un usuario puede ser cliente y vendedor a la vez** | ✅ Sí (nuevo) | `ROLES_USUARIO` (N:M) + especialización en `CLIENTES`/`VENDEDORES`. |
| **RBAC** (roles + permisos) | ✅ Sí (nuevo) | `ROLES`, `PERMISOS`, `ROLES_PERMISOS`, `ROLES_USUARIO`. |

---

## 🛠️ Mejora 1: Un usuario puede ser cliente **y** vendedor a la vez

### 🔎 Problema

En el modelo original, `CLIENTES` y `VENDEDORES` colgaban de `CREDENCIALES`, y las restricciones `CHECK ... LIKE '%customer%'` / `'%seller%'` **impedían que un mismo usuario fuera ambos**. Además, la jerarquía estaba invertida (`USUARIOS → CREDENCIALES → CLIENTES/VENDEDORES`).

### ✅ Solución

Mantener **`USUARIOS` como raíz**, especializar en `CLIENTES` y `VENDEDORES` (cada uno con su PK = FK a `USUARIOS`), y **permitir que un mismo `codigo_user` exista en ambas tablas de especialización**. Los **roles** se asignan vía `ROLES_USUARIO` (N:M).

**Regla de integridad** (que el estudiante debe entender):
- Estar en `CLIENTES` **implica** tener el rol `cliente`.
- Estar en `VENDEDORES` **implica** tener el rol `vendedor`.
- Un usuario **puede estar en ambas** tablas y tener **ambos roles**.

> 💡 **Nota pedagógica**: la pertenencia a `CLIENTES`/`VENDEDORES` es **especialización** (atributos propios: `fecha_nac_customer`, `salario_seller`), mientras que los **roles** son **autorización** (qué puede hacer). Un usuario puede tener el rol `cliente` **sin** estar en la tabla `CLIENTES` (ej. un cliente web sin fecha de nacimiento registrada), pero si está en `CLIENTES` **debe** tener el rol `cliente`. Esta es una **regla de negocio** que se valida con trigger o en la capa de aplicación.

**Ejemplo válido:**
```sql
-- Ana es cliente Y vendedora
INSERT INTO USUARIOS VALUES ('U001','Ana','Pérez','ana@mail.com',NOW(),NOW());
INSERT INTO CLIENTES VALUES ('U001','1990-05-10');       -- es cliente
INSERT INTO VENDEDORES VALUES ('U001', 1500000);         -- también es vendedora
INSERT INTO ROLES_USUARIO VALUES ('U001',1),('U001',2);  -- rol cliente + rol vendedor
```

---

## 🛠️ Mejora 2: RBAC (Role-Based Access Control)

### 🔎 Problema

Tener solo `ROLES` y `ROLES_USUARIO` **no es RBAC completo**. RBAC requiere:

- **Usuarios** → se les asignan **roles**.
- **Roles** → agrupan **permisos**.
- **Permisos** → describen **acciones** sobre **recursos** (ej. `producto:crear`, `pedido:leer`, `pago:aprobar`).
- **Sesiones** (opcional): un usuario activa un subconjunto de sus roles al iniciar sesión.

Sin `PERMISOS` ni `ROLES_PERMISOS`, el sistema solo sabe **qué rol tiene** un usuario, pero no **qué puede hacer**. Eso es etiquetado, no autorización.

### ✅ Solución

Agregar las tablas:

```
PERMISOS (codigo_permiso, nombre_permiso, recurso, accion)
ROLES_PERMISOS (codigo_rol, codigo_permiso)     -- N:M
ROLES_USUARIO  (codigo_user, codigo_rol)        -- N:M (ya existía)
```

**Modelo RBAC completo:**

```
USUARIOS ──N:M── ROLES_USUARIO ──N:M── ROLES ──N:M── ROLES_PERMISOS ──N:M── PERMISOS
```

**Ventajas:**
- **Autorización granular**: se puede preguntar "¿el usuario U001 puede `pedido:aprobar`?" consultando `ROLES_USUARIO → ROLES_PERMISOS → PERMISOS`.
- **Separación de responsabilidades**: los roles agrupan permisos; los usuarios reciben roles.
- **Principio de mínimo privilegio**: un usuario puede tener varios roles, cada uno con permisos acotados.
- **Auditoría**: se puede registrar qué rol otorgó qué permiso y cuándo.

**Ejemplo de permisos:**

| `nombre_permiso` | `recurso` | `accion` |
|---|---|---|
| `producto:crear` | producto | crear |
| `producto:leer` | producto | leer |
| `pedido:crear` | pedido | crear |
| `pedido:aprobar` | pedido | aprobar |
| `pago:aprobar` | pago | aprobar |
| `comision:ver` | comision | ver |

**Roles con permisos:**
- `cliente`: `producto:leer`, `pedido:crear`, `pedido:leer` (solo los propios).
- `vendedor`: `producto:leer`, `pedido:crear`, `pedido:leer`, `comision:ver`.
- `admin`: **todos** los permisos.

> 💡 **Nota pedagógica**: RBAC se puede extender a **RBAC con jerarquía de roles** (un rol hereda permisos de otro) o **RBAC con restricciones** (separación de deberes: quien crea un pago no puede aprobarlo). Eso ya es tema avanzado; aquí dejamos la base.

**Consulta típica de autorización:**
```sql
-- ¿Puede U001 aprobar pedidos?
SELECT COUNT(*) > 0 AS puede_aprobar
FROM ROLES_USUARIO ru
JOIN ROLES_PERMISOS rp ON rp.codigo_rol = ru.codigo_rol
JOIN PERMISOS p        ON p.codigo_permiso = rp.codigo_permiso
WHERE ru.codigo_user = 'U001'
  AND p.nombre_permiso = 'pedido:aprobar';
```

---

## 🛠️ Mejora 3: Cada pedido tiene **exactamente UN vendedor** (relación 1:N)

### 🔎 Problema

En la versión anterior, `VENDEDORES_PEDIDOS` era una tabla puente **N:M** (varios vendedores por pedido, con comisión por par). El negocio ahora define:

> *"Cada pedido tiene exactamente UN vendedor, y un vendedor puede participar en muchos pedidos a lo largo del tiempo. Es una relación 1:N (VENDEDOR → PEDIDOS)."*

Por tanto, la tabla puente **desaparece** y el vendedor se convierte en una **FK directa en `PEDIDOS`**, con la comisión como atributo del pedido.

### ✅ Solución

Eliminar `VENDEDORES_PEDIDOS` y agregar a `PEDIDOS`:

```sql
codigo_seller VARCHAR(10) NULL,           -- NULL si el pedido es en línea
comision_seller_pedido DECIMAL(10,2) NOT NULL DEFAULT 0.00
```

Con reglas:
- **Canal Local** → `codigo_seller` **obligatorio** (`NOT NULL`), comisión > 0.
- **Canal En línea** → `codigo_seller` **debe ser NULL**, comisión = 0.

**Cardinalidad resultante:**
```
VENDEDORES 1 ──────── N PEDIDOS
```

- Un vendedor puede tener **muchos pedidos**.
- Un pedido tiene **exactamente un vendedor** (o ninguno si es en línea).

> ⚠️ **Importante**: `codigo_seller` debe ser `NULL`-able a nivel de esquema (porque los pedidos en línea no tienen vendedor), pero la regla "exactamente uno si es local" se valida con un **trigger** o en la **capa de aplicación**. En MySQL no podemos expresar "NOT NULL solo cuando canal = Local" con un CHECK simple (MySQL 8 permite `CHECK` con subconsultas? **No**, MySQL no permite subconsultas en CHECK; solo columnas de la misma fila). Por eso usamos un **trigger**.

**Trigger de validación:**

```sql
DELIMITER //
CREATE TRIGGER trg_pedido_valida_vendedor
BEFORE INSERT ON PEDIDOS
FOR EACH ROW
BEGIN
  DECLARE v_canal VARCHAR(30);
  SELECT nombre_canal INTO v_canal FROM CANALES_VENTA WHERE codigo_canal = NEW.codigo_canal;

  IF v_canal = 'Local' AND NEW.codigo_seller IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido local requiere vendedor';
  END IF;
  IF v_canal = 'En línea' AND NEW.codigo_seller IS NOT NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido en línea no debe tener vendedor';
  END IF;
END//
DELIMITER ;
```

> 💡 **Nota pedagógica**: los triggers son **la última línea de defensa**. La validación principal debe estar en la **capa de aplicación** (backend) para dar mensajes claros al usuario. Pero el trigger **garantiza integridad** ante inserciones directas a la BD (scripts, ETL, admin). Es una **defensa en profundidad**.

---

## ✅ Código completo final (1FN + 2FN + 3FN + mejoras revisadas)

```sql
DROP DATABASE IF EXISTS BBDD_INVENTARIO;
-- -----------------------------------------------------
-- BBDD_INVENTARIO - VERSIÓN FINAL REVISADA
-- (1FN + 2FN + 3FN + Mejoras + RBAC + 1:N Vendedor-Pedido)
-- -----------------------------------------------------
CREATE SCHEMA BBDD_INVENTARIO DEFAULT CHARACTER SET utf8;
USE BBDD_INVENTARIO;

-- =====================================================
-- CATÁLOGOS BASE
-- =====================================================

CREATE TABLE ROLES (
  codigo_rol INT NOT NULL AUTO_INCREMENT,
  nombre_rol VARCHAR(50) NOT NULL,
  descripcion_rol VARCHAR(150),                       -- [RBAC]
  PRIMARY KEY (codigo_rol),
  UNIQUE INDEX uq_nombre_rol (nombre_rol)
) ENGINE = InnoDB;

CREATE TABLE PERMISOS (                               -- [RBAC] NUEVA
  codigo_permiso INT NOT NULL AUTO_INCREMENT,
  nombre_permiso VARCHAR(60) NOT NULL,                -- ej. 'pedido:aprobar'
  recurso_permiso VARCHAR(40) NOT NULL,               -- ej. 'pedido'
  accion_permiso VARCHAR(20) NOT NULL,                -- ej. 'aprobar'
  descripcion_permiso VARCHAR(150),
  PRIMARY KEY (codigo_permiso),
  UNIQUE INDEX uq_nombre_permiso (nombre_permiso)
) ENGINE = InnoDB;

CREATE TABLE ROLES_PERMISOS (                         -- [RBAC] NUEVA (N:M)
  codigo_rol INT NOT NULL,
  codigo_permiso INT NOT NULL,
  PRIMARY KEY (codigo_rol, codigo_permiso),
  CONSTRAINT fk_rp_rol
    FOREIGN KEY (codigo_rol) REFERENCES ROLES (codigo_rol)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rp_permiso
    FOREIGN KEY (codigo_permiso) REFERENCES PERMISOS (codigo_permiso)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE CATEGORIAS (
  codigo_categoria INT NOT NULL AUTO_INCREMENT,
  nombre_categoria VARCHAR(50) NOT NULL,
  PRIMARY KEY (codigo_categoria),
  UNIQUE INDEX uq_nombre_categoria (nombre_categoria)
) ENGINE = InnoDB;

CREATE TABLE CANALES_VENTA (
  codigo_canal INT NOT NULL AUTO_INCREMENT,
  nombre_canal VARCHAR(30) NOT NULL,
  PRIMARY KEY (codigo_canal),
  UNIQUE INDEX uq_nombre_canal (nombre_canal)
) ENGINE = InnoDB;

CREATE TABLE ESTADOS_PEDIDO (
  codigo_estado INT NOT NULL AUTO_INCREMENT,
  nombre_estado VARCHAR(30) NOT NULL,
  PRIMARY KEY (codigo_estado),
  UNIQUE INDEX uq_nombre_estado (nombre_estado)
) ENGINE = InnoDB;

CREATE TABLE METODOS_PAGO (
  codigo_metodo INT NOT NULL AUTO_INCREMENT,
  nombre_metodo VARCHAR(50) NOT NULL,
  PRIMARY KEY (codigo_metodo),
  UNIQUE INDEX uq_nombre_metodo (nombre_metodo)
) ENGINE = InnoDB;

CREATE TABLE PARAMETROS (
  codigo_parametro VARCHAR(30) NOT NULL,
  valor_parametro DECIMAL(10,4) NOT NULL,
  descripcion_parametro VARCHAR(100) NOT NULL,
  PRIMARY KEY (codigo_parametro)
) ENGINE = InnoDB;

-- =====================================================
-- USUARIOS Y CREDENCIALES
-- =====================================================

CREATE TABLE USUARIOS (
  codigo_user VARCHAR(10) NOT NULL,
  nombres_user VARCHAR(50) NOT NULL,
  apellidos_user VARCHAR(50) NOT NULL,
  correo_user VARCHAR(100) NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (codigo_user),
  UNIQUE INDEX uq_correo_user (correo_user ASC)
) ENGINE = InnoDB;

CREATE TABLE CREDENCIALES (
  codigo_user VARCHAR(10) NOT NULL,
  foto_cred VARCHAR(255) NOT NULL,
  identificacion_cred VARCHAR(30) NOT NULL,
  fecha_ingreso_cred DATE NOT NULL,
  pass_cred VARCHAR(300) NOT NULL,
  estado_cred TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (codigo_user),
  UNIQUE INDEX uq_identificacion_cred (identificacion_cred ASC),
  CONSTRAINT fk_credencial_usuario
    FOREIGN KEY (codigo_user) REFERENCES USUARIOS (codigo_user)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- RBAC: usuario ↔ rol (N:M) — permite cliente Y vendedor a la vez
CREATE TABLE ROLES_USUARIO (
  codigo_user VARCHAR(10) NOT NULL,
  codigo_rol INT NOT NULL,
  fecha_asignacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- [RBAC] auditoría
  PRIMARY KEY (codigo_user, codigo_rol),
  CONSTRAINT fk_ru_usuario
    FOREIGN KEY (codigo_user) REFERENCES USUARIOS (codigo_user)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ru_rol
    FOREIGN KEY (codigo_rol) REFERENCES ROLES (codigo_rol)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- ESPECIALIZACIONES (un usuario puede estar en ambas)
-- =====================================================

CREATE TABLE CLIENTES (
  codigo_customer VARCHAR(10) NOT NULL,
  fecha_nac_customer DATE NOT NULL,
  PRIMARY KEY (codigo_customer),
  CONSTRAINT fk_cliente_usuario
    FOREIGN KEY (codigo_customer) REFERENCES USUARIOS (codigo_user)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE VENDEDORES (
  codigo_seller VARCHAR(10) NOT NULL,
  salario_seller DECIMAL(15,2) NOT NULL,
  PRIMARY KEY (codigo_seller),
  CONSTRAINT fk_vendedor_usuario
    FOREIGN KEY (codigo_seller) REFERENCES USUARIOS (codigo_user)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- MENSAJES
-- =====================================================

CREATE TABLE MENSAJES (
  codigo_mensaje INT NOT NULL AUTO_INCREMENT,
  codigo_user VARCHAR(10) NOT NULL,
  fecha_mensaje DATE NOT NULL,
  asunto_mensaje VARCHAR(50) NOT NULL,
  descripcion_mensaje VARCHAR(300) NOT NULL,
  PRIMARY KEY (codigo_mensaje),
  INDEX ind_mensaje_usuario (codigo_user ASC),
  CONSTRAINT fk_mensaje_usuario
    FOREIGN KEY (codigo_user) REFERENCES USUARIOS (codigo_user)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- PRODUCTOS
-- =====================================================

CREATE TABLE PRODUCTOS (
  codigo_categoria INT NOT NULL,
  codigo_producto VARCHAR(10) NOT NULL,
  nombre_producto VARCHAR(50) NOT NULL,
  precio_producto DECIMAL(10,2) NOT NULL,
  unidad_producto DECIMAL(10,2) NOT NULL,
  medida_producto VARCHAR(20) NOT NULL,
  PRIMARY KEY (codigo_producto),
  INDEX ind_producto_categoria (codigo_categoria ASC),
  CONSTRAINT fk_producto_categoria
    FOREIGN KEY (codigo_categoria) REFERENCES CATEGORIAS (codigo_categoria)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- DIRECCIONES DEL CLIENTE
-- =====================================================

CREATE TABLE DIRECCIONES_CLIENTE (
  codigo_direccion INT NOT NULL AUTO_INCREMENT,
  codigo_customer VARCHAR(10) NOT NULL,
  alias_direccion VARCHAR(30) NOT NULL,
  ciudad_direccion VARCHAR(50) NOT NULL,
  direccion_direccion VARCHAR(150) NOT NULL,
  es_principal TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (codigo_direccion),
  INDEX ind_direccion_cliente (codigo_customer ASC),
  CONSTRAINT fk_direccion_cliente
    FOREIGN KEY (codigo_customer) REFERENCES CLIENTES (codigo_customer)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- PEDIDOS  (1:N VENDEDOR → PEDIDOS)
-- =====================================================

CREATE TABLE PEDIDOS (
  codigo_customer VARCHAR(10) NOT NULL,
  codigo_pedido VARCHAR(10) NOT NULL,
  codigo_canal INT NOT NULL,
  codigo_estado INT NOT NULL,
  codigo_direccion INT,
  codigo_seller VARCHAR(10) NULL,                    -- [1:N] FK al vendedor (NULL si en línea)
  comision_seller_pedido DECIMAL(10,2) NOT NULL DEFAULT 0.00,  -- [1:N] comisión del pedido
  fecha_pedido DATE NOT NULL,
  PRIMARY KEY (codigo_pedido),
  INDEX ind_pedido_cliente (codigo_customer ASC),
  INDEX ind_pedido_seller (codigo_seller ASC),       -- [1:N] índice para "pedidos por vendedor"
  INDEX ind_pedido_fecha (fecha_pedido ASC),
  CONSTRAINT fk_pedido_cliente
    FOREIGN KEY (codigo_customer) REFERENCES CLIENTES (codigo_customer)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pedido_canal
    FOREIGN KEY (codigo_canal) REFERENCES CANALES_VENTA (codigo_canal)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pedido_estado
    FOREIGN KEY (codigo_estado) REFERENCES ESTADOS_PEDIDO (codigo_estado)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pedido_direccion
    FOREIGN KEY (codigo_direccion) REFERENCES DIRECCIONES_CLIENTE (codigo_direccion)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_pedido_seller
    FOREIGN KEY (codigo_seller) REFERENCES VENDEDORES (codigo_seller)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- DETALLE PEDIDOS
-- =====================================================

CREATE TABLE LISTA_PRODUCTOS_PEDIDOS (
  codigo_pedido VARCHAR(10) NOT NULL,
  codigo_producto VARCHAR(10) NOT NULL,
  cantidad_productos INT NOT NULL,
  PRIMARY KEY (codigo_pedido, codigo_producto),
  INDEX ind_lista_producto_producto (codigo_producto ASC),
  CONSTRAINT fk_lista_productos_pedido
    FOREIGN KEY (codigo_pedido) REFERENCES PEDIDOS (codigo_pedido)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_lista_productos_producto
    FOREIGN KEY (codigo_producto) REFERENCES PRODUCTOS (codigo_producto)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- COMPRAS
-- =====================================================

CREATE TABLE COMPRAS (
  codigo_compra VARCHAR(10) NOT NULL,
  fecha_compra DATE NOT NULL,
  documento_compra VARCHAR(255) NOT NULL,
  PRIMARY KEY (codigo_compra)
) ENGINE = InnoDB;

CREATE TABLE LISTA_PRODUCTOS_COMPRADOS (
  codigo_compra VARCHAR(10) NOT NULL,
  codigo_producto VARCHAR(10) NOT NULL,
  precio_producto_compra DECIMAL(10,2) NOT NULL,
  cantidad_productos_compra INT NOT NULL,
  PRIMARY KEY (codigo_compra, codigo_producto),
  INDEX ind_lista_prod_comp_productos (codigo_producto ASC),
  CONSTRAINT fk_lista_prod_comp_productos
    FOREIGN KEY (codigo_producto) REFERENCES PRODUCTOS (codigo_producto)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_lista_prod_comp_compra
    FOREIGN KEY (codigo_compra) REFERENCES COMPRAS (codigo_compra)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- PAGOS
-- =====================================================

CREATE TABLE PAGOS (
  codigo_pago VARCHAR(10) NOT NULL,
  codigo_pedido VARCHAR(10) NOT NULL,
  codigo_metodo INT NOT NULL,
  fecha_pago DATETIME NOT NULL,
  monto_pago DECIMAL(10,2) NOT NULL,
  estado_pago VARCHAR(20) NOT NULL,
  referencia_pago VARCHAR(50),
  PRIMARY KEY (codigo_pago),
  INDEX ind_pago_pedido (codigo_pedido ASC),
  INDEX ind_pago_fecha (fecha_pago ASC),
  CONSTRAINT fk_pago_pedido
    FOREIGN KEY (codigo_pedido) REFERENCES PEDIDOS (codigo_pedido)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pago_metodo
    FOREIGN KEY (codigo_metodo) REFERENCES METODOS_PAGO (codigo_metodo)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- DOMICILIOS
-- =====================================================

CREATE TABLE DOMICILIOS (
  codigo_domicilio VARCHAR(10) NOT NULL,
  codigo_pedido VARCHAR(10) NOT NULL,
  direccion_domicilio VARCHAR(150) NOT NULL,
  ciudad_domicilio VARCHAR(50) NOT NULL,
  fecha_envio DATETIME,
  fecha_entrega DATETIME,
  estado_domicilio VARCHAR(20) NOT NULL,
  costo_domicilio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (codigo_domicilio),
  UNIQUE INDEX uq_domicilio_pedido (codigo_pedido),
  CONSTRAINT fk_domicilio_pedido
    FOREIGN KEY (codigo_pedido) REFERENCES PEDIDOS (codigo_pedido)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

INSERT INTO ROLES (nombre_rol, descripcion_rol) VALUES
  ('cliente',  'Cliente que compra productos'),
  ('vendedor', 'Vendedor que atiende pedidos en local y recibe comisión'),
  ('admin',    'Administrador con acceso total');

INSERT INTO PERMISOS (nombre_permiso, recurso_permiso, accion_permiso, descripcion_permiso) VALUES
  ('producto:leer',   'producto', 'leer',   'Ver productos'),
  ('producto:crear',  'producto', 'crear',  'Crear productos'),
  ('pedido:crear',    'pedido',   'crear',  'Crear pedidos'),
  ('pedido:leer',     'pedido',   'leer',   'Ver pedidos'),
  ('pedido:aprobar',  'pedido',   'aprobar','Aprobar pedidos'),
  ('pago:aprobar',    'pago',     'aprobar','Aprobar pagos'),
  ('comision:ver',    'comision', 'ver',    'Ver comisiones');

-- cliente: leer productos, crear/leer pedidos
INSERT INTO ROLES_PERMISOS (codigo_rol, codigo_permiso) VALUES
  (1,1), (1,3), (1,4);
-- vendedor: leer productos, crear/leer pedidos, ver comisiones
INSERT INTO ROLES_PERMISOS (codigo_rol, codigo_permiso) VALUES
  (2,1), (2,3), (2,4), (2,7);
-- admin: todos
INSERT INTO ROLES_PERMISOS (codigo_rol, codigo_permiso)
  SELECT 3, codigo_permiso FROM PERMISOS;

INSERT INTO CANALES_VENTA (nombre_canal) VALUES ('Local'), ('En línea');
INSERT INTO ESTADOS_PEDIDO (nombre_estado) VALUES ('pendiente'), ('pagado'), ('enviado'), ('entregado'), ('cancelado');
INSERT INTO METODOS_PAGO (nombre_metodo) VALUES ('Efectivo'), ('Tarjeta crédito'), ('Tarjeta débito'), ('PSE'), ('Nequi');
INSERT INTO PARAMETROS VALUES
  ('IVA', 0.19, 'Tasa de IVA vigente'),
  ('COMISION_BASE', 0.05, 'Comisión base por venta en local');

-- =====================================================
-- TRIGGER: valida vendedor según canal del pedido
-- =====================================================

DELIMITER //
CREATE TRIGGER trg_pedido_valida_vendedor
BEFORE INSERT ON PEDIDOS
FOR EACH ROW
BEGIN
  DECLARE v_canal VARCHAR(30);
  SELECT nombre_canal INTO v_canal FROM CANALES_VENTA WHERE codigo_canal = NEW.codigo_canal;

  IF v_canal = 'Local' AND NEW.codigo_seller IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido local requiere vendedor';
  END IF;
  IF v_canal = 'En línea' AND NEW.codigo_seller IS NOT NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido en línea no debe tener vendedor';
  END IF;
END//
DELIMITER ;

-- =====================================================
-- VISTAS
-- =====================================================

-- Stock calculado
CREATE OR REPLACE VIEW V_STOCK_PRODUCTOS AS
SELECT
  p.codigo_producto,
  p.nombre_producto,
  COALESCE(c.total_comprado, 0) - COALESCE(v.total_vendido, 0) AS stock_actual
FROM PRODUCTOS p
LEFT JOIN (
  SELECT codigo_producto, SUM(cantidad_productos_compra) AS total_comprado
  FROM LISTA_PRODUCTOS_COMPRADOS GROUP BY codigo_producto
) c ON c.codigo_producto = p.codigo_producto
LEFT JOIN (
  SELECT codigo_producto, SUM(cantidad_productos) AS total_vendido
  FROM LISTA_PRODUCTOS_PEDIDOS GROUP BY codigo_producto
) v ON v.codigo_producto = p.codigo_producto;

-- Totales con IVA parametrizado + domicilio
CREATE OR REPLACE VIEW V_TOTALES_PEDIDOS AS
SELECT
  pd.codigo_pedido,
  pd.codigo_customer,
  pd.fecha_pedido,
  pd.codigo_canal,
  pd.codigo_estado,
  pd.codigo_seller,
  COALESCE(sub.total_sin_iva, 0) AS total_pl_pedido,
  (COALESCE(sub.total_sin_iva, 0) + COALESCE(d.costo_domicilio, 0))
    * (SELECT valor_parametro FROM PARAMETROS WHERE codigo_parametro = 'IVA') AS iva_pedido,
  (COALESCE(sub.total_sin_iva, 0) + COALESCE(d.costo_domicilio, 0))
    * (1 + (SELECT valor_parametro FROM PARAMETROS WHERE codigo_parametro = 'IVA')) AS total_pr_pedido
FROM PEDIDOS pd
LEFT JOIN (
  SELECT lp.codigo_pedido,
         SUM(lp.cantidad_productos * pr.precio_producto) AS total_sin_iva
  FROM LISTA_PRODUCTOS_PEDIDOS lp
  JOIN PRODUCTOS pr ON pr.codigo_producto = lp.codigo_producto
  GROUP BY lp.codigo_pedido
) sub ON sub.codigo_pedido = pd.codigo_pedido
LEFT JOIN DOMICILIOS d ON d.codigo_pedido = pd.codigo_pedido;

-- Totales de compras
CREATE OR REPLACE VIEW V_TOTALES_COMPRAS AS
SELECT
  c.codigo_compra,
  c.fecha_compra,
  COALESCE(SUM(lpc.precio_producto_compra * lpc.cantidad_productos_compra), 0) AS total_pr_compra
FROM COMPRAS c
LEFT JOIN LISTA_PRODUCTOS_COMPRADOS lpc ON lpc.codigo_compra = c.codigo_compra
GROUP BY c.codigo_compra, c.fecha_compra;

-- Comisiones por vendedor (1:N: un pedido → un vendedor)
CREATE OR REPLACE VIEW V_COMISIONES_VENDEDOR AS
SELECT
  p.codigo_seller,
  u.nombres_user,
  u.apellidos_user,
  COUNT(p.codigo_pedido)              AS pedidos_atendidos,
  SUM(p.comision_seller_pedido)       AS total_comisiones
FROM PEDIDOS p
JOIN VENDEDORES vd ON vd.codigo_seller = p.codigo_seller
JOIN USUARIOS   u  ON u.codigo_user    = vd.codigo_seller
WHERE p.codigo_seller IS NOT NULL
GROUP BY p.codigo_seller, u.nombres_user, u.apellidos_user;

-- RBAC: permisos efectivos por usuario
CREATE OR REPLACE VIEW V_PERMISOS_USUARIO AS
SELECT DISTINCT
  ru.codigo_user,
  p.nombre_permiso
FROM ROLES_USUARIO ru
JOIN ROLES_PERMISOS rp ON rp.codigo_rol = ru.codigo_rol
JOIN PERMISOS p        ON p.codigo_permiso = rp.codigo_permiso;
```

---

## 📋 Resumen del Paso 4 (revisado)

| # | Mejora | Tablas afectadas |
|---|---|---|
| 1 | **Usuario puede ser cliente y vendedor a la vez** | `USUARIOS`, `CLIENTES`, `VENDEDORES`, `ROLES_USUARIO` |
| 2 | **RBAC**: roles + permisos + asignaciones | `ROLES`, `PERMISOS` (nueva), `ROLES_PERMISOS` (nueva), `ROLES_USUARIO`, `V_PERMISOS_USUARIO` (vista) |
| 3 | **1:N VENDEDOR → PEDIDOS** (un pedido, un vendedor) | `PEDIDOS` (gana `codigo_seller` + `comision_seller_pedido`), `VENDEDORES_PEDIDOS` **eliminada**, trigger de validación |
| 4 | Canal de venta (Local vs. En línea) | `CANALES_VENTA` (nueva), `PEDIDOS` |
| 5 | Pagos y métodos de pago | `PAGOS` (nueva), `METODOS_PAGO` (nueva) |
| 6 | Domicilios para pedidos en línea | `DOMICILIOS` (nueva) |
| 7 | Direcciones del cliente | `DIRECCIONES_CLIENTE` (nueva), `PEDIDOS` |
| 8 | Estado de pedido normalizado | `ESTADOS_PEDIDO` (nueva), `PEDIDOS` |
| 9 | Parámetros configurables (IVA, comisión) | `PARAMETROS` (nueva), vistas |
| 10 | BLOB → ruta de archivo | `CREDENCIALES`, `COMPRAS` |
| 11 | UNIQUE en catálogos, `ON DELETE RESTRICT`, auditoría, índices | Varias |

---

## 🧪 Pruebas sugeridas

```sql
-- 1) Usuario que es cliente Y vendedor a la vez
INSERT INTO USUARIOS VALUES ('U001','Ana','Pérez','ana@mail.com',NOW(),NOW());
INSERT INTO CLIENTES VALUES ('U001','1990-05-10');
INSERT INTO VENDEDORES VALUES ('U001', 1500000);
INSERT INTO ROLES_USUARIO (codigo_user, codigo_rol) VALUES ('U001',1),('U001',2);
-- ✅ Ana está en ambas especializaciones y tiene ambos roles

-- 2) RBAC: ¿qué permisos tiene Ana?
SELECT * FROM V_PERMISOS_USUARIO WHERE codigo_user = 'U001';
-- Debe incluir permisos de cliente + vendedor (sin duplicados, gracias al DISTINCT)

-- 2b) ¿Puede Ana aprobar pedidos? (solo admin debería)
SELECT COUNT(*) > 0 AS puede_aprobar
FROM V_PERMISOS_USUARIO
WHERE codigo_user = 'U001' AND nombre_permiso = 'pedido:aprobar';
-- Resultado esperado: 0 (false)

-- 3) Pedido local DEBE tener vendedor
INSERT INTO CATEGORIAS (nombre_categoria) VALUES ('Bebidas');
INSERT INTO PRODUCTOS VALUES (1,'PR001','Agua',2.50,500,'ml');
INSERT INTO PEDIDOS (codigo_customer, codigo_pedido, codigo_canal, codigo_estado, fecha_pedido, codigo_seller)
VALUES ('U001','P001',1,1,'2025-02-01', NULL);
-- ❌ ERROR: "Pedido local requiere vendedor"

INSERT INTO PEDIDOS (codigo_customer, codigo_pedido, codigo_canal, codigo_estado, fecha_pedido, codigo_seller, comision_seller_pedido)
VALUES ('U001','P001',1,1,'2025-02-01','U001', 5000.00);
-- ✅ OK

-- 4) Pedido en línea NO debe tener vendedor
INSERT INTO PEDIDOS (codigo_customer, codigo_pedido, codigo_canal, codigo_estado, fecha_pedido, codigo_seller)
VALUES ('U001','P002',2,1,'2025-02-02','U001');
-- ❌ ERROR: "Pedido en línea no debe tener vendedor"

INSERT INTO PEDIDOS (codigo_customer, codigo_pedido, codigo_canal, codigo_estado, fecha_pedido, codigo_seller)
VALUES ('U001','P002',2,1,'2025-02-02', NULL);
-- ✅ OK

-- 5) Comisiones por vendedor (1:N)
SELECT * FROM V_COMISIONES_VENDEDOR;
```

---

## 🎓 Cierre del ejercicio

Al terminar los 4 pasos, tus estudiantes habrán aprendido:

| Paso | Concepto | Habilidad desarrollada |
|---|---|---|
| 1 | 1FN | Detectar atributos no atómicos, grupos repetidos y falta de PK. |
| 2 | 2FN | Detectar dependencias funcionales parciales en claves compuestas. |
| 3 | 3FN | Detectar dependencias transitivas y atributos derivados. |
| 4 | Mejoras + RBAC + cardinalidades | Modelar dominio, corregir cardinalidades, agregar requisitos faltantes, diseñar RBAC, decidir cuándo desnormalizar. |

---

## ⏭️ ¿Y después?

Sugerencias para seguir profundizando:

1. **4FN**: dependencias multivaluadas (¿un vendedor puede tener varios teléfonos? ¿un pedido varios estados históricos?).
2. **5FN**: dependencias de reunión.
3. **BCNF**: cada determinante debe ser clave candidata.
4. **RBAC jerárquico**: un rol hereda permisos de otro (`ROLES_PADRE`).
5. **Separación de deberes** (SoD): quién crea un pago no puede aprobarlo → restricciones en `ROLES_PERMISOS`.
6. **Auditoría de autorizaciones**: tabla `LOG_ACCESOS` para registrar qué usuario hizo qué acción.
7. **Modelado dimensional (Kimball)**: data warehouse con `HECHOS_VENTAS` + dimensiones.
8. **Triggers y procedimientos** para más reglas de negocio.
9. **Migración de datos** desde el modelo original al nuevo (ETL).

¿Quieres que prepare el **Paso 5 (4FN/BCNF)** o profundicemos en **RBAC jerárquico / auditoría de autorizaciones**? 🚀