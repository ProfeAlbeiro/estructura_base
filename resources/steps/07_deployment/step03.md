# 🚀 Paso 3: Despliegue del Frontend en Azure (Guía Definitiva y Blindada)

## 📖 1. Explicación y Contexto para sus Estudiantes

Para el Frontend (React + Vite), la herramienta ideal sería *Azure Static Web Apps*, pero las cuentas educativas tienen restricciones de región que impiden su creación. Por lo tanto, la solución profesional es usar **Azure App Service**, el mismo servicio del Backend.

**El gran reto:** React genera archivos estáticos (HTML, CSS, JS). Azure App Service espera un servidor Node.js. Para resolverlo, compilaremos el Frontend (`npm run build`) y crearemos un pequeño servidor estático con el paquete `serve` para que Azure pueda mostrarlo en internet.

---

## 🛠️ 2. Modificación Obligatoria en el Código (Local)

Antes de compilar, debemos hacer que el Frontend apunte al Backend en la nube.

**Modificar el archivo `src/config/api.js`**
Abra `frontend_web/react_node_express/src/config/api.js` y reemplácelo por este código. **Recuerde cambiar `[SU-NOMBRE-DE-APP-SERVICE-BACKEND]` por la URL real de su backend en Azure:**

```javascript
// src/config/api.js

// 👇 Detecta si estamos en producción (Azure) o desarrollo local
const isProduction = import.meta.env.PROD;

// Reemplace [SU-NOMBRE-DE-APP-SERVICE-BACKEND] por el nombre de su backend en Azure
// Ejemplo: 'https://api-profe-albeiro-d0e5adcjb8adg7fu.chilecentral-01.azurewebsites.net/api'
const PROD_URL = 'https://[SU-NOMBRE-DE-APP-SERVICE-BACKEND].azurewebsites.net/api';
const DEV_URL = 'http://localhost:3000/api';

const API_CONFIG = {
  BASE_URL: isProduction ? PROD_URL : DEV_URL,
  TIMEOUT: 10000,
  ENDPOINTS: {
    LOGIN: '/users/login',
    REGISTER: '/users/create',
    USERS: '/users',
    USER_BY_ID: '/users/:id',
    USER_UPDATE: '/users/:id',
    USER_PATCH: '/users/:id',
    USER_DELETE: '/users/delete/:id'
  }
}

export default API_CONFIG
```

---

## 🏗️ 3. Compilación y Preparación del Frontend

1.  Abra la terminal en `frontend_web/react_node_express`.
2.  Ejecute el comando de compilación:
    ```bash
    npm run build
    ```
    *(Esto creará la carpeta `dist` con los archivos listos para producción).*

3.  **Crear el servidor estático:** Navegue a la carpeta `dist` (que acaba de crear) y dentro de ella cree un archivo llamado `package.json` con este contenido:
    ```json
    {
      "name": "frontend-web-profe",
      "version": "1.0.0",
      "scripts": {
        "start": "npx serve -s . -l 8080"
      }
    }
    ```

---

## ☁️ 4. Crear el Recurso en Azure

1.  Vaya al **Portal de Azure**.
2.  Busque **"App Services"** y haga clic en **"Crear" -> "Aplicación web"**.
3.  **Configuración Básica:**
    *   **Nombre:** Único (ej. `web-profe-albeiro`).
    *   **Publicar:** Código.
    *   **Pila de tiempo de ejecución:** **Node.js 20 LTS** (o la versión que esté usando).
    *   **Sistema operativo:** Linux.
    *   **Región:** Elija la misma que usó para el Backend (ej. `chilecentral`).
    *   **Plan de App Service:** **Free F1** (o el B1 que ya tenga).
4.  Haga clic en **"Revisar y crear"** y luego en **"Crear"**.

### ⚙️ Configurar Variables de Entorno en el nuevo App Service
Una vez creado, vaya a **"Configuración" -> "Variables de entorno"** y agregue:
*   `WEBSITES_PORT` = `8080`
*   `SCM_DO_BUILD_DURING_DEPLOYMENT` = `true` (para que Azure instale `serve` automáticamente).

---

## 🚀 5. El Despliegue (Sin errores)

**El problema anterior:** VS Code desplegaba la raíz del proyecto (Backend) por error.
**La solución:** Abrir la carpeta `dist` como un proyecto independiente en VS Code.

1.  En VS Code, vaya a **"Archivo" -> "Nueva Ventana"**.
2.  En la nueva ventana, vaya a **"Archivo" -> "Abrir carpeta..."**.
3.  Seleccione la carpeta **`frontend_web/react_node_express/dist`**.
4.  En el panel de Azure (barra lateral), haga clic derecho sobre su nuevo App Service (`web-profe-albeiro`) y seleccione **"Deploy to Web App..."**.
5.  Seleccione la carpeta actual (que ya es `dist`). Espere a que termine.

---

## 🚨 6. Solución a Problemas Críticos (Documentación de la experiencia real)

**1. Error: `Resource 'web-profe-albeiro' was disallowed by Azure`**
*   **Causa:** Azure for Students tiene una política que impide crear Static Web Apps en ciertas regiones.
*   **Solución:** Usar **App Service** (con Node.js y el servidor `serve`) en lugar de Static Web Apps.

**2. El despliegue arranca el Backend en lugar del Frontend**
*   **Causa:** VS Code estaba desplegando la carpeta raíz del proyecto que contenía ambos.
*   **Solución:** Abrir la carpeta `dist` (dentro de `frontend_web/react_node_express`) como una ventana nueva de VS Code y desplegar desde ahí.

**3. La página web muestra error 404 o "Cannot GET /"**
*   **Causa:** Azure no sabe cómo servir archivos estáticos sin un servidor.
*   **Solución:** Crear el archivo `package.json` dentro de `dist` con el script `"start": "npx serve -s . -l 8080"` (Paso 3).

**4. Error al hacer login (CORS o 404)**
*   **Causa:** La URL en `api.js` no apunta al Backend de Azure o le falta el `/api`.
*   **Solución:** Verificar la constante `PROD_URL` en `src/config/api.js`.