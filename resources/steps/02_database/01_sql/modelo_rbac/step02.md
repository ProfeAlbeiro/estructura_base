# Paso 2: Crear la tabla `users` y relacionarla con `roles` mediante Clave Foránea

## 1) Explicación

En el Paso 1 creamos la tabla `roles` como entidad independiente. Ahora vamos a crear la tabla `users` y a establecer la **primera relación del modelo**: un usuario **pertenece a** un rol.

**Conceptos clave que deben entender tus estudiantes antes de escribir código:**

### a) ¿Qué es una Clave Foránea (Foreign Key)?
Es una columna (o conjunto de columnas) en una tabla que **referencia** la Clave Primaria de otra tabla. Su propósito es garantizar la **integridad referencial**: no puede existir un usuario con un `role_id` que no exista en la tabla `roles`. Si intentas insertar un usuario con `role_id = 99` y ese rol no existe, MySQL rechaza la operación.

### b) ¿Qué tipo de relación es esta?
Es una relación **Uno a Muchos (1:N)**: 
- Un **rol** puede estar asignado a **muchos usuarios** (ej. el rol "Administrador" lo tienen 3 personas).
- Un **usuario** tiene **un solo rol** en este diseño simplificado.

> **Nota pedagógica importante:** En un RBAC "puro" y escalable, la relación entre usuarios y roles sería **Muchos a Muchos (N:M)** mediante una tabla intermedia `user_roles`, porque un usuario podría tener varios roles simultáneamente (ej. "Profesor" + "Coordinador"). Sin embargo, para fines didácticos en este primer acercamiento, comenzaremos con 1:N porque es más fácil de entender y de depurar. En un paso posterior (opcional) podemos migrar a N:M. **Advierte a tus estudiantes de esta decisión de diseño**, porque es una decisión de arquitectura real.

### c) Reglas de integridad referencial (`ON DELETE` y `ON UPDATE`)
Cuando defines una FK, debes decidir qué pasa si se **borra** o **actualiza** el rol referenciado:

| Opción | Comportamiento | ¿Cuándo usarla? |
| :--- | :--- | :--- |
| `RESTRICT` (por defecto) | Impide borrar un rol si tiene usuarios asociados. | **Recomendada para RBAC.** Evita dejar usuarios "huérfanos" sin rol. |
| `CASCADE` | Si borras el rol, se borran **todos sus usuarios**. | ⚠️ **Peligrosa.** Solo si estás seguro de que quieres eliminar usuarios en cascada. |
| `SET NULL` | Si borras el rol, el `role_id` de los usuarios se pone en `NULL`. | Requiere que la columna `role_id` acepte `NULL`. Útil si el rol es opcional. |
| `NO ACTION` | Similar a `RESTRICT` en InnoDB. | Poco usada en la práctica. |

**Decisión para nuestro modelo:** Usaremos `ON DELETE RESTRICT ON UPDATE CASCADE`. Es decir: no se puede borrar un rol con usuarios asignados, pero si se actualiza el `id` del rol (raro, pero posible), se propaga a los usuarios.

### d) ¿Qué columnas debe tener `users`?
Para un RBAC didáctico y funcional:
- `id`: PK autoincremental.
- `username`: nombre de usuario único (para login).
- `email`: correo único (para login alternativo y notificaciones).
- `password_hash`: **NUNCA** guardar contraseñas en texto plano. Guardaremos el hash (ej. bcrypt). Lo nombramos `password_hash` para que quede explícito.
- `full_name`: nombre completo (opcional pero útil).
- `role_id`: FK hacia `roles(id)`. **Obligatoria** (NOT NULL), porque en nuestro modelo todo usuario debe tener un rol.
- `is_active`: booleano para habilitar/deshabilitar cuentas sin borrarlas.
- `created_at`: timestamp de creación.

### e) Advertencia técnica sobre XAMPP/MySQL
Para que la FK funcione, se deben cumplir **tres condiciones**:
1. Ambas tablas deben ser **InnoDB** (ya lo son).
2. El tipo de dato de `users.role_id` debe ser **idéntico** al de `roles.id` → `INT UNSIGNED`.
3. La columna referenciada (`roles.id`) debe ser **PRIMARY KEY** o tener un **índice UNIQUE** (ya lo es).

