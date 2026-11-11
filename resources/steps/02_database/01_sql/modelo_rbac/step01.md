# Paso 1: Comprender el modelo RBAC y crear la tabla de roles (Roles)

## 1) Explicación

Antes de escribir una sola línea de SQL, es fundamental que tus estudiantes comprendan **qué** vamos a modelar y **por qué** RBAC simplifica la seguridad.

**El concepto central:**
En un sistema sin RBAC, cada usuario tendría permisos individuales asignados directamente. Si tienes 100 usuarios y cambias un permiso, debes editar 100 registros. RBAC introduce una capa intermedia: el **Rol**. Los permisos se asignan al rol, y los usuarios se asignan al rol. Si cambias un permiso del rol "Administrador", todos los usuarios con ese rol se actualizan automáticamente.

**La estructura mínima de RBAC (versión clásica):**
Para el primer paso, no construiremos todas las tablas de golpe. Empezaremos por la entidad más independiente: **Roles**. ¿Por qué? Porque en un modelo relacional, primero debes crear las tablas "padre" (aquellas que no dependen de otras) antes de crear las tablas "hijo" que las referencian mediante claves foráneas.

**¿Qué debe contener la tabla `Roles` en este paso?**
Para un RBAC funcional y didáctico, la tabla de roles necesita al menos:
- Un identificador único (`id`).
- Un nombre descriptivo (`name`) que sea único (no puede haber dos roles llamados "Admin").
- Una descripción opcional (`description`) para que los estudiantes documenten el propósito del rol.

**Nota pedagógica para tu clase:**
Existen dos formas comunes de implementar RBAC en la base de datos:
1.  **Con permisos granulares en tablas separadas** (el estándar académico: tablas `permissions`, `role_permission`).
2.  **Con columnas booleanas directamente en la tabla `Roles`** (más simple, usado en sistemas pequeños donde los permisos son fijos y pocos) .

Dado que estás enseñando Ingeniería de Software y el objetivo es que comprendan el **modelo de datos**, comenzaremos con la **Opción 1 (tablas separadas)**, porque enseña normalización, relaciones muchos-a-muchos y escalabilidad. La Opción 2 (booleanos) la mencionaremos como una simplificación válida para proyectos pequeños, pero no la usaremos como base.

**Advertencia técnica crucial (XAMPP/MySQL):**
Para que las claves foráneas funcionen (que las usaremos en el Paso 2), **ambas tablas deben usar el motor de almacenamiento `InnoDB`**. MySQL en XAMPP viene con InnoDB por defecto, pero es buena práctica ser explícito en el código para evitar el error `errno: 150` cuando intenten crear relaciones después .

---

## 2) Ejemplo: Código SQL completo y ejecutable

Abre **phpMyAdmin** en tu XAMPP, selecciona la base de datos (o crea una nueva llamada `rbac_demo`) y ejecuta el siguiente script en la pestaña **SQL**.

