## 10. Reportes HTML en Jest

Por defecto, Jest muestra los resultados en la consola con un formato básico. Para darle un aspecto más profesional (ideal para sus clases y para entregar evidencias), utilizaremos una librería llamada **`jest-html-reporters`**, que generará un archivo HTML interactivo con los resultados.

*(Nota: La configuración de los reportes por consola ya la tenemos parcialmente con `verbose: true`, pero la potenciaremos).*

---

### Paso 10.1: Instalación de la librería de reportes

Abra la terminal en **ambos proyectos** (Backend y Frontend) e instale la dependencia de desarrollo:

```bash
npm install --save-dev jest-html-reporters
```

---

### Paso 10.2: Configurar Jest en el Backend

Abra su archivo `backend/nodejs_express/jest.config.js` y modifíquelo para incluir el nuevo reporter. Debe quedar así:

```javascript
// backend/nodejs_express/jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  maxWorkers: 1, 
  
  // 👇 CONFIGURACIÓN DE REPORTES
  reporters: [
    'default', // Muestra el resumen en consola
    [
      'jest-html-reporters',
      {
        publicPath: './reports/backend', // Carpeta donde se guardará el HTML
        filename: 'reporte-backend.html',
        expand: true,
        pageTitle: 'Reporte de Pruebas - Backend Node.js',
        hideIcon: false,
      },
    ],
  ],
};
```

---

### Paso 10.3: Configurar Jest en el Frontend

Abra su archivo `frontend_web/react_node_express/jest.config.cjs` y haga lo mismo:

```javascript
// frontend_web/react_node_express/jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: ['**/tests/**/*.test.(js|jsx)'],
  verbose: true,

  // 👇 CONFIGURACIÓN DE REPORTES
  reporters: [
    'default', // Muestra el resumen en consola
    [
      'jest-html-reporters',
      {
        publicPath: './reports/frontend', // Carpeta donde se guardará el HTML
        filename: 'reporte-frontend.html',
        expand: true,
        pageTitle: 'Reporte de Pruebas - Frontend React',
        hideIcon: false,
      },
    ],
  ],
};
```

---

### Paso 10.4: ¿Cómo Ejecutar y Visualizar los Reportes?

1. Abra la terminal en el Backend y ejecute:
```bash
npm test
```
2. Abra la terminal en el Frontend y ejecute:
```bash
npm test
```

**¿Qué debe observar?**
*   **En consola:** Jest seguirá mostrando los resultados con los checkmarks verdes (✓) gracias al reporter `default` y `verbose: true`.
*   **En HTML:** Se habrá creado una nueva carpeta llamada `reports/` en cada proyecto. 
    *   En el backend: `backend/nodejs_express/reports/backend/reporte-backend.html`.
    *   En el frontend: `frontend_web/react_node_express/reports/frontend/reporte-frontend.html`.

Abra esos archivos HTML en su navegador. Verá una interfaz gráfica muy bonita con una gráfica de pastel (cuántos tests pasaron/fallaron), el tiempo de ejecución y el detalle de cada caso de prueba.

---

### 🚨 Solución de Errores Comunes (Documentación para sus estudiantes)

Durante la implementación de reportes, es común toparse con estos detalles:

**Síntoma 1: Error `Cannot find module 'jest-html-reporters'`.**
*   **Causa:** La librería no se instaló en el proyecto correcto.
*   **Solución:** Asegúrese de haber ejecutado `npm install --save-dev jest-html-reporters` tanto en la carpeta del backend como en la del frontend.

**Síntoma 2: Error en Frontend `Cannot use import statement outside a module` al usar Jest.**
*   **Causa:** El archivo de configuración de Jest (`jest.config.cjs`) o Babel no está transformando correctamente la librería.
*   **Solución:** Asegúrese de que su `jest.config.cjs` use la extensión `.cjs` (como lo configuramos) y que el archivo `babel.config.cjs` esté en la raíz del frontend.

**Síntoma 3: La carpeta `reports` no se crea.**
*   **Causa:** El proceso de Jest no tiene permisos de escritura o la ruta `publicPath` está mal escrita.
*   **Solución:** Verifique que la ruta `'./reports/backend'` sea correcta y que el usuario de su sistema operativo tenga permisos de escritura en esa carpeta.