Si falla alguna, MySQL lanza el famoso error `#1005 - Can't create table ... (errno: 150)`. Lo cubriremos en la sección de problemas.

---

## 2) Ejemplo: Código SQL completo y ejecutable

Ejecuta este script en phpMyAdmin, en la base de datos `rbac_demo` (debes tener seleccionada esa BD):

```sql
-- ============================================================
-- PROYECTO: Modelo de Datos RBAC (Paso 2 de N)
-- OBJETIVO: Crear tabla users y relacionarla con roles (FK)
-- MOTOR: InnoDB
-- ============================================================

USE rbac_demo;

-- 1. Crear la tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    -- Identificador único del usuario
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Nombre de usuario para login. Único y obligatorio.
    username VARCHAR(50) NOT NULL,

    -- Correo electrónico. Único y obligatorio.
    email VARCHAR(150) NOT NULL,

    -- Hash de la contraseña (NUNCA texto plano). Ej: bcrypt.
    -- 255 caracteres es suficiente para cualquier algoritmo moderno.
    password_hash VARCHAR(255) NOT NULL,

    -- Nombre completo del usuario (opcional)
    full_name VARCHAR(100) DEFAULT NULL,

    -- Clave Foránea hacia roles.id. Obligatoria.
    role_id INT UNSIGNED NOT NULL,

    -- Estado de la cuenta: 1 = activo, 0 = deshabilitado
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    -- Fecha de creación de la cuenta
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Restricciones de unicidad
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email),

    -- Índice sobre role_id para acelerar búsquedas por rol.
    -- MySQL lo crea automáticamente al definir la FK, pero lo
    -- dejamos explícito para que los estudiantes vean el concepto.
    KEY idx_users_role_id (role_id),

    -- Definición de la Clave Foránea
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Explicación del código para tus estudiantes:**

- `TINYINT(1)`: es la forma estándar en MySQL de representar un booleano. `1 = true`, `0 = false`.
- `TIMESTAMP ... DEFAULT CURRENT_TIMESTAMP`: MySQL rellena automáticamente la fecha de creación. No hay que enviarla desde la aplicación.
- `UNIQUE KEY uq_users_username (username)`: igual que en `roles`, garantiza que no haya dos usuarios con el mismo nombre de usuario.
- `CONSTRAINT fk_users_role`: le damos un nombre explícito a la FK. Esto es **muy importante**: si algún día hay que eliminarla, se hace con `ALTER TABLE users DROP FOREIGN KEY fk_users_role;` (por nombre, no por magia). Sin nombre, MySQL asigna uno autogenerado difícil de recordar.
- `FOREIGN KEY (role_id) REFERENCES roles(id)`: la sintaxis que une ambas tablas.
- `ON DELETE RESTRICT`: no se puede borrar un rol con usuarios. **Pruébalo con tus estudiantes**, es educativo.
- `ON UPDATE CASCADE`: si cambia el `id` del rol, se actualiza aquí.

**Verificación en phpMyAdmin:**
1. Haz clic en la tabla `users` → pestaña **"Estructura"**. Deberías ver `role_id` con un icono de llave extranjera.
2. Ve a la pestaña **"Vista de relaciones"** (o "Diseñador"). Deberías ver una línea conectando `users.role_id` con `roles.id`.

---

## 3) Solución a problemas comunes (Errores esperados en este paso)

| Error | Causa | Solución |
| :--- | :--- | :--- |
| `#1005 - Can't create table 'rbac_demo.users' (errno: 150)` | La FK no puede crearse. Causas típicas: (a) `roles` no es InnoDB; (b) `role_id` es `INT` pero `roles.id` es `INT UNSIGNED` (los tipos no coinciden); (c) `roles` no existe; (d) `roles.id` no es PK. | Verificar con `SHOW CREATE TABLE roles;` que el motor sea InnoDB y que `id` sea `INT UNSIGNED PRIMARY KEY`. Si el tipo no coincide, hay que corregir `roles` o `users` para que ambos sean `INT UNSIGNED`. |
| `#1215 - Cannot add foreign key constraint` | Similar al anterior. En MySQL moderno, suele indicar tipos incompatibles o motores distintos. | Ejecutar `SHOW ENGINE INNODB STATUS;` (pestaña SQL) para ver el detalle exacto del error de FK en la sección `LATEST FOREIGN KEY ERROR`. Es la herramienta de diagnóstico definitiva. |
| `#1822 - Failed to add the foreign key constraint. Missing index for constraint 'fk_users_role' in the referenced table 'roles'` | Muy raro, pero ocurre si `roles.id` no tiene índice. En nuestro caso `id` es PK, así que no debería pasar. | Asegurarse de que `roles.id` sea `PRIMARY KEY`. |
| `#1062 - Duplicate entry` al insertar un usuario | Están intentando insertar un `username` o `email` repetido. | Es el comportamiento esperado. El `UNIQUE` está protegiendo la integridad. Probar con otro `username`/`email`. |
| `#1452 - Cannot add or update a child row: a foreign key constraint fails` al insertar usuario | Intentaron insertar un `role_id` que no existe en `roles`. | Es el comportamiento esperado. **Este es el error más educativo del paso**: demuestra que la FK está funcionando. Insertar primero el rol. |
| `#1451 - Cannot delete or update a parent row: a foreign key constraint fails` al borrar un rol | Intentaron borrar un rol que tiene usuarios asociados. | Es el comportamiento esperado por `ON DELETE RESTRICT`. |

