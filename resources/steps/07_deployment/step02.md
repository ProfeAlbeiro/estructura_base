# 🚀 Paso 2: Despliegue del Backend en Azure

## 📖 1. Explicación y Contexto
Desplegar en la nube no es solo "copiar y pegar" archivos. Azure App Service ejecutará nuestro Backend (Node.js) en un contenedor Linux. Para que nuestra aplicación funcione en la nube y en nuestra computadora al mismo tiempo, el código debe ser **consciente del entorno**. Esto significa que el mismo código debe saber si está en "Modo Desarrollo" (local) o en "Modo Producción" (Azure) usando variables de entorno (la más importante: `NODE_ENV`).

---

## 🛠️ 2. Modificaciones Obligatorias en el Código (Local)

Antes de subir el código a Azure, realice los siguientes cambios en su proyecto local.

### A. Modificar el (`package.json`)

Reemplace **todo** el contenido de `package.json` por este:

```json
{
  "name": "api_nodejs_express",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon index.js",
    "start:test": "cross-env NODE_ENV=test node index.js",
    "test": "cross-env NODE_ENV=test jest",
    "test:watch": "cross-env NODE_ENV=test jest --watch",
    "test:coverage": "cross-env NODE_ENV=test jest --coverage"
  },
  "keywords": [
    "api",
    "nodejs",
    "express"
  ],
  "author": "Albeiro Ramos",
  "license": "MIT",
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "http": "^0.0.1-security",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "mysql2": "^3.24.6",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1"
  },
  "devDependencies": {
    "cross-env": "^10.1.0",
    "jest": "^30.5.2",
    "jest-html-reporters": "^3.1.7",
    "nodemon": "^3.1.11",
    "supertest": "^7.3.1"
  }
}
```

### B. El Archivo de la Base de Datos (`config/config.js`)
**El problema:** Azure exige conexiones seguras (SSL) y usa MySQL 8 (paquete `mysql2`). En local, su MySQL no tiene SSL.
**La solución:** Hacer que la conexión sea dinámica.

Reemplace **todo** el contenido de `../config/config.js` por este:

```javascript
// backend/nodejs_express/config/config.js
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({ path: envFile });

const mysql = require('mysql2'); // 👈 Obligatorio para Azure

const isProduction = process.env.NODE_ENV === 'production';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
};

// 👇 Solo agregamos SSL si estamos en Azure
if (isProduction) {
  dbConfig.ssl = { rejectUnauthorized: false };
}

const db = mysql.createConnection(dbConfig);

db.connect(function(err) {
  if (err) {
    console.error('❌ Error de conexión a la BD:', err);
    throw err;
  }
  console.log(`✅ Base de datos conectada: ${process.env.DB_NAME} (${isProduction ? 'Producción' : 'Desarrollo'})`);
});

module.exports = db;
```

### C. El Archivo de Arranque (`server.js`)
**El problema:** Azure necesita que el servidor escuche en el puerto `8080` y en `0.0.0.0`. En local, debe escuchar en el `3000`.
**La solución:** Poner la lógica de arranque aquí, condicionada al entorno.

Reemplace **todo** el contenido de `backend/nodejs_express/server.js` por este:

```javascript
// backend/nodejs_express/server.js
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const usersRoutes = require('./routes/userRoutes');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*', // Permite conexiones desde React y desde Azure
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

const swaggerOptions = {  
  swaggerOptions: {
    docExpansion: 'list',           
    defaultModelsExpandDepth: -1,   
    defaultModelExpandDepth: 1,     
    displayRequestDuration: true,   
    filter: false,                  
    layout: 'BaseLayout',  
    showExtensions: true,
    showCommonExtensions: true,
    deepLinking: true,         
    persistAuthorization: true,
    tagsSorter: 'alpha',       
    operationsSorter: function(a, b) {
      const methodOrder = { 'post': 1, 'get': 2, 'put': 3, 'delete': 4 };
      return methodOrder[a.get('method')] - methodOrder[b.get('method')];
    }  
  }  
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
app.use('/api/users', usersRoutes);

app.get('/', (req, res) => res.send('Ruta raíz del Backend'));
app.get('/test', (req, res) => res.send('Ruta TEST'));

app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send(err.stack);
});

// 👇 LÓGICA DE ARRANQUE PARA AZURE (Solo se ejecuta en Producción)
if (process.env.NODE_ENV === 'production') {
  const port = process.env.PORT || 8080;
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Servidor de AZURE corriendo en el puerto ${port}`);
  });
}

