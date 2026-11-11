## 09. Pruebas de Aceptación

En este último nivel (Nivel 5), evaluamos el sistema desde la perspectiva del **Usuario Final o Cliente**. Aquí no nos importa cómo está programado el backend ni si hay tokens o middlewares; lo que importa es que **los criterios de aceptación del negocio se cumplan**. ¿El sistema es usable? ¿Restringe lo que debe restringir? ¿Da confianza al usuario?

Implementaremos los casos **AT-01 a AT-05** de nuestra tabla. Recuerde que estas pruebas se ejecutan en el entorno más realista posible (idealmente con el Backend corriendo en modo test y el Frontend en desarrollo).

---

### Paso 9.1: El Código de las Pruebas de Aceptación

Cree el archivo `cypress/e2e/acceptance/users.acceptance.cy.js` y pegue el siguiente código:

```javascript
// cypress/e2e/acceptance/users.acceptance.cy.js

describe('Nivel 5: Pruebas de Aceptación (UAT) - Criterios del Cliente', () => {
  
  // AT-01: Registro de Cliente Autónomo
  it('AT-01: El cliente debe poder registrarse y ver un mensaje de confirmación', () => {
    cy.visit('/register');
    
    // Generamos datos únicos para el nuevo cliente
    const emailCliente = `cliente_${Date.now()}@test.com`;
    
    // Llenamos el formulario de registro
    cy.get('input[name="name"]').type('Cliente');
    cy.get('input[name="lastname"]').type('Aceptacion');
    cy.get('input[name="email"]').type(emailCliente);
    cy.get('input[name="phone"]').type('3001234567');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    
    // Por defecto el rol es 'user', así que lo dejamos así
    cy.get('button[type="submit"]').click();
    
    // El sistema debe confirmar el registro (AlertMessage de éxito)
    cy.contains('Usuario registrado exitosamente').should('be.visible');
    
    // Y debe redirigir al login después de 2 segundos (según su código)
    cy.url().should('include', '/login', { timeout: 5000 });
  });

  // AT-02: Restricción de Rol (Vendedor no puede eliminar)
  it('AT-02: Un usuario con rol "Vendedor" no debe ver el botón de eliminar', () => {
    // 1. Creamos un usuario vendedor por API para agilizar el test
    const emailVendedor = `vendedor_${Date.now()}@test.com`;
    cy.request({
      method: 'POST',
      url: 'http://10.1.195.158:3000/api/users/create', // 👈 Asegúrese de usar su IP correcta
      body: { 
        name: "Vendedor", 
        lastname: "Test", 
        email: emailVendedor, 
        password: "password123",
        role: "seller" // 👈 Forzamos el rol de vendedor
      }
    });

    // 2. Hacemos login con ese vendedor
    cy.login(emailVendedor, 'password123');
    cy.visit('/dashboard');
    cy.contains('button', 'Usuarios').click();

    // 3. Buscamos el botón de eliminar en la tabla
    // Debe existir en el DOM, pero estar deshabilitado por la lógica de React (canDelete)
    cy.get('button.btn-delete').first().should('be.disabled');
  });

  // AT-03: Restricción de Rol (Admin no puede auto-eliminarse)
  it('AT-03: Un administrador no debe poder eliminar su propio usuario', () => {
    cy.login('admin@test.com', 'password123');
    cy.visit('/dashboard');
    cy.contains('button', 'Usuarios').click();

    // Buscamos la fila del administrador logueado
    cy.contains('tr', 'admin@test.com').within(() => {
      // Verificamos que el botón de eliminar esté deshabilitado (por la lógica de React)
      cy.get('button.btn-delete').should('be.disabled');
    });
  });

  // AT-04: Persistencia de Datos
  it('AT-04: Los datos creados deben persistir al recargar la página', () => {
    cy.login('admin@test.com', 'password123');
    cy.visit('/dashboard');
    cy.contains('button', 'Usuarios').click();

    // Creamos un usuario rápido
    const emailPersistente = `persistente_${Date.now()}@test.com`;
    cy.request({
      method: 'POST',
      url: 'http://10.1.195.158:3000/api/users/create', // 👈 Asegúrese de usar su IP correcta
      body: { name: "Persistente", lastname: "Test", email: emailPersistente, password: "123" }
    });

    // Recargamos la página fuertemente
    cy.reload();
    cy.contains('button', 'Usuarios').click();

    // El usuario debe seguir en la tabla (porque está en la BD real)
    cy.get('table').should('contain', emailPersistente);
  });

  // AT-05: Cierre de Sesión Seguro
  it('AT-05: El usuario debe poder cerrar sesión y limpiar el almacenamiento local', () => {
    cy.login('admin@test.com', 'password123');
    cy.visit('/dashboard');

    // Hacemos clic en Cerrar Sesión (está en el Header del Dashboard)
    cy.contains('button', 'Cerrar Sesión').click();

    // Verificamos que redirige al login
    cy.url().should('include', '/login');

    // Verificamos que el token y los datos del usuario se borraron
    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.be.null;
      expect(win.localStorage.getItem('user_data')).to.be.null;
    });
  });

});
```

