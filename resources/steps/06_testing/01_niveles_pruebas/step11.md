## 11. Reportes HTML en Cypress

Por defecto, Cypress muestra los resultados en la consola de forma simple. Para generar un reporte HTML profesional (ideal para entregar evidencias a los clientes o en sus clases), utilizaremos la herramienta **`mochawesome`**, que es el estándar de la industria para Cypress.

---

### Paso 11.1: Instalación de dependencias

Abra la terminal en `frontend_web/react_node_express` e instale los siguientes paquetes:

```bash
npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator
```

---

### Paso 11.2: Configurar Cypress (`cypress.config.cjs`)

Abra su archivo `cypress.config.cjs` y modifíquelo para usar `mochawesome` como reporter y agregar una tarea que fusione los reportes. Debe quedar exactamente así:

```javascript
// frontend_web/react_node_express/cypress.config.cjs
const { defineConfig } = require("cypress");
const { merge } = require('mochawesome-merge');
const marge = require('mochawesome-report-generator');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    video: false,
    screenshotOnRunFailure: true,
    
    // 👇 CONFIGURACIÓN DE REPORTES HTML
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports/html', // Carpeta donde se guardan los JSON
      overwrite: false,                 // No sobrescribir si hay varios archivos
      html: false,                      // No generar HTML individual por cada test
      json: true,                       // Generar JSON para luego fusionarlo
    },

    setupNodeEvents(on, config) {
      // Tarea para fusionar los reportes JSON en un solo HTML al finalizar
      on('after:run', async () => {
        const jsonReport = await merge({
          files: ['cypress/reports/html/*.json'],
        });
        await marge.create(jsonReport, {
          reportDir: 'cypress/reports/html',
          reportFilename: 'reporte-cypress.html',
          reportTitle: 'Reporte de Pruebas E2E - Cypress',
          inline: true,
        });
        console.log('✅ Reporte HTML de Cypress generado exitosamente.');
      });
      return config;
    },
  },
});
```

---

### Paso 11.3: Limpiar reportes anteriores (Opcional)
Si ejecuta Cypress varias veces, los JSON se acumularán. Puede agregar un script en su `package.json` para limpiar la carpeta antes de correr las pruebas:

```json
"scripts": {
  "cy:clean-reports": "rimraf cypress/reports",
  "cy:run:all": "npm run cy:clean-reports && cypress run"
}
```
*(Si no tiene `rimraf` instalado, puede usar `del-cli` o simplemente borrar la carpeta manualmente antes de correr las pruebas).*

---

### Paso 11.4: ¿Cómo Ejecutar y Visualizar los Reportes?

Ejecute cualquiera de sus pruebas de Cypress (Sistema o Aceptación):
```bash
npm run cy:run:acceptance
```

**¿Qué debe observar?**
1.  **En consola:** Cypress mostrará el resumen clásico de la terminal (pasando/fallando).
2.  **En HTML:** Al finalizar, se creará la carpeta `cypress/reports/html/` y dentro de ella un archivo llamado **`reporte-cypress.html`**. Ábralo en su navegador.
    *   Verá un reporte visual con gráficas de barras, el tiempo de ejecución de cada test, y si alguno falló, la captura de pantalla asociada.
    *   Es un reporte muy profesional que puede exportar como PDF o compartir.

---

### 💡 Nota Pedagógica para su Clase
Explique a sus estudiantes que en los entornos profesionales (CI/CD) no se revisan las consolas manualmente. Se configuran estos reportes para que **se generen automáticamente** y se almacenen como artefactos (en GitHub Actions, Jenkins, etc.). Así, si un test falla en la nube, el equipo puede descargar el HTML y ver exactamente qué pasó con la captura de pantalla.

---

### 🚨 Solución de Errores Comunes (Documentación para sus estudiantes)

Si el reporte no se genera o la terminal arroja errores, revise estos puntos:

**Síntoma 1: `Error: Cannot find module 'mochawesome-merge'`**
*   **Causa:** Las dependencias no se instalaron.
*   **Solución:** Ejecute `npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator`.

**Síntoma 2: No se genera el archivo `reporte-cypress.html` al final.**
*   **Causa:** La tarea `after:run` no se está ejecutando o los JSON no se están guardando.
*   **Solución:** Verifique que la carpeta `cypress/reports/html/` exista (o permita que Cypress la cree) y que su `cypress.config.cjs` tenga la extensión correcta (recuerde que en este proyecto usamos `.cjs` por el `type: module` de Vite).

**Síntoma 3: Los videos pesan mucho y saturan la carpeta.**
*   **Causa:** Dejó `video: true` en la configuración.
*   **Solución:** Vuelva a poner `video: false` en `cypress.config.cjs`. Los reportes HTML con capturas de pantalla son suficientes para las evidencias.
