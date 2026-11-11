## 06. Pruebas de Integración

En este nivel (Nivel 2), ya no aislamos el código. Vamos a probar cómo interactúan el Router, el Controlador, el Modelo y la Base de Datos. Para esto, utilizaremos **Jest** junto con **Supertest** (para simular peticiones HTTP sin levantar el servidor en un puerto físico) y apuntaremos a la base de datos de pruebas (`db_node_test`).

### 🛠️ Requisito Previo (¡Atención aquí, Profe!)
Para no dañar su base de datos de desarrollo (`db_node`), **debemos asegurarnos de que la aplicación apunte a una base de datos exclusiva para pruebas (`db_node_test`)**. Asegúrese de tener creada esa BD en MySQL con la misma estructura de la tabla `users`, y el archivo `.env.test` en la raíz del backend.

---

### Paso 6.1: Configuración de la Base de Datos para Pruebas (Muy Importante)
Para que su aplicación sepa a qué base de datos conectarse, debemos modificar su archivo `backend/nodejs_express/config/config.js`. Debe quedar **exactamente así**:

```javascript
// backend/nodejs_express/config/config.js
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({ path: envFile });

const mysql = require('mysql');
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});
db.connect(function(err) {
  if (err) throw err;
  console.log(`Base de datos conectada: ${process.env.DB_NAME}`); // Muestra a qué BD se conectó
});
module.exports = db;
```

---

### Paso 6.2: El Código de las Pruebas de Integración

Vamos a implementar los casos **IT-01 a IT-05** de nuestra tabla. 

Cree el archivo `backend/nodejs_express/tests/integration/users.integration.test.js` y pegue el siguiente código:

```javascript
// backend/nodejs_express/tests/integration/users.integration.test.js
const request = require('supertest');
const app = require('../../server'); // Importamos la app de Express
const db = require('../../config/config'); // Importamos la conexión a la BD

describe('Nivel 2: Pruebas de Integración - Rutas de Usuarios', () => {
  let tokenAdmin = '';
  let idUsuarioCreado = '';

  // 🛠️ Configuración inicial: Limpiamos la BD de pruebas y creamos un Admin
  beforeAll(async () => {
    // 1. Limpiamos la tabla
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM users', (err) => (err ? reject(err) : resolve()));
    });

    // 2. Insertamos un usuario Admin directamente (Saltamos el controlador para tener el token rápido)
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);
    
    await new Promise((resolve, reject) => {
      const sql = `INSERT INTO users (name, lastname, email, password, role) VALUES (?, ?, ?, ?, ?)`;
      db.query(sql, ['Admin', 'Test', 'admin@test.com', hash, 'admin'], (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });

    // 3. Hacemos login para obtener el token real
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
      
    tokenAdmin = loginRes.body.data.session_token;
  });

  // Cerramos la conexión a la BD al terminar todas las pruebas
  afterAll(async () => {
    await new Promise((resolve) => db.end(resolve));
  });

  // IT-01: Crear usuario (Integración Router + Controller + Model + BD)
  test('IT-01: POST /api/users/create debe guardar un usuario en la BD', async () => {
    const nuevoUsuario = {
      name: "Test Integracion",
      lastname: "Apellido",
      email: "integracion@test.com",
      password: "password123",
      role: "user"
    };

    const response = await request(app)
      .post('/api/users/create')
      .send(nuevoUsuario);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');

    // Verificamos directamente en la BD que el usuario realmente se guardó
    const [rows] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [nuevoUsuario.email], (err, res) => {
        if (err) reject(err);
        else resolve([res]);
      });
    });
    
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe(nuevoUsuario.name);
    idUsuarioCreado = rows[0].id; // Guardamos el ID para las siguientes pruebas
  });

  // IT-02: Login exitoso (Integración Auth + BD)
  test('IT-02: POST /api/users/login debe retornar un token válido', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ email: 'admin@test.com', password: 'admin123' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('session_token');
    expect(response.body.data.session_token).toContain('JWT');
  });

  // IT-03: Listar usuarios (Integración Middleware Auth + Controller)
  test('IT-03: GET /api/users debe listar usuarios si el token es válido', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', tokenAdmin); // Enviamos el token real

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  // IT-04: Actualizar usuario (Integración Modelo dinámico)
  test('IT-04: PUT /api/users/ debe actualizar un campo en la BD', async () => {
    const response = await request(app)
      .put(`/api/users/`) // La ruta en su backend es solo '/'
      .set('Authorization', tokenAdmin)
      .send({ 
        id: idUsuarioCreado, // Enviamos el ID en el cuerpo (body)
        name: "Nombre Actualizado" 
      });

    expect(response.status).toBe(200);
    
    // Verificamos en la BD que el cambio se aplicó
    const [rows] = await new Promise((resolve, reject) => {
      db.query('SELECT name FROM users WHERE id = ?', [idUsuarioCreado], (err, res) => {
        if (err) reject(err);
        else resolve([res]);
      });
    });
    expect(rows[0].name).toBe("Nombre Actualizado");
  });

  // IT-05: Eliminar usuario (Integración Auth + Controller DELETE)
  test('IT-05: DELETE /api/users/delete/:id debe borrar al usuario', async () => {
    const response = await request(app)
      .delete(`/api/users/delete/${idUsuarioCreado}`)
      .set('Authorization', tokenAdmin);

    expect(response.status).toBe(200);

    // Verificamos que ya no exista en la BD
    const [rows] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE id = ?', [idUsuarioCreado], (err, res) => {
        if (err) reject(err);
        else resolve([res]);
      });
    });
    expect(rows.length).toBe(0); // Cero filas encontradas
  });
});
```

