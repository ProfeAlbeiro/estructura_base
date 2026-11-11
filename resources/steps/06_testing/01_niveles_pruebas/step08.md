## 08. Pruebas de Sistema

En este nivel (Nivel 4), evaluamos el sistema completo End-to-End (E2E). Cypress abrirá un navegador real, interactuará con el Frontend (React), enviará peticiones al Backend (Node.js) y verificará que la Base de Datos (MySQL) responda correctamente. Es la prueba definitiva de que todas las piezas de su arquitectura encajan.

Recuerde que los casos a implementar son los **ST-01 a ST-05** de nuestra tabla.

### 🛠️ Requisitos Previos

Asegúrese de tener **corriendo en paralelo** (en terminales separadas):

1.  **Modifique el `package.json` del Backend:** Agregue un script para iniciar el servidor apuntando a la BD de pruebas.
    ```json
    "scripts": {
      "start": "node server.js",
      "start:test": "cross-env NODE_ENV=test node index.js",  // 👈 Nuevo script
      "test": "cross-env NODE_ENV=test jest"
    }
    ```
2.  **Inicie el Backend en modo Test:** Abra una terminal en `backend/nodejs_express` y ejecute `npm run start:test`. (Verá en consola que se conecta a `db_node_test`).
3.  **Inicie el Frontend:** Abra otra terminal en `frontend_web/react_node_express` y ejecute `npm run dev`.
4. Abra el archivo ".gitignore" del proyecto "frontend" y escribir lo siguiente:

```.gitignore
# Cypress generated files
**/cypress/screenshots/
**/cypress/videos/
**/cypress/downloads/
```

### Paso 8.1: El Código de las Pruebas de Sistema

Cree el archivo `cypress/e2e/system/users.system.cy.js` y pegue el siguiente código:

```javascript
// cypress/e2e/system/users.system.cy.js

describe('Nivel 4: Pruebas de Sistema (E2E) - Flujos Completos', () => {
  
  // ST-01: Login exitoso y redirección
  it('ST-01: Debe permitir el login y redirigir al Dashboard', () => {
    cy.visit('/login');
    
    cy.get('input[type="email"]').type('admin@test.com');
    cy.get('input[type="password"]').type('password123'); // 👈 Reemplace con su contraseña
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Bienvenido,').should('be.visible');
  });

  // ST-02: Protección de Rutas
  it('ST-02: Debe redirigir al login si se intenta acceder al Dashboard sin estar autenticado', () => {
    cy.clearLocalStorage();
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  // ST-03: Crear un usuario desde la interfaz gráfica
  it('ST-03: Debe crear un usuario a través del formulario y mostrarlo en la tabla', () => {
    cy.login('admin@test.com', 'password123');
    cy.visit('/dashboard');
    
    cy.contains('button', 'Usuarios').click();
    cy.contains('button', '+ Nuevo Usuario').click();
    
    const emailUnico = `cypress_${Date.now()}@test.com`;
    cy.get('input[name="name"]').type('Usuario Creado por Cypress');
    cy.get('input[name="lastname"]').type('ApellidoTest');
    cy.get('input[name="email"]').type(emailUnico);
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    
    cy.contains('button', 'Crear').click();
    
    cy.contains('Operación completada exitosamente').should('be.visible');
    cy.get('table').should('contain', emailUnico);
  });

  // ST-04: Eliminar un usuario desde la interfaz gráfica
  it('ST-04: Debe eliminar un usuario de la tabla', () => {
    cy.login('admin@test.com', 'password123');
    cy.visit('/dashboard');
    cy.contains('button', 'Usuarios').click();

    const emailAEliminar = `eliminar_${Date.now()}@test.com`;
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/users/create', // 👈 Asegúrese de usar su IP correcta
      body: { name: "Para Borrar", lastname: "Test", email: emailAEliminar, password: "123" }
    });

    cy.reload();
    cy.contains('button', 'Usuarios').click();

    cy.contains('tr', emailAEliminar).within(() => {
      cy.get('button.btn-delete').click();
    });

    cy.on('window:confirm', () => true);

    cy.contains('Usuario eliminado exitosamente').should('be.visible');
    cy.get('table').should('not.contain', emailAEliminar);
  });

  // ST-05: Validación de UI
  it('ST-05: Debe mostrar un mensaje de error si se intenta hacer login con campos vacíos', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    cy.contains('Por favor complete todos los campos').should('be.visible');
  });

});
```