```sql
-- ============================================================
-- PROYECTO: Modelo de Datos RBAC (Paso 1 de N)
-- AUTOR: Profesor de Ingeniería de Software
-- MOTOR: InnoDB (Requerido para Claves Foráneas futuras)
-- ============================================================

-- 1. Crear la base de datos si no existe (opcional, si ya la creaste omite esto)
CREATE DATABASE IF NOT EXISTS rbac_demo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rbac_demo;

-- 2. Crear la tabla de Roles
-- Nota: Usamos "IF NOT EXISTS" para evitar errores si el script se ejecuta dos veces.
CREATE TABLE IF NOT EXISTS roles (
    -- Identificador único autoincremental
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Nombre del rol: Único y obligatorio. No puede estar vacío.
    name VARCHAR(50) NOT NULL,

    -- Descripción: Opcional, para documentar el rol ante los estudiantes.
    description VARCHAR(255) DEFAULT NULL,

    -- Restricción de unicidad para el nombre del rol.
    -- Esto evita que existan dos roles "Admin" o dos "User".
    UNIQUE KEY uq_roles_name (name)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Explicación del código para tus estudiantes:**
- `INT UNSIGNED`: Entero positivo. El `UNSIGNED` duplica el rango disponible y es una buena práctica para IDs.
- `AUTO_INCREMENT`: MySQL asigna el ID automáticamente (1, 2, 3...). No tenemos que preocuparnos por colisiones.
- `PRIMARY KEY`: Define `id` como el identificador único de la fila.
- `VARCHAR(50)`: El nombre del rol no necesita más de 50 caracteres. Ser preciso con los tipos es parte de un buen diseño.
- `UNIQUE KEY uq_roles_name (name)`: Aquí le decimos a MySQL: "No permitas dos filas con el mismo valor en la columna `name`". El prefijo `uq_` es una convención de nombres para identificar el índice como "Unique".
- `ENGINE=InnoDB`: **Obligatorio** para que en el Paso 2 podamos crear la tabla `users` con una clave foránea hacia `roles` .

**Verificación rápida (para hacer en clase):**
Después de ejecutar, pídeles que hagan clic en la tabla `roles` en phpMyAdmin. Deberían ver la estructura con `id` como PK y el índice único sobre `name`.

---

## 3) Solución a problemas comunes (Errores esperados en este paso)

Al ejecutar un `CREATE TABLE` en MySQL, los estudiantes suelen encontrar estos errores. Ten estas soluciones a mano:

| Error que verán | Causa | Solución |
| :--- | :--- | :--- |
| `#1064 - You have an error in your SQL syntax` | Suele ser por una coma extra al final del último campo (antes del `)`) o por olvidar cerrar un paréntesis. | Revisar que la última línea de definición (antes del `) ENGINE`) **no** tenga coma. En el código de ejemplo, `UNIQUE KEY ...` es la última y no lleva coma. |
| `#1007 - Can't create database 'rbac_demo'; database exists` | Ejecutaron el `CREATE DATABASE` dos veces. | Usamos `IF NOT EXISTS`. Si persiste, simplemente hagan `USE rbac_demo;` y omitan el `CREATE DATABASE`. |
| `#1050 - Table 'roles' already exists` | Ejecutaron el script dos veces. | Usamos `IF NOT EXISTS`. Si el error persiste, la tabla ya existe. Pueden hacer `DROP TABLE roles;` (solo si están seguros de que no hay datos que perder) o simplemente continuar al Paso 2. |
| El motor de la tabla queda como `MyISAM` en lugar de `InnoDB` | En algunas instalaciones antiguas de XAMPP, el motor por defecto es MyISAM. | Verificar en phpMyAdmin (pestaña "Operaciones" o "Variables") que el motor sea InnoDB. El código ya fuerza `ENGINE=InnoDB`, así que si se ejecutó correctamente, debería ser InnoDB. Si no, se puede corregir con: `ALTER TABLE roles ENGINE=InnoDB;` . |

---

## 4) Ejercicio de comprensión

Pídeles a tus estudiantes que ejecuten estas dos consultas y observen el resultado. Esto les demostrará **por qué** el `UNIQUE` en `name` es importante:

**Prueba A (Inserción exitosa):**
```sql
INSERT INTO roles (name, description) VALUES ('Administrador', 'Acceso total al sistema');
```

**Prueba B (Inserción que debe fallar):**
```sql
INSERT INTO roles (name, description) VALUES ('Administrador', 'Este rol intenta duplicar el nombre');
```

**¿Qué debería pasar?**
La Prueba A inserta correctamente. La Prueba B **debe** lanzar un error similar a: `#1062 - Duplicate entry 'Administrador' for key 'uq_roles_name'`.

**Reflexión para la clase:**
Este error es una **victoria**. La base de datos está protegiendo la integridad del modelo. Sin esta restricción, un programador descuidado podría crear dos roles "Administrador" con permisos distintos, y el sistema de login no sabría cuál usar. La base de datos es la última línea de defensa de la lógica de negocio.

---