---

### Paso 6.3: ¿Cómo Ejecutar estas Pruebas?

Abra la terminal en `backend/nodejs_express` y ejecute el comando que configuramos para las pruebas:

```bash
npm test
```

**¿Qué debe observar en la consola?**
1. Verá el mensaje `Base de datos conectada: db_node_test` (gracias al cambio en config.js).
2. Verá que Jest ejecuta el archivo `users.integration.test.js`.
3. Debería pasar los 5 tests (IT-01 a IT-05) con un semáforo en verde (✓).

---

### 💡 Nota Pedagógica para su Clase
Explique a sus estudiantes por qué esto es **Integración y no Unitario**:
1. Aquí hay una petición HTTP viajando (simulada por Supertest).
2. Hay un middleware (`authMiddleware`) verificando un token real generado con `jsonwebtoken`.
3. Hay una consulta SQL real viajando a MySQL y trayendo datos.
4. **El uso de `beforeAll` y `afterAll`:** Es crucial para que las pruebas no ensucien la base de datos. Antes de empezar, limpiamos la tabla; al terminar, cerramos la conexión para que Jest no se quede colgado (`forceExit`).

---

### 🚨 Solución de Errores Comunes y Ajustes en el Código (Documentación del caso real)

Durante el desarrollo de esta guía, nos encontramos con varios errores lógicos y de configuración. Aquí tiene el paso a paso exacto de cómo se solucionaron, para que lo comparta con sus estudiantes:

**1. Error 404 (Not Found) o Falso Positivo al hacer el PUT (IT-04)**
*   **Causa:** El test inicial intentaba hacer `PUT /api/users/6` (enviando el ID por la URL). Sin embargo, en el archivo `routes/userRoutes.js` la ruta está definida como `router.put('/')` (la raíz). Al no coincidir, Express devolvía 404. Si se corregía la ruta pero el controlador seguía buscando `req.params.id`, llegaba como `undefined`, el SQL no actualizaba nada y devolvía un falso 200.
*   **Solución en el código:**
    1.  En el test **IT-04** (ya incluido arriba), enviamos la petición a `.put('/api/users/')` sin el ID en la URL, y enviamos el ID dentro del cuerpo: `.send({ id: idUsuarioCreado, name: "Nombre Actualizado" })`.
    2.  En el archivo `controllers/userController.js`, cambiamos la línea de lectura del ID:
        ```javascript
        // ANTES:
        const id = req.params.id;
        // DESPUÉS:
        const id = req.body.id; // 👈 Ahora lee el ID desde el body
        ```

**2. ¡Peligro! Las pruebas borraban datos de `db_node` (Desarrollo) en vez de `db_node_test`**
*   **Causa:** Aunque en el `package.json` pusimos `cross-env NODE_ENV=test jest`, la librería `dotenv` por defecto siempre busca el archivo `.env`, ignorando el `NODE_ENV`. Por eso se conectaba a la BD real.
*   **Solución en el código:** Implementar la lógica condicional en `backend/nodejs_express/config/config.js` (que ya incluimos en el **Paso 6.1**):
    ```javascript
    const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
    require('dotenv').config({ path: envFile });
    ```

**3. Jest se queda colgado al finalizar (Force exiting Jest)**
*   **Causa:** Las conexiones a la base de datos MySQL quedan abiertas después de las pruebas.
*   **Solución:** Asegúrese de tener el bloque `afterAll` cerrando la conexión con `db.end()`, y verifique que su `jest.config.js` tenga la propiedad `forceExit: true`.
