# 🚀 Paso 1: Despliegue en Azure (Parte 1: Backend y Base de Datos)

Dado que su proyecto es una arquitectura Full-Stack (React + Node.js + MySQL), la estrategia más limpia y profesional en Azure (y la que mejor se adapta a su cuenta educativa) es **dividir el despliegue en dos partes**:

1.  **Backend (API Node.js) + Base de Datos:** Azure App Service + Azure Database for MySQL.
2.  **Frontend (React + Vite):** Azure Static Web Apps.


### 📖 1. Explicación del Concepto

En Azure, no subiremos nuestro código a un servidor virtual (como una máquina con Windows/Linux) porque sería más complejo y costoso. Usaremos **PaaS (Plataforma como Servicio)**.
*   **Azure Database for MySQL (Flexible Server):** Es nuestra base de datos gestionada. Azure se encarga de los respaldos, la seguridad y las actualizaciones. Usaremos la capa gratuita o la más económica (Burstable B1MS) para aprovechar su crédito educativo .
*   **Azure App Service:** Es el servicio donde vivirá nuestro backend (Node.js). Azure compilará y ejecutará nuestro código automáticamente. Usaremos el plan **F1 (Free)** para no gastar crédito .

### 🛠️ 2. Pasos a Seguir

#### Paso A: Crear el Grupo de Recursos y la Base de Datos
1.  Ingrese al [Portal de Azure](https://portal.azure.com) con su cuenta educativa.
2.  En la barra de búsqueda, escriba **"Azure Database for MySQL"** y seleccione **"Crear"**.
3.  Elija **"Flexible Server"** y haga clic en "Crear".
4.  **Configuración Básica:**
    *   **Grupo de recursos:** Cree uno nuevo (ej. `rg-proyecto-web-profe`).
    *   **Nombre del servidor:** Algo único (ej. `mysql-profe-albeiro`).
    *   **Región:** La más cercana a usted (ej. `East US 2` o `Brazil South`).
    *   **Origen de datos:** Ninguno.
    *   **Usuario administrador:** `adminprofe` (guárdelo bien).
    *   **Contraseña:** Una contraseña segura (guárdela, la necesitaremos después).
5.  **Configuración de Proceso y Almacenamiento:** Seleccione la capa **"Burstables"** (es la más económica y la que usualmente cubre el crédito educativo). Deje el almacenamiento en el mínimo (ej. 32 GB).
6.  Haga clic en **"Revisar y crear"** y luego en **"Crear"**. Espere a que se despliegue (toma unos minutos).

#### Paso B: Configurar la Base de Datos para que sea accesible
Cuando termine el despliegue, vaya al recurso recién creado:
1.  En el menú izquierdo, busque **"Configuración / Redes"** (Networking).
2.  Descargue el Certificado SSL
3.  Seleccione las direcciones ip que están disponibles y haga clic en **"Guardar"**.
4.  En el menú izquierdo, busque **"Bases de datos"** y cree una nueva llamada `db_node`. (Si lo prefiere, puede conectarse con MySQL Workbench usando la IP del servidor y ejecutar el script SQL que ya tiene).

#### Paso C: Crear el App Service para el Backend
1.  En el portal, busque **"App Services"** y seleccione **"Crear" -> "Aplicación web"**.
2.  **Configuración Básica:**
    *   **Grupo de recursos:** El mismo que creó arriba (`rg-proyecto-web-profe`).
    *   **Nombre:** Único a nivel global (ej. `api-profe-albeiro`). La URL será `https://api-profe-albeiro.azurewebsites.net`.
    *   **Publicar:** Código.
    *   **Pila de tiempo de ejecución:** **Node.js 24 LTS** (o la versión que esté usando en local, Azure soporta versiones recientes) .
    *   **Sistema operativo:** Linux (recomendado para Node.js).
    *   **Región:** La misma que la base de datos (para reducir latencia).
    *   **Plan de App Service:** Cree uno nuevo. En "Plan de precios", seleccione **"Free F1"** (es gratis, aunque tiene límites de CPU, es perfecto para pruebas) .
3.  Haga clic en **"Revisar y crear"** y luego en **"Crear"**.

#### Paso D: Configurar las Variables de Entorno en Azure
Para que el código no tenga contraseñas "quemadas", debemos decírselas a Azure.
1.  Vaya al recurso de App Service que acaba de crear.
2.  En el menú izquierdo, busque **"Configuración" -> "Variables de entorno"** (o "Configuración de la aplicación").
3.  Agregue las siguientes variables (una por una) con los valores de su base de datos en Azure:
    *   `DB_HOST` = (El nombre del servidor MySQL que creó, ej. `mysql-profe-albeiro.mysql.database.azure.com`).
    *   `DB_USER` = (El usuario administrador que definió, ej. `adminprofe`).
    *   `DB_PASSWORD` = (Su contraseña).
    *   `DB_NAME` = `db_node`.
    *   `DB_PORT` = `3306`.
    *   `JWT_SECRET` = (Su clave secreta del archivo .env).
    *   `NODE_ENV` = `production`.
4.  Haga clic en **"Aplicar"** o **"Guardar"** arriba.

---

### ⚠️ 3. Solución a Problemas (Errores comunes en este paso)

*   **Problema: "No se puede conectar a la base de datos" desde App Service.**
    *   *Causa:* El firewall de la base de datos no permite el tráfico.
    *   *Solución:* En la base de datos MySQL, en la sección **"Redes"**, asegúrese de haber marcado la casilla **"Permitir el acceso público desde cualquier servicio de Azure dentro de Azure"** (o "Servicios de Azure"). Esto permite que el App Service (que tiene IPs dinámicas) se conecte .
*   **Problema: Al crear la Base de Datos, el costo es alto.**
    *   *Solución:* Asegúrese de seleccionar la capa **"Burstable"** y el tamaño **B1MS**. Si su suscripción educativa le da $100 USD, este tamaño consume muy poco (alrededor de $12-$15 al mes). Si se excede, apague el servidor cuando no lo use.
*   **Problema: El nombre del App Service ya está en uso.**
    *   *Solución:* El nombre debe ser único en todo el mundo. Agregue números o iniciales (ej. `api-profe-albeiro-2026`).

---
