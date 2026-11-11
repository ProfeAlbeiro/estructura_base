Proyecto Formativo ADSO
Sistema Web y Móvil para Gestión Integral de Tienda de Café Online
1. INTRODUCCIÓN

La transformación digital ha permitido que las empresas optimicen sus procesos comerciales mediante soluciones tecnológicas que integran la gestión operativa y administrativa. En el sector cafetero, la comercialización en línea requiere herramientas que permitan controlar inventarios, registrar ventas, gestionar pagos electrónicos y coordinar procesos de entrega de manera eficiente.

El presente proyecto propone el desarrollo de una aplicación web y móvil denominada Coffee Store, orientada a la administración integral de una tienda especializada en la venta de café en distintas presentaciones. La solución permitirá automatizar los procesos de gestión de usuarios, control de inventario, ventas, pagos, domicilios y generación de reportes gerenciales, contribuyendo al mejoramiento de la productividad y la toma de decisiones basada en datos.

2. PROBLEMA

(Mantener la estructura de la plantilla y complementar en letra cursiva)

Actualmente la empresa comercializa café en diferentes presentaciones mediante procesos parcialmente manuales para el control de inventarios, ventas y seguimiento de pedidos. Esta situación genera dificultades para conocer el stock disponible en tiempo real, controlar las ganancias obtenidas, consolidar reportes gerenciales y realizar seguimiento eficiente a los domicilios y métodos de pago utilizados por los clientes.

Como consecuencia, existen riesgos de inconsistencias en la información, retrasos operativos y limitaciones para la toma de decisiones estratégicas que permitan mejorar la competitividad del negocio.

3. OBJETIVOS
Objetivo General

Desarrollar una aplicación web y móvil que permita gestionar integralmente los procesos de usuarios, inventario, ventas, pagos, domicilios y reportes de una tienda de café en línea, mejorando el control operativo y administrativo del negocio.

Objetivos Específicos

Diseñar el modelo de datos que soporte la gestión de productos, inventario, ventas, pagos y domicilios.

Implementar un módulo de gestión de usuarios con control de roles y permisos.

Desarrollar funcionalidades para el control y seguimiento del inventario en tiempo real.

Automatizar el proceso de ventas y registro de pedidos en línea.

Implementar múltiples métodos de pago con trazabilidad de transacciones.

Gestionar el proceso de distribución y seguimiento de domicilios.

Generar reportes administrativos para el análisis de ventas, ganancias e inventarios.

4. JUSTIFICACIÓN

La implementación del sistema permitirá centralizar la información del negocio en una única plataforma tecnológica, facilitando la administración de inventarios, la gestión comercial y el control financiero.

La solución contribuirá a reducir errores derivados de procesos manuales, optimizar los tiempos de respuesta al cliente y proporcionar información estratégica para la toma de decisiones mediante indicadores y reportes consolidados.

Adicionalmente, el proyecto fortalecerá las competencias técnicas de los aprendices ADSO mediante la aplicación de metodologías de ingeniería de software, bases de datos, desarrollo web y móvil, pruebas de software y despliegue de soluciones empresariales.

5. ALCANCE
Alcance General

El proyecto contempla el análisis, diseño, desarrollo, pruebas e implementación de una plataforma web y móvil para la gestión integral de una tienda de café que comercializa productos en diferentes presentaciones.

