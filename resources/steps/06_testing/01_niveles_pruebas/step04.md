## 04. Configurar "Cyperss" para los niveles de pruebas: Sistema y Aceptación

### Paso 4.1: Instalación
Abra la terminal en `frontend_web/react_node_express` y ejecute:
```bash
npm install --save-dev cypress
```

### Paso 4.2: Inicialización y Estructura
Ejecute `npx cypress open`. En la ventana gráfica:
1. Seleccione **"E2E Testing"**.
2. Seleccione un navegador (Chrome o Electron) y dé clic en **"Start"**.
3. Cypress creará las carpetas. Puede cerrar la ventana gráfica.

**Organización de carpetas:**
Elimine las carpetas de ejemplo que crea Cypress por defecto (`1-getting-started`, `2-advanced-examples`) dentro de `cypress/e2e/`. Luego, cree la siguiente estructura:
```text
frontend_web/react_node_express/
├── cypress/
│   ├── e2e/
│   │   ├── system/         <-- Tests de Sistema (Nivel 4)
│   │   └── acceptance/     <-- Tests de Aceptación (Nivel 5)
│   └── support/
```

### Paso 4.3: Configuración del archivo `cypress.config.cjs` (¡Solución al Error 1!)
**El problema:** Vite inyecta `"type": "module"` en el `package.json`. Cypress espera CommonJS (`require`) en su configuración. Si usa `.js`, arrojará `ReferenceError: require is not defined`.
**La solución:** Usar la extensión `.cjs`.

Cree (o renombre) el archivo `cypress.config.cjs` en la raíz del frontend y pegue:

```javascript
// frontend_web/react_node_express/cypress.config.cjs
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // URL de Vite
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    video: false,
    screenshotOnRunFailure: true,
    reporter: 'spec',
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
```

### Paso 4.4: Configuración de Soporte `e2e.js` (¡Solución al Error 2!)
**El problema:** Como el `package.json` es un ES Module, Cypress buscaba un archivo `.js` de soporte pero no lo encontrábamos o fallaba al usar `require`.
**La solución:** Crear el archivo con la extensión correcta (`.js`) pero usando la sintaxis nativa de módulos (`import`).

Cree el archivo `cypress/support/e2e.js` y pegue:

```javascript
// frontend_web/react_node_express/cypress/support/e2e.js
import './commands.js';

// Silencia errores no capturados de React en desarrollo
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
```

### Paso 4.5: Crear el Comando Personalizado (Custom Command)
Para no tener que escribir el usuario y la contraseña en cada test, crearemos un comando `cy.login()`.
Cree el archivo `cypress/support/commands.js` y pegue:

```javascript
// frontend_web/react_node_express/cypress/support/commands.js

Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: 'http://192.168.78.145:3000/api/users/login', // Asegúrese de que su backend corra aquí
    body: { email, password },
  }).then((response) => {
    expect(response.status).to.eq(201);
    const token = response.body.data.session_token.replace('JWT ', '');
    
    // Guardamos el token en el localStorage simulando a React
    window.localStorage.setItem('auth_token', token);
    window.localStorage.setItem('user_data', JSON.stringify(response.body.data));
  });
});
```

### Paso 4.6: Scripts en el `package.json`
Agregue los comandos de Cypress en el `package.json` del frontend:

```json
"scripts": {
  "cy:open": "cypress open",
  "cy:run:system": "cypress run --spec 'cypress/e2e/system/**/*.cy.js'",
  "cy:run:acceptance": "cypress run --spec 'cypress/e2e/acceptance/**/*.cy.js'"
}
```

### Paso 4.7: Prueba de Humo (Smoke Test)
Para validar que todo quedó bien configurado a pesar de los errores anteriores, cree el archivo `cypress/e2e/system/smoke.cy.js`:

```javascript
describe('Configuración de Cypress', () => {
  it('Cypress está funcionando correctamente', () => {
    expect(true).to.equal(true);
  });

  it('El frontend está corriendo y responde', () => {
    cy.visit('/');
    cy.contains('Sistema de Información Web');
  });
});
```

**Ejecución:**
1. Asegúrese de tener el Backend y Frontend corriendo (`npm start` y `npm run dev`).
2. Ejecute en la terminal del frontend:
```bash
npm run cy:run:system
```
*Si el resultado es "All specs passed! (2 passing)", la configuración está lista y blindada contra los errores de Vite.*

---