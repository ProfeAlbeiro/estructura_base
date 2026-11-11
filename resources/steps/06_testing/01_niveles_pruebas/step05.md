## 05. Pruebas Unitarias

Para este punto, vamos a programar los 5 casos de prueba unitaria (UT-01 a UT-05) que definimos en el Punto 2. Recuerde que en las pruebas unitarias aislamos el código: no tocamos la base de datos real ni levantamos el servidor.

Vamos a dividir esto en dos partes: primero el Backend y luego el Frontend.

### 🟢 Parte A: Pruebas Unitarias en el Backend (Node.js)

Vamos a probar el Middleware de autenticación (`authMiddleware.js`) y la lógica del modelo de usuarios (`user.js`).

**1. Crear el archivo de pruebas:**
Cree el archivo `backend/nodejs_express/tests/unit/auth.test.js` y pegue el siguiente código:

```javascript
// backend/nodejs_express/tests/unit/auth.test.js
const { verifyToken } = require('../../middlewares/authMiddleware');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔥 MOCK: Simulamos la librería jsonwebtoken para no depender de tokens reales
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token, secret, callback) => {
    if (token === 'token_valido_simulado') {
      callback(null, { id: 1, role: 'admin' }); // Simula éxito
    } else {
      callback(new Error('Token inválido'), null); // Simula error
    }
  })
}));

describe('Nivel 1: Pruebas Unitarias - Backend', () => {
  
  // UT-03: Middleware rechaza peticiones sin token
  test('UT-03: verifyToken debe retornar 403 si no hay cabecera de autorización', () => {
    // 1. Simulamos los objetos req, res y next de Express
    const req = { headers: {} }; // Sin cabecera 'authorization'
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    // 2. Ejecutamos el middleware
    verifyToken(req, res, next);

    // 3. Verificamos el resultado
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "No se proporcionó un token"
    }));
    expect(next).not.toHaveBeenCalled(); // No debe pasar al siguiente middleware
  });

  // UT-04: El modelo debe encriptar la contraseña
  test('UT-04: bcrypt debe encriptar la contraseña (no dejarla en texto plano)', async () => {
    const passwordPlana = "miPassword123";
    
    // Simulamos lo que hace User.create en models/user.js
    const hash = await bcrypt.hash(passwordPlana, 10);
    
    // Verificamos que el hash no sea igual a la contraseña plana
    expect(hash).not.toBe(passwordPlana);
    // Verificamos que el hash inicie con el prefijo de bcrypt (ej: $2a$10$...)
    expect(hash).toMatch(/^\$2[ayb]\$.{56}$/);
  });

  // UT-05: Verificar que bcrypt valide correctamente (Caso Positivo y Negativo)
  test('UT-05: bcrypt.compare debe validar correctamente una contraseña', async () => {
    const passwordPlana = "miPassword123";
    const hashFalso = await bcrypt.hash(passwordPlana, 10);
    
    // Caso positivo
    const esValida = await bcrypt.compare(passwordPlana, hashFalso);
    expect(esValida).toBe(true);

    // Caso negativo (contraseña incorrecta)
    const esInvalida = await bcrypt.compare("password_incorrecta", hashFalso);
    expect(esInvalida).toBe(false);
  });

});
```

**2. Ejecutar la prueba:**
Abra la terminal en `backend/nodejs_express` y ejecute:
```bash
npm test
```
*Debería ver un resumen indicando que las 5 pruebas (las 3 anteriores + el smoke test de la configuración) pasaron correctamente.*

---

### 🔵 Parte B: Pruebas Unitarias en el Frontend (React)

Vamos a probar la lógica del servicio JWT (`jwtService.js`) y el renderizado del componente de alertas (`AlertMessage.jsx`).

**1. Crear el archivo de pruebas:**
Cree el archivo `frontend_web/react_node_express/src/tests/unit/components.test.jsx` y pegue el siguiente código:

```jsx
// frontend_web/react_node_express/src/tests/unit/components.test.jsx
import { render, screen } from '@testing-library/react';
import jwtService from '../../services/jwtService';
import AlertMessage from '../../views/common/AlertMessage';

describe('Nivel 1: Pruebas Unitarias - Frontend', () => {

  // UT-01: Token válido
  test('UT-01: jwtService debe validar como true un token no expirado', () => {
    const payload = {
      id: 1,
      email: 'test@test.com',
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expira en 1 hora
    };
    
    const tokenValido = jwtService.generateToken(payload);
    const resultado = jwtService.verifyToken(tokenValido);
    
    expect(resultado).toBe(true);
  });

  // UT-02: Token expirado
  test('UT-02: jwtService debe validar como false un token expirado', () => {
    const payloadExpirado = {
      id: 1,
      email: 'test@test.com',
      exp: Math.floor(Date.now() / 1000) - (60 * 60 * 2) // Expiró hace 2 horas
    };
    
    const tokenExpirado = jwtService.generateToken(payloadExpirado);
    const resultado = jwtService.verifyToken(tokenExpirado);
    
    expect(resultado).toBe(false);
  });

  // UT-05 (Frontend): Renderizado del componente AlertMessage
  test('UT-05: AlertMessage debe renderizar el mensaje en pantalla', () => {
    // Renderizamos el componente aislado
    render(<AlertMessage type="error" message="Error de prueba unitaria" />);
    
    // Buscamos el texto en el DOM virtual (jsdom)
    const mensajeEnPantalla = screen.getByText('Error de prueba unitaria');
    
    // Verificamos que exista
    expect(mensajeEnPantalla).toBeInTheDocument();
  });

});
```

**2. Ejecutar la prueba:**
Abra la terminal en `frontend_web/react_node_express` y ejecute:
```bash
npm test
```
*Debería ver que Jest pasó las 3 pruebas de este archivo (UT-01, UT-02, UT-05) junto con el smoke test que ya teníamos.*

---

### 💡 NOTA

La prueba **UT-03** usamos `jest.fn()` para simular las respuestas de Express (`res.status`, `res.json`). Esto es vital para entender que **una prueba unitaria no debe levantar un servidor real**, sino evaluar si el código hace los llamados correctos.