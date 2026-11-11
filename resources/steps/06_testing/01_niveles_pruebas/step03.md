## 03. Configurar "Jest" para los niveles de pruebas: Unitarias, Integración y Funcionales

### Paso 1: Configuración de Jest en el Backend (Node.js)

Vamos a instalar Jest y `supertest` (necesario para las pruebas de integración y funcionales que simulan peticiones HTTP).

Abra su terminal en la carpeta `backend/nodejs_express` y ejecute:

```bash
npm install --save-dev jest supertest cross-env
```

*   **jest:** El motor de pruebas.
*   **supertest:** Para simular peticiones HTTP (GET, POST, etc.) sin levantar el servidor real.
*   **cross-env:** Para manejar variables de entorno en Windows/Mac/Linux de forma uniforme.

#### 1.1 Crear el archivo de configuración de Jest (`jest.config.js`)
En la raíz de `backend/nodejs_express`, cree el archivo `jest.config.js` con el siguiente contenido:

```javascript
// backend/nodejs_express/jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'], // Busca archivos .test.js en la carpeta tests
  verbose: true,
  forceExit: true, // Fuerza la salida después de las pruebas (útil por las conexiones a BD)
  clearMocks: true,
  // Reportes que configuraremos en el Punto 10
  reporters: ['default'],
};
```

#### 1.2 Configurar los scripts en `package.json`
Abra el archivo `package.json` del backend y modifique la sección `"scripts"` para que quede así:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon index.js",
  "test": "cross-env NODE_ENV=test jest",
  "test:watch": "cross-env NODE_ENV=test jest --watch",
  "test:coverage": "cross-env NODE_ENV=test jest --coverage"
}
```

> **Nota:** Usamos `NODE_ENV=test` para que, más adelante, podamos configurar la base de datos para que use una BD de pruebas y no la de producción.

#### 1.3 Configurar la Base de Datos para Pruebas (Paso crucial para Integración)
En el Punto 2 definimos pruebas que tocan la BD. Para no dañar su BD real, cree un archivo `.env.test` en la raíz del backend (`backend/nodejs_express/.env.test`):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_node_test
DB_PORT=3306

JWT_SECRET=secret_test_key_123
```

Recuerde crear en su MySQL una base de datos llamada `db_node_test` con la misma estructura de la tabla `users` que tiene en su `db_node`.

---

### Paso 2: Configuración de Jest en el Frontend (React + Vite)

Vite no viene con Jest por defecto (usa Vitest), así que debemos configurarlo manualmente junto con `babel-jest` y `@testing-library/react`.

Abra su terminal en la carpeta `frontend_web/react_node_express` y ejecute:

```bash
npm install --save-dev jest babel-jest @babel/preset-env @babel/preset-react @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

#### 2.1 Crear el archivo `babel.config.cjs`
En la raíz del frontend, cree el archivo `babel.config.cjs` (necesario para que Jest entienda JSX):

```javascript
// frontend_web/react_node_express/babel.config.cjs
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
```

#### 2.2 Crear el archivo de configuración de Jest (`jest.config.cjs`)
En la raíz del frontend, cree el archivo `jest.config.cjs`:

```javascript
// frontend_web/react_node_express/jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    // Manejo de importaciones de CSS en los componentes
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: ['**/tests/**/*.test.(js|jsx)'],
  verbose: true,
};
```

> **Nota:** Necesitamos instalar `identity-obj-proxy` para que Jest no falle cuando los componentes importen CSS:
> `npm install --save-dev identity-obj-proxy`

#### 2.3 Crear el archivo `src/setupTests.js`
Cree este archivo en la carpeta `src` del frontend. Servirá para extender las funcionalidades de Jest con `@testing-library`:

```javascript
// frontend_web/react_node_express/src/setupTests.js
import '@testing-library/jest-dom';
```

#### 2.4 Configurar los scripts en `package.json` (Frontend)
Abra el `package.json` del frontend y agregue los siguientes scripts:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

---

### Paso 3: Estructura de Carpetas Recomendada

Para mantener el orden y que Jest encuentre los archivos, cree la carpeta `tests` en ambos proyectos. La estructura quedaría así:

**Backend:**
```text
backend/nodejs_express/
├── tests/
│   ├── unit/          (Para pruebas unitarias del backend)
│   ├── integration/   (Para pruebas de integración)
│   └── functional/    (Para pruebas funcionales)
├── jest.config.js
├── .env.test
└── package.json
```

**Frontend:**
```text
frontend_web/react_node_express/
├── src/
│   ├── tests/
│   │   ├── unit/      (Para pruebas unitarias de componentes y servicios)
│   └── setupTests.js
├── babel.config.cjs
├── jest.config.cjs
└── package.json
```

---


### ✅ Verificación en el Backend (Node.js)

Para probar la configuración quedó bien es **hacer una prueba de humo (Smoke Test)**. Es decir, crear un test muy básico que verifique que Jest arranca, lee la configuración y ejecuta el entorno correctamente.


1. Cree un archivo de prueba dentro de la carpeta `backend/nodejs_express/tests/unit/` llamado `smoke.test.js`:

```javascript
// backend/nodejs_express/tests/unit/smoke.test.js
describe('Configuración de Jest en Backend', () => {
  test('Jest está funcionando correctamente', () => {
    expect(1 + 1).toBe(2);
  });

  test('El entorno es Node.js', () => {
    expect(typeof process.version).toBe('string');
  });

  test('Las variables de entorno de prueba se cargan', () => {
    // Si configuró .env.test, esto debería existir
    console.log('NODE_ENV:', process.env.NODE_ENV);
    expect(process.env.NODE_ENV).toBe('test');
  });
});
```

2. Abra la terminal en `backend/nodejs_express` y ejecute:

```bash
npm test
```

**¿Qué debe ver?**
*   Jest debe encontrar el archivo `smoke.test.js`.
*   Debe mostrar 3 pruebas pasadas (✓).
*   En consola debe aparecer `NODE_ENV: test`.
*   Al final, un resumen tipo: `Tests: 3 passed, 3 total`.

Si ve eso, **la configuración del backend está correcta**.

---

### ✅ Verificación en el Frontend (React + Vite)

1. Cree un archivo de prueba dentro de `frontend_web/react_node_express/src/tests/unit/` llamado `smoke.test.jsx`:

```jsx
// frontend_web/react_node_express/src/tests/unit/smoke.test.jsx
import { render, screen } from '@testing-library/react';

describe('Configuración de Jest en Frontend', () => {
  test('Jest funciona con JSX', () => {
    const elemento = <h1>Hola Profe Albeiro</h1>;
    expect(elemento).toBeTruthy();
  });

  test('React Testing Library renderiza componentes', () => {
    render(<h1>Hola Profe Albeiro</h1>);
    expect(screen.getByText('Hola Profe Albeiro')).toBeInTheDocument();
  });
});
```

2. Abra la terminal en `frontend_web/react_node_express` y ejecute:

```bash
npm test
```

**¿Qué debe ver?**
*   Jest debe encontrar el archivo `smoke.test.jsx`.
*   Debe mostrar 2 pruebas pasadas (✓).
*   Si `getByText` no falla, significa que **`jsdom` (el entorno de navegador simulado) está funcionando** y que **`@testing-library/jest-dom` está bien cargado** en `setupTests.js`.

---

### 🛠️ ¿Qué hacer si algo falla?

Si alguna prueba falla, aquí le dejo una guía rápida de los errores más comunes y su solución:

| Síntoma | Causa probable | Solución |
| :--- | :--- | :--- |
| `Cannot find module 'jest'` | No se instaló Jest. | Ejecutar `npm install --save-dev jest` |
| `Unexpected token '<'` (Frontend) | Babel no está transformando JSX. | Verificar que `babel.config.cjs` exista y tenga `@babel/preset-react`. |
| `SyntaxError: Cannot use import` (Frontend) | Jest no está usando Babel. | Asegurarse de que `jest.config.cjs` tenga la sección `transform` con `babel-jest`. |
| `toBeInTheDocument is not a function` | Falta `@testing-library/jest-dom`. | Verificar que `setupTests.js` importe `'@testing-library/jest-dom'`. |
| `Cannot find module 'identity-obj-proxy'` | Falta el mock de CSS. | Ejecutar `npm install --save-dev identity-obj-proxy`. |
| `NODE_ENV` es `undefined` | El script no usa `cross-env`. | Verificar el script `"test"` en el `package.json` del backend. |
| No encuentra los archivos de test | `testMatch` mal configurado. | Verificar que los tests estén en la carpeta `tests/` y terminen en `.test.js` (o `.test.jsx`). |

---
