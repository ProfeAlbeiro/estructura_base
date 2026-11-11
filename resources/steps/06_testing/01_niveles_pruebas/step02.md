## 02. Casos de Prueba por Niveles

### 🔹 Nivel 1: Pruebas Unitarias (Jest)
*Enfoque: Lógica pura, funciones aisladas, middlewares y componentes de React.*

| ID | Módulo / Componente | Descripción del Caso de Prueba | Datos de Entrada | Resultado Esperado | Tipo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UT-01** | `jwtService.js` (Frontend) | Verificar que un token válido generado no haya expirado. | Token generado con `exp` en el futuro. | La función `verifyToken()` debe retornar `true`. | Positivo |
| **UT-02** | `jwtService.js` (Frontend) | Verificar que un token expirado sea rechazado. | Token generado con `exp` en el pasado (ej. hace 1 hora). | La función `verifyToken()` debe retornar `false`. | Negativo |
| **UT-03** | `authMiddleware.js` (Backend) | Verificar que el middleware rechace peticiones sin token. | Objeto `req` sin cabecera `authorization`. | Debe retornar un estado HTTP `403` y un mensaje de error. | Negativo |
| **UT-04** | `user.js` (Modelo Backend) | Verificar que la función `create` encripte la contraseña antes de guardar. | Objeto usuario: `{ password: "123456" }`. | La contraseña enviada a la BD debe ser un hash (iniciar con `$2b$`), no el texto plano. | Positivo |
| **UT-05** | `AlertMessage.jsx` (Frontend) | Verificar que el componente renderice el mensaje correctamente. | Prop `message="Error de prueba"` y `type="error"`. | El componente debe mostrar en pantalla el texto "Error de prueba". | Positivo |

---

### 🔹 Nivel 2: Pruebas de Integración (Jest + Supertest)
*Enfoque: Interacción entre Controlador, Rutas, Modelo y Base de Datos (usando una BD de pruebas).*

| ID | Módulo / Componente | Descripción del Caso de Prueba | Datos de Entrada | Resultado Esperado | Tipo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IT-01** | Ruta `POST /api/users/create` | Integración de Router + Controller + Model + DB al crear un usuario. | JSON: `{ "name": "Test", "email": "test@test.com", "password": "123" }` | Debe retornar HTTP `201` y el usuario debe existir en la BD de pruebas. | Positivo |
| **IT-02** | Ruta `POST /api/users/login` | Integración de autenticación: validar que se genere un JWT real. | JSON: `{ "email": "profealbeiro2020@gmail.com", "password": "..." }` | Debe retornar HTTP `201` y un `session_token` válido. | Positivo |
| **IT-03** | Ruta `GET /api/users` | Integración de Auth Middleware + Controller al listar usuarios. | Petición HTTP con cabecera `Authorization: Bearer <token_valido>`. | Debe retornar HTTP `200` y un arreglo con la lista de usuarios. | Positivo |
| **IT-04** | Ruta `DELETE /api/users/delete/:id` | Integración de permisos de Rol (Admin) al eliminar. | Petición DELETE con token de Admin a un ID existente. | Debe retornar HTTP `200` y el usuario debe ser borrado de la BD. | Positivo |
| **IT-05** | Ruta `PUT /api/users/:id` | Integración del modelo de actualización dinámica en la BD. | JSON: `{ "name": "Nuevo Nombre" }` y token válido. | Debe retornar HTTP `200` y en la BD el campo `name` debe haber cambiado. | Positivo |

---

### 🔹 Nivel 3: Pruebas Funcionales (Jest + Supertest)
*Enfoque: Caja Negra. Se prueba el requerimiento completo HTTP sin importar la implementación interna.*