---

### Paso 9.2: ¿Cómo Ejecutar estas Pruebas?

Para ejecutar este nivel, abra la terminal en el frontend y ejecute:

```bash
npm run cy:run:acceptance
```
*(Si desea ver el navegador en tiempo real, ejecute `npx cypress open` y seleccione el archivo en la carpeta de aceptación).*

**¿Qué debe observar?**
1. Cypress abrirá el navegador y simulará los clics del usuario.
2. Debería ver un semáforo en verde con los 5 tests pasando (`All specs passed!`).
3. Si algo falla, tome la captura de pantalla que Cypress genera automáticamente en la carpeta `screenshots`.

---

### 💡NOTA
Explique la diferencia entre el Nivel 4 y el Nivel 5:
*   **Sistema (Nivel 4):** "El botón de eliminar funciona y borra en la BD".
*   **Aceptación (Nivel 5):** "El sistema es seguro, porque un Administrador no puede borrarse a sí mismo y un Vendedor no tiene permitido borrar a nadie". 
Aquí evaluamos las **reglas de negocio y la experiencia del usuario**.

---

### 🚨 Solución de Errores Comunes (Documentación para sus estudiantes)

Al igual que en el Nivel 4, es probable que se presenten problemas de red o de datos. Aquí tiene la guía exacta:

**Síntoma 1: `CypressError: cy.request() failed trying to load... Error: connect ETIMEDOUT`**
*   **Causa:** Su IP local cambió o el backend no está corriendo en la IP que dice el código.
*   **Solución:** Actualice la URL del `cy.request` en los tests **AT-02** y **AT-04** (que en el código dice `http://localhost:3000`). Cámbielo por la IP actual de su máquina (ej. `http://10.1.195.158:3000`) si es necesario.

**Síntoma 2: El test AT-02 falla diciendo que el botón no está deshabilitado.**
*   **Causa:** El frontend (`UsersView.jsx`) verifica el rol del usuario logueado guardado en el `localStorage`. Si el `cy.login()` no guardó el rol como `seller`, el botón aparecerá habilitado.
*   **Solución:** Asegúrese de que el comando `cy.login` en `commands.js` esté guardando el `user_data` completo (que incluye el `role`). Verifique en la consola de Cypress que el usuario creado en el AT-02 sí tenga el rol `seller` en la base de datos.

**Síntoma 3: El test AT-03 no muestra la alerta "No puede eliminar su propio usuario".**
*   **Causa:** El `cy.login` se hizo con un usuario diferente al que se está intentando borrar en la tabla. 
*   **Solución:** Asegúrese de que el email usado en `cy.login` sea exactamente el mismo que está en el `cy.contains('tr', '...')`. Ambos deben ser el correo del administrador.

**Síntoma 4: El test AT-05 falla porque `localStorage` no está vacío.**
*   **Causa:** Su función `logout` en React no está llamando a `storageService.clearSession()` o el botón clickeado no es el correcto.
*   **Solución:** Verifique en `DashboardView.jsx` que la función `handleLogout` limpie correctamente el almacenamiento.
