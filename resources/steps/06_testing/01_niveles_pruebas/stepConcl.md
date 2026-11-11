# 📝 Resumen y Conclusión Metodológica: Implementación de Pruebas de Software por Niveles

## 🎯 1. El Propósito de esta Guía
A lo largo de este taller, no solo aprendimos a escribir código de pruebas, sino que abordamos la calidad del software desde una perspectiva de ingeniería estructurada. Tomamos una aplicación web real (Backend Node.js/Express, Frontend React y Base de Datos MySQL) y aplicamos la **pirámide de pruebas**, implementando herramientas líderes en la industria: **Jest** (para la base de la pirámide) y **Cypress** (para la cúspide). 

## 🏗️ 2. Resumen de los Niveles Implementados
Es fundamental que como futuros ingenieros comprendan *qué* evaluamos en cada nivel y *por qué* usamos herramientas distintas:

*   **Nivel 1: Pruebas Unitarias (Jest):** Evaluamos la unidad mínima de código (funciones, middlewares, modelos) en completo aislamiento. Usamos *mocks* y *spies* para no depender de la base de datos. *(Ej. Verificar que bcrypt encripte una contraseña).*
*   **Nivel 2: Pruebas de Integración (Jest + Supertest):** Verificamos que los componentes se comuniquen correctamente. Evaluamos el viaje completo: Router -> Middleware -> Controlador -> Modelo -> Base de Datos. *(Ej. Verificar que un POST realmente inserte un registro en MySQL).*
*   **Nivel 3: Pruebas Funcionales (Jest + Supertest):** Evaluamos desde la "Caja Negra". No nos importa el código interno, sino que se cumplan las reglas de negocio. *(Ej. Rechazar un login con contraseña incorrecta o un registro con email duplicado).*
*   **Nivel 4: Pruebas de Sistema (Cypress):** Evaluamos el sistema completo End-to-End (E2E). Cypress abrió un navegador real, interactuó con el DOM de React y validó que la interfaz reaccionara correctamente a los datos del backend.
*   **Nivel 5: Pruebas de Aceptación (Cypress):** Nos pusimos en los zapatos del usuario final y del cliente. Validamos criterios de aceptación y seguridad. *(Ej. Verificar que un administrador no pueda auto-eliminarse o que los datos persistan al recargar la página).*

## 💡 3. Lecciones Aprendidas y Solución de Problemas (El valor de la depuración)
Esta guía no estuvo exenta de errores, y **eso es precisamente lo que la hace valiosa**. En el desarrollo profesional, el código casi nunca funciona al primer intento. Aprendimos a resolver:
*   **Conflictos de entornos (ES Modules vs CommonJS):** Cómo el `"type": "module"` de Vite nos obligó a usar extensiones `.cjs` para configurar Cypress y Jest.
*   **Aislamiento de Bases de Datos:** La importancia crítica de usar archivos `.env.test` y scripts condicionales (como `cross-env NODE_ENV=test`) para evitar que las pruebas automatizadas destruyan la base de datos de desarrollo (`db_node`).
*   **Redes y Puertos:** Cómo diagnosticar errores `ETIMEDOUT` cuando las IPs locales cambian o cuando el Backend no está corriendo en la IP que el test espera.
*   **Lógica de Negocio vs. Backend:** Descubrimos que un falso positivo (HTTP 200) en el backend puede ocurrir si el controlador no recibe el `id` correcto, y cómo las pruebas de integración nos ayudaron a detectar ese bug.

## 🚀 4. Conclusión Metodológica
Como pueden ver, **las pruebas no son un gasto, son una inversión**. Un sistema sin pruebas es un sistema que da miedo modificar. 

*   **Jest** nos dio velocidad y aislamiento. Nos permitió probar la lógica en milisegundos sin tocar la base de datos.
*   **Cypress** nos dio confianza y realismo. Nos mostró exactamente lo que el usuario verá en su pantalla, incluyendo capturas de pantalla y videos si algo falla.

**El mensaje final:** Un buen ingeniero de software no es solo el que hace que el código funcione, sino el que **demuestra con evidencias** que el código seguirá funcionando en el futuro. La cultura de calidad (Quality Assurance) se construye desde el primer commit, no al final del proyecto.