---

## 4) Ejercicio de comprensión

Ejecutar estas consultas en orden y **observar los resultados**. Es la mejor forma de interiorizar la integridad referencial.

**Prueba A — Inserción exitosa (rol ya existe del Paso 1):**
```sql
-- Verificar que el rol 'Administrador' existe (id=1 normalmente)
SELECT id, name FROM roles;

-- Insertar un usuario con ese rol
INSERT INTO users (username, email, password_hash, full_name, role_id)
VALUES ('jdoe', 'jdoe@example.com', '$2y$10$abcdefghijklmnopqrstuv', 'John Doe', 1);
```
✅ Debe insertarse correctamente.

**Prueba B — Inserción que debe fallar por FK:**
```sql
-- Intentar crear un usuario con un rol inexistente (id=999)
INSERT INTO users (username, email, password_hash, role_id)
VALUES ('ghost', 'ghost@example.com', '$2y$10$xyz', 999);
```
❌ Debe fallar con `#1452 - Cannot add or update a child row: a foreign key constraint fails`. **Este error es la prueba de que el modelo está bien diseñado.**

**Prueba C — Borrado que debe fallar por RESTRICT:**
```sql
-- Intentar borrar el rol que tiene usuarios asignados
DELETE FROM roles WHERE id = 1;
```
❌ Debe fallar con `#1451 - Cannot delete or update a parent row: a foreign key constraint fails`. **Explicar a los estudiantes:** esto evita que, al borrar un rol, queden usuarios apuntando a un rol que ya no existe (usuarios "huérfanos").

**Prueba D — Borrado exitoso de un rol sin usuarios:**
```sql
-- Crear un rol temporal sin usuarios
INSERT INTO roles (name, description) VALUES ('Temp', 'Rol de prueba');
-- Borrarlo
DELETE FROM roles WHERE name = 'Temp';
```
✅ Debe borrarse correctamente. Esto demuestra que `RESTRICT` solo bloquea cuando hay dependencias.

**Reflexión para la clase:**
> "La base de datos no solo almacena datos; **hace cumplir las reglas del negocio**. La FK es un contrato: 'ningún usuario puede existir sin un rol válido'. Aunque la aplicación falle, la BD protege la integridad."

**Consulta de verificación final (opcional, para mostrar el JOIN):**
```sql
SELECT u.id, u.username, u.email, r.name AS role_name
FROM users u
INNER JOIN roles r ON u.role_id = r.id;
```
Esto muestra el poder del modelo relacional: los datos están normalizados pero se pueden **recombinar** en una sola consulta.

---