---

### Paso 8.3: ¿Cómo Ejecutar estas Pruebas?

En la terminal del frontend, ejecute:
```bash
npm run cy:run:system
```

En el navegador en tiempo real, ejecute:
```bash
npx cypress open
```

---

### 💡 NOTA
En este punto, sus estudiantes aprenderán dos cosas clave:
1.  **Aislamiento de Entornos:** El backend lee `.env.test` gracias a `NODE_ENV=test`, garantizando que las pruebas destructivas (como borrar usuarios) no toquen la base de datos de desarrollo.
2.  **Cypress vs Jest:** Cypress hace clics reales en React y espera a que el DOM se actualice, mientras que en Jest simulábamos todo.

---

### 🚨 Solución de Errores Comunes y Ajustes (Documentación del caso real)

Durante la implementación, nos enfrentamos a varios retos de red y configuración. Aquí tiene la guía de solución para sus estudiantes:

**1. Error de Red (`Error: connect ETIMEDOUT`) por cambio de IP en Cypress.**
*   **Causa:** Su red local cambió (o se conectó a otra red WiFi) y la IP del backend dejó de ser válida. Cypress intenta hacer peticiones a la IP "vieja" y falla en los tests que usan `cy.request()` (ST-03 y ST-04).
*   **Solución:** Debe actualizar la IP en **dos archivos específicos** de Cypress cada vez que cambie de red:
    *   **`cypress/support/commands.js`**: En la URL de `cy.request` dentro del comando `cy.login`.
    *   **`cypress/e2e/system/users.system.cy.js`**: En la URL de `cy.request` dentro del test ST-04.
    *   *Consejo:* Use `localhost` si el backend y Cypress corren en la misma máquina, o la IP actual de su equipo (ej. `http://10.1.195.158:3000`) si corre en red.

**2. ¡Peligro! Cypress borraba datos de `db_node` y no de `db_node_test`.**
*   **Causa:** El script `npm start` levantaba el servidor en modo desarrollo. Al correr Cypress, este se conectaba al backend de desarrollo, que a su vez apuntaba a `db_node`.
*   **Solución:** 
    1. Crear el script `"start:test": "cross-env NODE_ENV=test node index.js"` en el `package.json` del backend.
    2. Iniciar siempre el backend con `npm run start:test` antes de correr Cypress.
    3. (Opcional) Implementar la ruta `/api/test/clean` y el `beforeEach` en Cypress (como se mostró en el Paso 8.1) para limpiar la tabla entre pruebas.

**3. `cy.login()` falla con error 401.**
*   **Causa:** La contraseña puesta en el test (`'password123'`) no coincide con el hash en la BD de pruebas.
*   **Solución:** Asegúrese de que el usuario `admin@test.com` exista en `db_node_test` con la contraseña correcta. Puede insertarlo directamente con un hash de bcrypt generado por usted.

**4. `cy.click() failed because it targeted a disabled element` (ST-04).**
*   **Causa:** El botón de eliminar (🗑️) está deshabilitado si el usuario logueado no es `admin`.
*   **Solución:** Verifique que el token devuelto en `cy.login` pertenezca a un usuario con rol `admin` en la BD de pruebas.

**5. Error de CORS.**
*   **Causa:** El backend bloquea peticiones desde la IP del frontend o de Cypress.
*   **Solución:** Verifique el archivo `index.js` del backend y asegúrese de tener la IP actual en la lista de `origin` de CORS.
