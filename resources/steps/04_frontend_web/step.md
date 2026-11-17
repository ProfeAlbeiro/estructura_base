## <h2 align="center">🧭 I. CONTEXTO DE DESARROLLO</h2>
## 4. Codificación

4.1. **[Archivos de Configuración](#41-archivos-de-configuración)**
<br>4.2. **[Archivos de Servicios](#42-archivos-de-servicios)**
<br>4.3. **[Archivos de Modelos (Model)](#43-archivos-de-modelos-model)**
<br>4.4. **[Archivos de Controladores (Controller)](#44-archivos-de-controladores-controller)**
<br>4.5. **[Archivos de Hooks](#45-archivos-de-hooks)**
<br>4.6. **[Archivos de Vistas (View)](#46-archivos-de-vistas-view)**
<br>4.7. **[Archivos de Utilidades](#47-archivos-de-utilidades)**
<br>4.8. **[Archivos Raíz (App.jsx y main.jsx)](#48-archivos-raíz-appjsx-y-mainjsx)**
<br>4.9. **[Verificación](#49--verificación)**
<br>4.10. **[Solución de Problemas Comunes](#410--solución-de-problemas-comunes)**
<br>4.11. **[Recursos Adicionales](#411--recursos-adicionales)**

**<div align="center"><a href="step00.md">Curso React</a></div>**

---

### 📚 Explicación
> En el **Paso 3** creamos la estructura (carpetas + archivos vacíos con `// TODO`). Ahora vamos a **rellenar el esqueleto** con el contenido mínimo funcional de cada archivo, de modo que la aplicación **siga compilando**, muestre las vistas base y esté lista para que en el **Capítulo III** (JSON Server) le conectemos la lógica real de autenticación y CRUD.
>
> **Regla de oro de este paso:** *"esqueleto funcional, no lógica de negocio"*. Ningún archivo debe contener `fetch`, `bcrypt`, validaciones complejas ni llamadas reales a la API todavía. Eso llega en el Capítulo III.

### Tecnologías principales

| Tecnología       | Versión | Propósito en este paso                     |
| ---------------- | ------- | ------------------------------------------ |
| **React**        | 19.2.4  | Componentes base de las vistas             |
| **React Router** | 7.14.0  | Rutas entre `Login`, `Register`, `Dashboard` |
| **Vite**         | 8.0.4   | Compilación y HMR                          |
| **ESLint**       | 9.39.4  | Validación de sintaxis                     |

> ⚠️ **Nota:** si algo no compila después de este paso, **no sigas al Capítulo III**. Revisa primero la sección **4.10 — Solución de Problemas** antes de avanzar.

---

## 4.1. Archivos de Configuración

#### 4.1.1. `src/config/api.js`

```javascript
// src/config/api.js
// Configuración central de la API.
// NOTA: en el Capítulo III (JSON Server) apuntaremos a http://localhost:3001
// En el Capítulo IV (Node + Express) cambiaremos a http://localhost:3000/api

const API_CONFIG = {
  BASE_URL: 'http://localhost:3001', // JSON Server (temporal)
  TIMEOUT: 10000,
  ENDPOINTS: {
    LOGIN: '/login',
    REGISTER: '/users',
    USERS: '/users',
    USER_BY_ID: '/users/:id'
  }
}

export default API_CONFIG
```

#### 4.1.2. `src/config/constants.js`

```javascript
// src/config/constants.js
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  ROLE: 'user_role'
}

export const USER_ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  CUSTOMER: 'customer',
  USER: 'user'
}
```

#### 4.1.3. `src/config/routes.js`

```javascript
// src/config/routes.js
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  HOME: '/'
}

export const PROTECTED_ROUTES = [ROUTES.DASHBOARD]
export const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.HOME]
```

**<div align="right"><a href="#4-codificación">Volver</a></div>**

---

## 4.2. Archivos de Servicios

> 🎯 En este paso los servicios son **mínimos**. La lógica completa (fetch, JWT, storage) llega en el **Capítulo III**.

#### 4.2.1. `src/services/httpService.js`

```javascript
// src/services/httpService.js
// En el Capítulo III implementamos fetch con auth.
class HttpService {}

export default new HttpService()
```

#### 4.2.2. `src/services/storageService.js`

```javascript
// src/services/storageService.js
class StorageService {
  constructor() {
    this.storage = localStorage
  }

  setItem(key, value) {
    try {
      this.storage.setItem(key, value)
      return true
    } catch (error) {
      console.error('Error al guardar en storage:', error)
      return false
    }
  }

  getItem(key) {
    try {
      return this.storage.getItem(key)
    } catch (error) {
      console.error('Error al leer del storage:', error)
      return null
    }
  }

  removeItem(key) {
    try {
      this.storage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error al eliminar del storage:', error)
      return false
    }
  }

  clear() {
    try {
      this.storage.clear()
      return true
    } catch (error) {
      console.error('Error al limpiar storage:', error)
      return false
    }
  }
}

export default new StorageService()
```

#### 4.2.3. `src/services/jwtService.js`

```javascript
// src/services/jwtService.js
// En el Capítulo III implementamos firma, verificación y decodificación.
class JWTService {}

export default new JWTService()
```

**<div align="right"><a href="#4-codificación">Volver</a></div>**

---

## 4.3. Archivos de Modelos (Model)

#### 4.3.1. `src/models/AuthModel.js`

```javascript
// src/models/AuthModel.js
class AuthModel {
  static async login(_credentials) {
    return { success: false, error: 'No implementado aún' }
  }

  static async logout() {
    return { success: true }
  }

  static isAuthenticated() {
    return false
  }

  static getCurrentUser() {
    return null
  }

  static getCurrentToken() {
    return null
  }
}

export default AuthModel
```

#### 4.3.2. `src/models/UserModel.js`

```javascript
// src/models/UserModel.js
class UserModel {}

export default UserModel
```

#### 4.3.3. `src/models/DashboardModel.js`

```javascript
// src/models/DashboardModel.js
class DashboardModel {}

export default DashboardModel
```

**<div align="right"><a href="#4-codificación">Volver</a></div>**

---

## 4.4. Archivos de Controladores (Controller)

#### 4.4.1. `src/controllers/AuthController.js`

```javascript
// src/controllers/AuthController.js
import AuthModel from '../models/AuthModel'

class AuthController {
  static getAuthState() {
    return {
      isAuthenticated: AuthModel.isAuthenticated(),
      currentUser: AuthModel.getCurrentUser(),
      currentToken: AuthModel.getCurrentToken()
    }
  }
}

export default AuthController
```

#### 4.4.2. `src/controllers/UserController.js`

```javascript
// src/controllers/UserController.js
class UserController {}

export default UserController
```

#### 4.4.3. `src/controllers/DashboardController.js`

```javascript
// src/controllers/DashboardController.js
class DashboardController {}

export default DashboardController
```

**<div align="right"><a href="#4-codificación">Volver</a></div>**

---

## 4.5. Archivos de Hooks

#### 4.5.1. `src/hooks/useAuth.js`

```javascript
// src/hooks/useAuth.js
import { useState, useEffect } from 'react'
import AuthController from '../controllers/AuthController'

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const state = AuthController.getAuthState()
    setIsAuthenticated(state.isAuthenticated)
    setCurrentUser(state.currentUser)
    setLoading(false)
  }, [])

  return { isAuthenticated, currentUser, loading }
}

export default useAuth
```

#### 4.5.2. `src/hooks/useUsers.js`

```javascript
// src/hooks/useUsers.js
import { useState } from 'react'

const useUsers = () => {
  const [users] = useState([])
  return { users }
}

export default useUsers
```

#### 4.5.3. `src/hooks/useDashboard.js`

```javascript
// src/hooks/useDashboard.js
import { useState } from 'react'

const useDashboard = () => {
  const [stats] = useState(null)
  return { stats }
}

export default useDashboard
```

**<div align="right"><a href="#4-codificación">Volver</a></div>**

---

## 4.6. Archivos de Vistas (View)

#### 4.6.1. `src/views/common/LoadingSpinner.jsx`

```jsx
// src/views/common/LoadingSpinner.jsx
const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Cargando...</p>
    </div>
  )
}

export default LoadingSpinner
```

#### 4.6.2. `src/views/common/AlertMessage.jsx`

```jsx
// src/views/common/AlertMessage.jsx
const AlertMessage = ({ type = 'info', message }) => {
  if (!message) return null
  return <div className={`alert alert-${type}`}>{message}</div>
}

export default AlertMessage
```

#### 4.6.3. `src/views/common/Navbar.jsx`

```jsx
// src/views/common/Navbar.jsx
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h2>Sistema Web</h2>
      </div>
    </nav>
  )
}

export default Navbar
```

#### 4.6.4. `src/views/auth/LoginView.jsx`

```jsx
// src/views/auth/LoginView.jsx
const LoginView = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Iniciar Sesión</h1>
        <p>Vista en construcción...</p>
      </div>
    </div>
  )
}

export default LoginView
```

#### 4.6.5. `src/views/auth/RegisterView.jsx`

```jsx
// src/views/auth/RegisterView.jsx
const RegisterView = () => {
  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Crear Cuenta</h1>
        <p>Vista en construcción...</p>
      </div>
    </div>
  )
}

export default RegisterView
```

#### 4.6.6. `src/views/dashboard/DashboardView.jsx`

```jsx
// src/views/dashboard/DashboardView.jsx
const DashboardView = () => {
  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p>Vista en construcción...</p>
    </div>
  )
}

export default DashboardView
```

#### 4.6.7. `src/views/dashboard/DashboardHeader.jsx`

```jsx
// src/views/dashboard/DashboardHeader.jsx
const DashboardHeader = () => {
  return (
    <header>
      <h1>Dashboard Header</h1>
    </header>
  )
}

export default DashboardHeader
```

#### 4.6.8. `src/views/dashboard/DashboardStats.jsx`

```jsx
// src/views/dashboard/DashboardStats.jsx
const DashboardStats = () => {
  return <div>Stats en construcción...</div>
}

export default DashboardStats
```

#### 4.6.9. `src/views/dashboard/UsersView.jsx`

```jsx
// src/views/dashboard/UsersView.jsx
const UsersView = () => {
  return <div>Usuarios en construcción...</div>
}

export default UsersView
```

#### 4.6.10. `src/views/dashboard/UserForm.jsx`

```jsx
// src/views/dashboard/UserForm.jsx
const UserForm = () => {
  return <div>Formulario de usuario en construcción...</div>
}

export default UserForm
```

#### 4.6.11. `src/views/dashboard/UserDetails.jsx`

```jsx
// src/views/dashboard/UserDetails.jsx
const UserDetails = () => {
  return <div>Detalles del usuario en construcción...</div>
}

export default UserDetails
```

#### 4.6.12. `src/views/layouts/MainLayout.jsx`

```jsx
// src/views/layouts/MainLayout.jsx
const MainLayout = ({ children }) => {
  return <div className="main-layout">{children}</div>
}

export default MainLayout
```

**<div align="right"><a href="#4-codificación">Volver</a></div>**

---

## 4.7. Archivos de Utilidades

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ● &nbsp; Los archivos `src/utils/helpers.js` y `src/utils/validators.js` **permanecen vacíos** en este paso. Se llenarán cuando los necesitemos en los capítulos siguientes (validaciones de email, formateo de fechas, etc.).

**<div align="right"><a href="#4-codificación">Volver</a></div>**

---

## 4.8. Archivos Raíz (App.jsx y main.jsx)

#### 4.8.1. Actualizar `src/App.jsx` con las rutas base

```jsx
// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './config/routes'
import LoginView from './views/auth/LoginView'
import RegisterView from './views/auth/RegisterView'
import DashboardView from './views/dashboard/DashboardView'

function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path={ROUTES.LOGIN} element={<LoginView />} />
      <Route path={ROUTES.REGISTER} element={<RegisterView />} />
      <Route path={`${ROUTES.DASHBOARD}/*`} element={<DashboardView />} />
    </Routes>
  )
}

export default App
```

#### 4.8.2. Actualizar `src/main.jsx` con `BrowserRouter`

```jsx
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './App.css'
import './styles/common.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

**<div align="right"><a href="#4-codificación">Volver</a></div>**

---

## 4.9. ✅ Verificación

#### 4.9.1. Iniciar el servidor

```bash
npm run dev
```

#### 4.9.2. Resultado esperado en la terminal

```bash
VITE v8.0.4  ready in 500 ms

➜  Local:   http://localhost:5173/
```

#### 4.9.3. Resultado esperado en el navegador

✅ Al abrir http://localhost:5173 redirige a `/login`
<br>✅ Se muestra la vista de **Login** con el texto *"Iniciar Sesión — Vista en construcción..."*
<br>✅ Al ir a http://localhost:5173/register muestra la vista de **Register**
<br>✅ Al ir a http://localhost:5173/dashboard muestra el **Dashboard** (por ahora sin protección)
<br>✅ La consola del navegador (F12) **no muestra errores**

#### 4.9.4. Verificar el árbol completo de archivos

```powershell
tree src /F
```

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ● &nbsp; Debe coincidir con la estructura de la **sección 3.2.1 del Paso 3**.

#### 4.9.5. Checklist final

✅ Los 3 archivos de `config/` tienen contenido
<br>✅ `storageService.js` tiene contenido; `httpService.js` y `jwtService.js` son stubs mínimos
<br>✅ Los 3 modelos tienen su esqueleto
<br>✅ Los 3 controladores tienen su esqueleto
<br>✅ Los 3 hooks tienen su esqueleto
<br>✅ Las 12 vistas (auth + common + dashboard + layout) compilan
<br>✅ `App.jsx` enruta a `/login`, `/register`, `/dashboard`
<br>✅ `main.jsx` envuelve todo en `<BrowserRouter>`
<br>✅ La consola del navegador **no muestra errores nuevos**

**<div align="right"><a href="#4-codificación">Volver</a></div>**

---

## 4.10. 🚨 Solución de problemas comunes

#### 4.10.1. Error: "Cannot find module './views/auth/LoginView'"

**Problema:** El archivo no existe o la ruta está mal escrita (mayúsculas vs minúsculas).

**Solución:** Verificar con `tree src /F` que el archivo exista. En Windows no hay problema con mayúsculas, pero en Linux/Mac sí — **usa siempre el mismo casing** que en los imports.

#### 4.10.2. Error: "You should call createRoot only once"

**Problema:** `main.jsx` tiene dos llamadas a `ReactDOM.createRoot`.

**Solución:** Debe haber **una sola** llamada a `createRoot` en `main.jsx` — verifica que copiaste bien la sección 4.8.2.

#### 4.10.3. Error: "useRoutes() may be used only in the context of a `<Router>` component"

**Problema:** `App.jsx` usa `<Routes>` pero `main.jsx` no envuelve `<App />` en `<BrowserRouter>`.

**Solución:** Verifica que `main.jsx` tenga `<BrowserRouter>` alrededor de `<App />` (sección 4.8.2).

#### 4.10.4. La vista se ve sin estilos

**Problema:** Los archivos CSS están vacíos (lo cual es **esperado** en este paso).

**Solución:** Es correcto. En los próximos capítulos llenaremos los archivos `styles/*.css`. Mientras tanto, el texto se ve sin formato — **es lo normal**.

#### 4.10.5. Error: "Uncaught SyntaxError: The requested module does not provide an export named 'ROUTES'"

**Problema:** El archivo `src/config/routes.js` está vacío o tiene un `export` diferente.

**Solución:** Verifica que `routes.js` tenga exactamente el contenido de la sección 4.1.3, con `export const ROUTES`.

#### 4.10.6. ESLint marca `react-refresh/only-export-components` en `AuthController.js`

**Problema:** El plugin `react-refresh` exige que los archivos con componentes solo exporten componentes. Como `AuthController` **no es un componente** sino una clase, ESLint puede advertir.

**Solución:** La advertencia **no rompe la compilación**, es solo un warning. En el Capítulo III la silenciaremos agregando `/* eslint-disable react-refresh/only-export-components */` al inicio de los archivos de controllers y models.

#### 4.10.7. La app arranca pero en `/login` no pasa nada al escribir

**Problema:** Correcto — en este paso **no hay lógica de login todavía**. El botón y el formulario llegan en el Capítulo III (JSON Server).

**Solución:** No es un error. Es el estado esperado del "esqueleto funcional".

**<div align="right"><a href="#4-codificación">Volver</a></div>**

---

## 4.11. 📚 Recursos adicionales

- [React — Componentes y props](https://react.dev/learn/components-and-props)
- [React Router — Rutas anidadas](https://reactrouter.com/start/framework/routing)
- [ES Modules en JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules)
- [localStorage — MDN](https://developer.mozilla.org/es/docs/Web/API/Window/localStorage)
- [Vite — HMR y Dev Server](https://vitejs.dev/guide/features.html#hot-module-replacement)

---

<div align="right">
  <table border="0">
    <tr>      
      <td align="center">3. <a href="step0103.md">Estructura del Proyecto</a></td>
      <td align="center"><a href="step00.md">Curso React</a></td>
      <td align="center">5. <a href="step0105.md">Conexión con API Falsa (JSON Server)</a></td>
    </tr>
  </table>
</div>

---

📌 **Notas del profesor sobre este Paso 4:**

1. **El contenido es "esqueleto funcional", no la lógica final.** El objetivo pedagógico es que la app **siga compilando** después de este paso (arranca, navega, no rompe). Si metemos ya toda la lógica de `AuthModel`/`useAuth` con `fetch`, saltamos al Capítulo III y rompemos la secuencia didáctica.

2. **`httpService.js` y `jwtService.js` son stubs vacíos a propósito.** Los estudiantes **deben ver** que un servicio puede existir sin implementación — así entienden que la arquitectura MVC **separa** la estructura de la implementación.

3. **`storageService.js` sí tiene contenido mínimo** (set/get/remove/clear) porque es un wrapper trivial de `localStorage` y servirá de base para la versión del Capítulo III (que añadirá `setToken`, `getToken`, `setUser`, etc.).

4. **`useAuth` ya tiene `useEffect`** que llama a `AuthController.getAuthState()`. Eso deja el hook listo para que en el Capítulo III solo añadamos `login`, `logout` y `register` sin tocar la estructura.

5. **`App.jsx` ya enruta** a las 3 vistas base. El `Dashboard` **no está protegido todavía** — la protección con `ProtectedRoute` llega en el Capítulo III.

6. **`main.jsx` ya envuelve en `<BrowserRouter>`** — este es el cambio más crítico respecto al Paso 2. Sin él, `<Routes>` falla.

7. **Aviso importante para el Capítulo III:** el `AuthController` puede disparar el warning `react-refresh/only-export-components` en ESLint. Ya está documentado en **4.10.6** para que no asuste a los estudiantes.

8. **Ruta del footer:** apunta a `step0105.md` — *"Conexión con API Falsa (JSON Server)"*, coherente con el índice que tienes (Capítulo III de tu `step00.md`). Si prefieres otro nombre de archivo, avísame y lo ajusto.

Cuando lo tengas pegado y confirmes que la app compila y navega entre `/login`, `/register` y `/dashboard` sin errores, escribe **"siguiente"** y pasamos al **Capítulo III — Conexión con API Falsa (JSON Server) + JWT en localStorage**, empezando por el **Paso 5: ¿Qué es una API REST y qué es JSON Server?** 🚀