module.exports = app;
```

### D. El Archivo de Desarrollo (`index.js`)
**El problema:** Azure ejecuta `server.js`, pero cuando usted ejecuta `npm run dev`, debe ejecutar `index.js` para no chocar.
**La solución:** Este archivo solo se usará para desarrollo local.

Reemplace **todo** el contenido de `backend/nodejs_express/index.js` por este:

```javascript
// backend/nodejs_express/index.js
const http = require('http');
const app = require('./server'); // Importa la app de server.js
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',   
    'http://localhost:3000',   
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());
app.set('port', 3000);

const server = http.createServer(app);

server.listen(3000, 'localhost', () => {
  console.log(`🚀 Servidor corriendo en LOCAL en http://localhost:3000`);
  console.log(`📚 Swagger disponible en: http://localhost:3000/api-docs`);
});
```

### D. El Archivo de Swagger (`config/swagger.js`)
Reemplace **todo** el contenido de `backend/nodejs_express/config/swagger.js` por este (recuerde cambiar `[SU-NOMBRE-DE-APP-SERVICE]` por el nombre real de su backend en Azure):

```javascript
// backend/nodejs_express/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Mi Proyecto',
      version: '1.0.0',
      description: 'Documentación completa de la API REST',
      contact: {
        name: 'Albeiro Ramos',
        email: 'profealbeiro2020@gmail.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
             ? 'https://[SU-NOMBRE-DE-APP-SERVICE].azurewebsites.net' 
             : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' ? 'Servidor en Azure' : 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' }, email: { type: 'string' }, name: { type: 'string' },
            lastname: { type: 'string' }, role: { type: 'string', enum: ['admin', 'seller', 'user'] }
          },
          example: { email: "juan@example.com", name: "Juan", lastname: "Pérez", role: "user" }
        },
        Login: {
          type: 'object', required: ['email', 'password'],
          properties: { email: { type: 'string' }, password: { type: 'string' } },
          example: { email: "usuario@example.com", password: "miContraseña123" }
        },
        Error: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } }
      }
    }
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
```

### E. Evitar subir `node_modules` (Archivo `.vscodeignore`)
Cree el archivo `backend/nodejs_express/.vscodeignore` y pegue:
```text
.vscode/**
.git/**
node_modules/**
tests/**
*.env*
```

---

## ⚙️ 3. Configuración en el Portal de Azure (Variables de Entorno)

Para que Azure sepa que está en producción y use el puerto correcto, vaya a su App Service -> **Configuración -> Variables de entorno** y agregue:
*   `NODE_ENV` = `production` *(Activa el SSL y el puerto 8080).*
*   `SCM_DO_BUILD_DURING_DEPLOYMENT` = `true` *(Instala `mysql2` automáticamente).*
*   `WEBSITES_CONTAINER_START_TIME_LIMIT` = `600` *(Evita el error 503).*
*   `WEBSITES_PORT` = `8080` *(Fuerza el enrutamiento).*
*   Y sus credenciales de la BD (`DB_HOST`, `DB_USER`, etc.).
4. Haga clic en **"Aplicar"** y **"Reiniciar"**.

---

## 🚀 4. Despliegue y Verificación

1. En **Visual Studio Code**, clic derecho en el App Service -> **"Deploy to Web App..."**.
2. Seleccione la carpeta `backend/nodejs_express`.
3. En el navegador, vaya a: `https://[SU-NOMBRE-DE-APP-SERVICE].azurewebsites.net/test`
4. **Debe ver el mensaje "Ruta TEST".**

---

### 🚨 5. Solución de Problemas Críticos (Documentación para Clase)

Si sus estudiantes ven estos errores, aquí está la explicación:

**1. Error `Cannot find module 'express'` en la terminal SSH de Azure**
*   **Causa:** Azure no instaló las dependencias al desplegar.
*   **Solución:** En Kudu SSH, ejecutar `cd /home/site/wwwroot` y luego `npm install`.

**2. Error `ER_NOT_SUPPORTED_AUTH_MODE`**
*   **Causa:** El paquete `mysql` viejo no soporta la autenticación de Azure MySQL 8.
*   **Solución:** Instalar `mysql2` y cambiar el `require` en `config.js`.

**3. Error `ER_SECURE_TRANSPORT_REQUIRED`**
*   **Causa:** Azure exige que la conexión a la BD sea encriptada (SSL).
*   **Solución:** Agregar el bloque `ssl: { rejectUnauthorized: false }` en `config.js`.

**4. Error 503 Service Unavailable o 504 Gateway Timeout**
*   **Causa:** La aplicación no estaba escuchando en el puerto 8080 o tardaba mucho en arrancar.
*   **Solución:** Tener la variable `WEBSITES_PORT=8080` y mover el `listen()` al `server.js`.

**5. Localmente falla con `npm run dev` pero en Azure sí funciona.**
*   **Causa:** El código estaba "quemado" para Azure (SSL, puerto 8080).
*   **Solución:** Implementar la lógica dual (como en esta guía) usando `process.env.NODE_ENV`.
