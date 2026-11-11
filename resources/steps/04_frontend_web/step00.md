# <h1 align="center">🧭 CURSO DE REACT</h1>

## 📖 ÍNDICE

### **[Preliminares](../00_project/01_preliminares/step01.md)**
### 🧭 I. CONTEXTO DE DESARROLLO
1. **[Entorno de Desarrollo](step0101.md)**
2. **[Configuración Inicial](step0102.md)**
3. Iniciar el Proyecto
4. Patrón Arquitectónico
5. Estructura de Carpetas y Archivos

### ⚛️ II. CONCEPTOS BÁSICOS DE REACT
1. ¿Qué es React? — Mentalidad de componentes
2. JSX: HTML dentro de JavaScript
3. Componentes funcionales y props
4. Estado con `useState`
5. Efectos secundarios con `useEffect`
6. Eventos y formularios controlados
7. Renderizado condicional y listas
8. React Router v7: rutas y navegación
9. Context vs props drilling (preparación para Auth)
10. `useRef`, `useMemo`, `useCallback` (repaso práctico)

### 🔌 III. CONEXIÓN CON API FALSA (JSON SERVER) + JWT en localStorage
1. ¿Qué es una API REST y qué es JSON Server?
2. Levantar JSON Server con `db.json`
3. Crear `httpService` (fetch wrapper)
4. Modelos, Controladores y Hooks (replicando el MVC del proyecto)
5. Simulación de JWT: firmar, guardar y verificar
6. `storageService` con `localStorage`
7. `AuthModel.login()` contra JSON Server
8. `useAuth` + `ProtectedRoute`
9. CRUD de usuarios contra JSON Server
10. Pruebas completas del flujo (login → dashboard → logout)

### 🚀 IV. CONEXIÓN CON API REAL (NODE.JS + EXPRESS) + JWT en Cookies
1. Diferencias entre JSON Server y Express + MySQL
2. Revisar el backend provisto (`/api/users/*`)
3. `httpService` con `credentials: 'include'` (cookies)
4. Backend: emitir JWT como cookie `HttpOnly`
5. Backend: middleware que lee la cookie (`cookie-parser`)
6. Backend: CORS con `credentials: true`
7. Frontend: eliminar `localStorage`, ajustar `AuthModel`
8. `useAuth` con verificación por endpoint `/auth/me`
9. Logout: endpoint que limpia cookie
10. Pruebas del flujo completo con cookies

---

**<div align="center"><a href="../../../README.md">Menú Principal</a></div>**

---