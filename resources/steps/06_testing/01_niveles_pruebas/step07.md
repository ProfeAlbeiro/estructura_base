## 07. Pruebas Funcionales

En este nivel (Nivel 3), evaluamos el sistema desde la perspectiva de **Caja Negra**. Ya no nos importa si el controlador usó `req.body` o `req.params`, o si el modelo hizo una consulta u otra. Lo que nos importa es que **el requerimiento funcional se cumpla**: si envío datos inválidos, el sistema debe rechazarlos; si envío datos correctos, debe procesarlos.

Seguiremos usando **Jest** y **Supertest**, pero ahora nos enfocaremos en los flujos de negocio (los casos **FT-01 a FT-05** de nuestra tabla).

---

### Paso 7.1: El Código de las Pruebas Funcionales

Cree el archivo `backend/nodejs_express/tests/functional/users.functional.test.js` y pegue el siguiente código:

```javascript
// backend/nodejs_express/tests/functional/users.functional.test.js
const request = require('supertest');
const app = require('../../server');
const db = require('../../config/config');

describe('Nivel 3: Pruebas Funcionales (Caja Negra) - Reglas de Negocio', () => {
  let tokenAdmin = '';
  let tokenUser = '';

  // 🛠️ Configuración inicial
  beforeAll(async () => {
    // 1. Limpiamos la tabla
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM users', (err) => (err ? reject(err) : resolve()));
    });

    // 2. Insertamos usuarios de prueba directamente en la BD (Admin y User)
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    
    await new Promise((resolve, reject) => {
      const sql = `INSERT INTO users (name, lastname, email, password, role) VALUES ?`;
      const values = [
        ['Admin', 'Test', 'admin@test.com', hash, 'admin'],
        ['User', 'Test', 'user@test.com', hash, 'user']
      ];
      db.query(sql, [values], (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });

    // 3. Obtenemos los tokens para ambos roles
    const loginAdmin = await request(app).post('/api/users/login').send({ email: 'admin@test.com', password: 'password123' });
    tokenAdmin = loginAdmin.body.data.session_token;

    const loginUser = await request(app).post('/api/users/login').send({ email: 'user@test.com', password: 'password123' });
    tokenUser = loginUser.body.data.session_token;
  });

  afterAll(async () => {
    await new Promise((resolve) => db.end(resolve));
  });

  // FT-01: Registro con email duplicado
  test('FT-01: No debe permitir registrar un usuario con un email que ya existe', async () => {
    const response = await request(app)
      .post('/api/users/create')
      .send({ 
        name: "Copia", 
        lastname: "Test", // 👈 Agregamos el lastname para que el error sea por el email
        email: "admin@test.com", // Email que ya existe en la BD
        password: "password123" 
      });

    // El backend actualmente devuelve 501 si la BD arroja un error (ej. Duplicado)
    expect(response.status).toBe(501); 
    expect(response.body.success).toBe(false);
  });

  // FT-02: Login con contraseña incorrecta
  test('FT-02: Debe rechazar el login si la contraseña es incorrecta', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ email: 'admin@test.com', password: 'incorrecta' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Contraseña o correo incorrecto");
  });

  // FT-03: Control de acceso por Rol (Caja Negra)
  test('FT-03: Un usuario con rol "user" NO debe poder listar todos los usuarios', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', tokenUser); // Enviamos token de USER

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Acceso denegado");
  });

  // FT-04: Validación de datos obligatorios
  test('FT-04: No debe crear un usuario si falta el email (campo obligatorio)', async () => {
    const response = await request(app)
      .post('/api/users/create')
      .send({ 
        name: "Sin Correo", 
        lastname: "Prueba", // 👈 Agregamos el lastname para que el error sea por el email
        password: "password123" 
        // Falta el email
      });

    expect(response.status).toBe(501); // Error de BD por campo nulo
    expect(response.body.success).toBe(false);
  });

  // FT-05: Actualización parcial (Solo un campo)
  test('FT-05: Debe actualizar solo el teléfono sin alterar los demás campos', async () => {
    // 1. Primero obtenemos el ID del usuario "User" que creamos
    const [rows] = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM users WHERE email = ?', ['user@test.com'], (err, res) => {
        if (err) reject(err);
        else resolve([res]);
      });
    });
    const idUser = rows[0].id;

    // 2. Hacemos la actualización enviando solo el teléfono
    const response = await request(app)
      .put('/api/users/')
      .set('Authorization', tokenAdmin)
      .send({ 
        id: idUser, 
        phone: "3000000000" 
      });

    expect(response.status).toBe(200);

    // 3. Verificamos en la BD que el teléfono cambió, pero el nombre y email siguen igual
    const [rowsDespues] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE id = ?', [idUser], (err, res) => {
        if (err) reject(err);
        else resolve([res]);
      });
    });
    
    expect(rowsDespues[0].phone).toBe("3000000000");
    expect(rowsDespues[0].name).toBe("User"); // No se alteró
    expect(rowsDespues[0].email).toBe("user@test.com"); // No se alteró
  });
});
```

---

### Paso 7.2: ¿Cómo Ejecutar estas Pruebas?

Abra la terminal en `backend/nodejs_express` y ejecute:

```bash
npm test
```

**¿Qué debe observar en la consola?**
1. Verá que se ejecuta el archivo `users.functional.test.js`.
2. Los 5 tests (FT-01 a FT-05) deben pasar.
3. Verá un semáforo verde con el resumen de todas las pruebas.

---

### 💡 NOTA
Diferencia entre el Nivel 2 y el Nivel 3:
*   **Integración (IT-04):** "Voy a verificar si el controlador envía el ID correcto al modelo para actualizar la base de datos".
*   **Funcional (FT-05):** "Voy a verificar que *la regla de negocio* de actualización parcial funcione, es decir, que si el administrador solo cambia el teléfono, el nombre y el correo del usuario no se borren o se alteren por accidente".

Aquí estamos probando el "qué hace" el sistema, no el "cómo lo hace".

---

### 🚨 Solución de Errores Comunes (Documentación del caso real)

Durante la ejecución de este nivel, es común encontrarse con un error de conflicto entre archivos de prueba. Si al ejecutar `npm test` observa que el test de Integración (IT-02) falla con un **error 401** o ve un error de MySQL `ER_BAD_NULL_ERROR`, aquí tiene la explicación y solución:

**Síntoma 1: El test de Integración IT-02 falla (Error 401) al ejecutar todo junto.**
*   **Causa:** Jest ejecuta los archivos de prueba en paralelo por defecto. El archivo Funcional y el de Integración están intentando limpiar y poblar la misma tabla `users` al mismo tiempo. Cuando uno intenta hacer login, el otro ya ha borrado o modificado el usuario.
*   **Solución:** Indicarle a Jest que ejecute un archivo de prueba a la vez. Abra `backend/nodejs_express/jest.config.js` y agregue `maxWorkers: 1`:
    ```javascript
    module.exports = {
      // ... otras configuraciones
      maxWorkers: 1, // 👈 Ejecuta un archivo a la vez
    };
    ```

**Síntoma 2: El test FT-01 o FT-04 falla mostrando `ER_BAD_NULL_ERROR: Column 'lastname' cannot be null`.**
*   **Causa:** El test está enviando datos incompletos (sin `lastname`). MySQL (en modo estricto) rechaza la inserción por el campo `lastname` nulo antes de que la prueba pueda evaluar la regla de negocio que realmente quería probar (email duplicado o falta de email).
*   **Solución:** Incluir el `lastname` en el cuerpo de la petición para que el error ocurra por la causa correcta (duplicado o falta de email), como se muestra en el código de este paso.

