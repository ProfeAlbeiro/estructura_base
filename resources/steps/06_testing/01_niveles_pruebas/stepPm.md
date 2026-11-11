<h2 align="center">PUESTA EN MARCHA DEL PROYECTO</h2>

### 1. Subir la Base de Datos

- Ejecutar los servicios de XAMPP
- Abrir phpmyadmin
- Subir las bases de datos (db_node y db_node_test)
<br>

### 2. Crear las terminales de ejecución

- En VS Code, crear la terminal 'backend' y enrutar a dicha carpeta.
- En VS Code, crear la terminal 'frontend' y enrutar a dicha carpeta.
- En VS Code, crear la terminal 'testing' y enrutar a la carpeta frontend.
<br>

### 3. Instalar las dependencias de node

- Ejecutar el siguiente comando en las terminales 'backend' y 'frontend':

```powershell
npm i
```
<br>

### 4. Ejecutar el Backend.

- Crear el archivo '.env' en la raíz del proyecto:

```powershell
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_node
DB_PORT=3306

JWT_SECRET=e9f94f8d3a1e6d7c2b3f9e5a7c8d4f2b7a0e1d3c4f5b6a7e9f8d0c3b4a6d2e1
```

- Verificar que el puerto 'DB_PORT=3306' sea el mismo que el servicio 'MySql' de 'Xampp'
- Verificar las direcciones IPV4: 

```powershell
ipconfig
```

- Copiar la dirección IPV4.
- Pegar la dirección IPV4 en los archivos: 'index.js', 'server.js' y 'config/swagger.js'.
- Ejecutar el servidor 'backend':

```powershell
npm run dev
```

- Abrir 'Swagger' y verificar que el 'backend' esté conectado a la Base de Datos, iniciando sesión con el usuario de la base de datos.
<br>

### 5. Ejecutar el Frontend.

- Verificar las direcciones IPV4: 

```powershell
ipconfig
```

- Copiar la dirección IPV4.
- Pegar la dirección IPV4 en los archivos: 'src/config/api.js'.
- Ejecutar el servidor 'frontend':

```powershell
npm run dev
```

- Verificar que el 'frontend' esté conectado con el 'backend', iniciando sesión con el usuario de la base de datos.
<br>

### 6. Ejecutar las pruebas estáticas.

- Apagar los servidores del 'backend' y el 'frontend' con las teclas 'CTRL + C'
- Ejecutar el siguiente comando en el 'backend' y 'frontend' para las pruebas Unitarias, de Integración y Funcionales con 'Jest':

```powershell
npm test
```
<br>

### 7. Ejecutar las pruebas dinámicas.

- Ejecutar el servidor 'backend'

```powershell
npm run start:test
```

- Ejecutar el servidor 'frontend'

```powershell
npm run dev
```