| ID | Funcionalidad | Descripción del Caso de Prueba | Datos de Entrada | Resultado Esperado | Tipo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FT-01** | Registro de Usuario | Validar que no se pueda registrar un email duplicado. | JSON con el email `"profealbeiro2020@gmail.com"` (ya existente). | Debe retornar HTTP `501` y mensaje de error (Error de BD por UNIQUE). | Negativo |
| **FT-02** | Login de Usuario | Validar inicio de sesión con contraseña incorrecta. | JSON: `{ "email": "profealbeiro...", "password": "incorrecta" }` | Debe retornar HTTP `401` y mensaje "Contraseña o correo incorrecto". | Negativo |
| **FT-03** | Gestión de Usuarios | Validar que un rol no autorizado (User) no pueda listar usuarios. | Token de usuario con `role: "user"` a `GET /api/users`. | Debe retornar HTTP `403` (Acceso denegado). | Negativo |
| **FT-04** | Validación de Datos | Validar que el registro exija campos obligatorios (ej. email). | JSON: `{ "name": "Sin Correo", "password": "123" }` (sin email). | Debe retornar HTTP `501` y no crear el usuario en la BD. | Negativo |
| **FT-05** | Actualización Parcial | Validar que se pueda actualizar solo el teléfono sin afectar otros campos. | JSON: `{ "phone": "3000000000" }` a `PUT /api/users/:id`. | HTTP `200`, el teléfono cambia, el nombre y email permanecen intactos. | Positivo |

---

### 🔹 Nivel 4: Pruebas de Sistema (Cypress)
*Enfoque: End-to-End (E2E). Interacción real del Frontend (React) con el Backend (Node) y la BD (MySQL).*

| ID | Flujo del Sistema | Descripción del Caso de Prueba | Datos de Entrada | Resultado Esperado | Tipo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ST-01** | Autenticación E2E | Flujo completo: Login exitoso y redirección al Dashboard. | Email admin, contraseña válida. | La URL debe cambiar a `/dashboard` y mostrar el nombre del usuario. | Positivo |
| **ST-02** | Protección de Rutas | Intentar acceder al Dashboard sin estar logueado. | Visitar URL directa `/dashboard`. | El sistema debe redirigir automáticamente a `/login`. | Negativo |
| **ST-03** | Gestión CRUD E2E | Crear un usuario desde la interfaz gráfica. | Llenar formulario "Nuevo Usuario" y dar clic en Guardar. | El modal se cierra, aparece alerta de éxito y el usuario sale en la tabla. | Positivo |
| **ST-04** | Gestión CRUD E2E | Eliminar un usuario desde la interfaz gráfica. | Clic en el ícono de basura (🗑️) de un usuario y confirmar. | El usuario desaparece de la tabla y aparece alerta de éxito. | Positivo |
| **ST-05** | UI / Responsividad | Verificar que el formulario de login muestre error si faltan campos. | Clic en "Iniciar Sesión" con campos vacíos. | Debe mostrarse el mensaje "Por favor complete todos los campos". | Negativo |

---

### 🔹 Nivel 5: Pruebas de Aceptación (Cypress)
*Enfoque: Criterios de aceptación del negocio. Se simula el comportamiento y las expectativas del cliente final (UAT).*

| ID | Criterio de Aceptación | Descripción del Caso de Prueba | Datos de Entrada | Resultado Esperado | Tipo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AT-01** | Registro de Cliente | El cliente debe poder registrarse solo y entrar al sistema. | Ir a `/register`, llenar datos, crear cuenta e ir a Login. | El sistema confirma "Usuario registrado exitosamente". | Positivo |
| **AT-02** | Restricción de Rol | Un usuario "Vendedor" no debe ver el botón de eliminar. | Login con usuario `role: "seller"`. | El botón de eliminar (🗑️) debe estar deshabilitado o no visible. | Negativo |
| **AT-03** | Restricción de Rol | Un administrador no puede eliminarse a sí mismo. | Login Admin, buscar su propio usuario, intentar borrarlo. | El sistema muestra una alerta "No puede eliminar su propio usuario". | Negativo |
| **AT-04** | Persistencia de Datos | Los datos creados deben persistir al recargar la página. | Crear un usuario, recargar con F5, buscar en la tabla. | El usuario sigue apareciendo en la lista. | Positivo |
| **AT-05** | Cierre de Sesión | El usuario debe poder cerrar sesión de forma segura. | Clic en "Cerrar Sesión". | Es redirigido a `/login` y el `localStorage` queda limpio. | Positivo |

---
