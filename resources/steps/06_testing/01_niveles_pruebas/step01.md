## 01. Explicación de los Niveles de Prueba

#### 🔹 Nivel 1: Pruebas Unitarias (Unit Testing)
*   **Objetivo:** Detectar errores en la lógica, algoritmos y datos de una unidad mínima de código (una función, un método, un componente aislado).
*   **Participantes:** Programadores y QA.
*   **Ambiente:** Desarrollo.
*   **Método:** Caja Blanca (se conoce el código).
*   **Herramienta:** **Jest**.
*   **Aplicación en su App:**
    *   **Backend:** Probar la función `User.create` en `models/user.js` para verificar que encripte la contraseña correctamente antes de guardarla. Probar el middleware `authMiddleware.js` con un token falso para ver si devuelve un error 401.
    *   **Frontend:** Probar la función `jwtService.js` (verificar si un token expirado devuelve `false`). Probar un componente de React (ej. `AlertMessage.jsx`) para ver si renderiza el texto correcto.

#### 🔹 Nivel 2: Pruebas de Integración (Integration Testing)
*   **Objetivo:** Detectar errores en las interfaces y relaciones entre componentes. ¿Cómo se comunican el controlador, el modelo y la base de datos? ¿O cómo se comunican los componentes de React entre sí?
*   **Participantes:** Programadores y QA.
*   **Ambiente:** Desarrollo.
*   **Método:** Caja Blanca / Top-Down / Bottom-Up.
*   **Herramienta:** **Jest** (junto con `supertest` y una base de datos de prueba).
*   **Aplicación en su App:**
    *   **Backend:** Probar la ruta `POST /api/users/create` (usando `supertest`). Esto integra el Router (`userRoutes.js`), el Controlador (`userController.js`) y el Modelo (`user.js`). Se verifica que si envío un JSON válido, el usuario realmente se guarde en una base de datos MySQL de prueba y devuelva un estado 201.
    *   **Frontend:** Probar el `UserForm.jsx` integrado con el hook `useUsers.js`, simulando que el hook devuelve datos y verificando que el formulario los pinte.

#### 🔹 Nivel 3: Pruebas Funcionales (Functional Testing)
*   **Objetivo:** Detectar errores en la implementación de los requerimientos. Se prueba una funcionalidad completa desde el punto de vista del negocio, pero sin la interfaz gráfica de usuario (UI).
*   **Participantes:** Programadores, Testers, Analistas, QA.
*   **Ambiente:** Desarrollo.
*   **Método:** Caja Negra (no importa cómo esté hecho, sino qué hace).
*   **Herramienta:** **Jest** (usando `supertest` para simular peticiones HTTP reales).
*   **Aplicación en su App:**
    *   **Backend:** Probar el flujo completo de "Iniciar Sesión". Enviar un `POST /api/users/login` con el correo de "Albeiro" y su contraseña, y verificar que la respuesta contenga un `session_token` válido y el rol "admin". Luego, intentar con una contraseña incorrecta y verificar que devuelva 401.

#### 🔹 Nivel 4: Pruebas de Sistema (System Testing)
*   **Objetivo:** Detectar fallas en el cumplimiento de los requerimientos del sistema en su totalidad, incluyendo el entorno real, frontend, backend y base de datos interactuando juntos.
*   **Participantes:** Testers, Analistas, QA.
*   **Ambiente:** Desarrollo / Staging.
*   **Método:** Caja Negra.
*   **Herramienta:** **Cypress**.
*   **Aplicación en su App:**
    *   Probar el flujo End-to-End (E2E). Cypress abrirá el navegador, irá a `http://localhost:5173/login`, escribirá el correo, la contraseña, hará clic en "Iniciar Sesión", esperará a que el backend responda, verificará que la URL cambie a `/dashboard` y que la tabla de usuarios se cargue con los datos reales de MySQL.

#### 🔹 Nivel 5: Pruebas de Aceptación (Acceptance Testing)
*   **Objetivo:** Detectar fallas en la implementación del sistema verificando si cumple con los criterios de aceptación del cliente/usuario final. ¿El sistema resuelve el problema para el que fue creado?
*   **Participantes:** Testers, Analistas, Cliente, QA.
*   **Ambiente:** Productivo (o un entorno idéntico al productivo).
*   **Método:** Caja Negra.
*   **Herramienta:** **Cypress** (usando el patrón Page Object Model para simular el comportamiento del usuario).
*   **Aplicación en su App:**
    *   Simular que un Administrador ingresa al sistema, va a la pestaña "Usuarios", crea un nuevo usuario con rol "Vendedor", y luego intenta eliminar a ese usuario. Cypress validará que el sistema muestre los mensajes de éxito ("Usuario creado correctamente", "Usuario eliminado") y que el flujo sea intuitivo para el usuario final.

---