MÓDULO DE USUARIOS
Casos de Uso (CRUD)
Crear usuario
Consultar usuario
Actualizar usuario
Eliminar usuario
Iniciar sesión
Recuperar contraseña
Gestionar roles
Gestionar perfiles
Cerrar sesión
MÓDULO DE INVENTARIO
Casos de Uso (CRUD)
Registrar producto
Consultar producto
Actualizar producto
Eliminar producto
Registrar ingreso de inventario
Registrar salida de inventario
Consultar existencias
Generar alertas de stock mínimo
Consultar movimientos de inventario
MÓDULO DE VENTAS
Casos de Uso (CRUD)
Crear pedido
Consultar pedido
Modificar pedido
Cancelar pedido
Consultar historial de ventas
Confirmar compra
Gestionar carrito de compras
Aplicar descuentos y promociones
MÓDULO DE PAGOS
Casos de Uso (CRUD)
Registrar pago
Consultar pago
Actualizar estado de pago
Anular transacción
Gestionar métodos de pago
Validar transacciones
Consultar historial de pagos
MÓDULO DE DOMICILIOS
Casos de Uso (CRUD)
Registrar domicilio
Consultar domicilio
Actualizar estado de entrega
Cancelar domicilio
Asignar repartidor
Consultar trazabilidad de entrega
Confirmar entrega
MÓDULO DE REPORTES
Casos de Uso (CRUD)
Generar reporte de ventas
Generar reporte de ganancias
Generar reporte de inventario
Generar reporte de productos más vendidos
Generar reporte de domicilios
Exportar reportes PDF
Exportar reportes Excel
ARQUITECTURA PROPUESTA
Arquitectura de Software
Arquitectura Multicapa (N-Tier)

Capa de Presentación

Aplicación Web
Aplicación Móvil

Capa de Negocio

Servicios REST API
Reglas de negocio
Autenticación y autorización

Capa de Persistencia

ORM
Repositorios
Acceso a datos

Capa de Base de Datos

Almacenamiento relacional
Patrones Arquitectónicos
Patrón MVC

(Model - View - Controller)

Permite separar la lógica de negocio, interfaz de usuario y control de eventos para facilitar mantenimiento y escalabilidad.

Patrón Repository

Encapsula el acceso a datos y desacopla la lógica de negocio de la persistencia.

Patrón DTO

Facilita la transferencia eficiente de información entre frontend y backend.

Patrón JWT Authentication

Permite autenticación segura basada en tokens.

STACK TECNOLÓGICO PROPUESTO
Base de Datos
PostgreSQL
MySQL (Alternativa)
Backend
Node.js
Express.js
TypeScript
JWT
Swagger
Frontend Web
Angular 20+
HTML5
CSS3
Bootstrap 5
Frontend Móvil
Flutter
Dart
Plataforma de Servidores
Ubuntu Server
Nginx
Docker
Servicios IT
GitHub
GitHub Actions (CI/CD)
Firebase Cloud Messaging
Cloudinary
Render / Railway / Azure App Service
SonarQube
Postman
6. DELIMITACIÓN
Metodología

El proyecto será desarrollado bajo la metodología tradicional en cascada, ejecutando cada fase de manera secuencial y garantizando la aprobación de los entregables antes de iniciar la siguiente etapa.

Fases
1. Análisis de Requisitos
Levantamiento de información
Requisitos funcionales
Requisitos no funcionales
2. Diseño
Casos de uso
Arquitectura
Modelo de datos
Prototipos UI/UX
3. Desarrollo
Backend
Base de datos
Frontend Web
Frontend Móvil
4. Pruebas
Pruebas unitarias
Pruebas funcionales
Pruebas de integración
5. Implementación
Despliegue
Capacitación
Documentación
Cronograma Gantt (Resumen)
Fase	Mes 1	Mes 2	Mes 3	Mes 4	Mes 5Análisis	●				
Diseño	●	●			
Desarrollo Backend		●	●		
Desarrollo Frontend			●	●	
Pruebas				●	
Implementación					●
7. ENTREGABLES POR TRIMESTRE
Trimestre I

Documento de requisitos, análisis del problema, objetivos, alcance, casos de uso y propuesta arquitectónica.

Trimestre II

Modelo de datos, diseño de interfaces, construcción de base de datos y desarrollo inicial del backend.

Trimestre III

Desarrollo completo de servicios API REST y construcción de la aplicación web y móvil.

Trimestre IV

Pruebas funcionales, pruebas de integración, corrección de incidencias y generación de reportes de calidad.

Trimestre V

Despliegue productivo, manual técnico, manual de usuario, video demostrativo y sustentación final del proyecto.

Nombre sugerido para la sustentación

COFFEE STORE Sistema Inteligente de Gestión Comercial, Inventario y Domicilios para una Tienda de Café Online ☕🚀