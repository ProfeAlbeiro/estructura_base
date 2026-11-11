# EJECICIO PROPUESTO: Normalizar el siguiente Modelo de Datos:

![Modelo de Datos](img/img01.png)

## Código SQL del Modelo de datos:

```sql
DROP DATABASE IF EXISTS BBDD_INVENTARIO;
-- -----------------------------------------------------
-- Estructura BBDD_INVENTARIO
-- -----------------------------------------------------
CREATE SCHEMA BBDD_INVENTARIO DEFAULT CHARACTER SET utf8 ;
USE BBDD_INVENTARIO;

-- -----------------------------------------------------
-- Tabla ROLES
-- -----------------------------------------------------
CREATE TABLE ROLES (
  codigo_rol INT NOT NULL AUTO_INCREMENT,
  nombre_rol VARCHAR(50) NOT NULL,
  PRIMARY KEY (codigo_rol)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla USUARIOS
-- -----------------------------------------------------
CREATE TABLE USUARIOS (
  codigo_rol INT NOT NULL,
  codigo_user VARCHAR(10) NOT NULL,
  nombres_user VARCHAR(50) NOT NULL,
  apellidos_user VARCHAR(50) NOT NULL,
  correo_user VARCHAR(100) NOT NULL,
  PRIMARY KEY (codigo_user),
  INDEX ind_usuario_rol (codigo_rol ASC),
  UNIQUE INDEX uq_correo_user (correo_user ASC),
  CONSTRAINT fk_usuario_rol
    FOREIGN KEY (codigo_rol)
    REFERENCES ROLES (codigo_rol)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla CREDENCIALES
-- -----------------------------------------------------
CREATE TABLE CREDENCIALES (
  codigo_cred VARCHAR(10) NOT NULL,
  foto_cred BLOB NOT NULL,
  identificacion_cred VARCHAR(30) NOT NULL,
  fecha_ingreso_cred DATE NOT NULL,
  pass_cred VARCHAR(300) NOT NULL,
  estado_cred TINYINT NOT NULL,
  PRIMARY KEY (codigo_cred),
  INDEX ind_credencial_usuario (codigo_cred ASC),
  UNIQUE INDEX uq_identificacion_cred (identificacion_cred ASC),
  CONSTRAINT chk_evitarPersona 
    CHECK (codigo_cred NOT LIKE '%person%'),
  CONSTRAINT fk_credencial_usuario
    FOREIGN KEY (codigo_cred)
    REFERENCES USUARIOS (codigo_user)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla MENSAJES
-- -----------------------------------------------------
CREATE TABLE MENSAJES (
  codigo_user VARCHAR(10) NOT NULL,
  fecha_mensaje DATE NOT NULL,
  asunto_mensaje VARCHAR(50) NOT NULL,
  descripcion_mensaje VARCHAR(300) NOT NULL,
  INDEX ind_mensaje_usuario (codigo_user ASC),
  CONSTRAINT fk_mensaje_usuario
    FOREIGN KEY (codigo_user)
    REFERENCES USUARIOS (codigo_user)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla CATEGORIAS
-- -----------------------------------------------------
CREATE TABLE CATEGORIAS (
  codigo_categoria INT NOT NULL AUTO_INCREMENT,
  nombre_categoria VARCHAR(50) NOT NULL,
  PRIMARY KEY (codigo_categoria)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla PRODUCTOS
-- -----------------------------------------------------
CREATE TABLE PRODUCTOS (
  codigo_categoria INT NOT NULL,
  codigo_producto VARCHAR(10) NOT NULL,
  nombre_producto VARCHAR(50) NOT NULL,
  precio_producto DECIMAL(10,2) NOT NULL,
  unidad_producto DECIMAL(10,2) NOT NULL,
  medida_producto VARCHAR(20) NOT NULL,
  stock_productos INT NOT NULL,
  PRIMARY KEY (codigo_producto),
  INDEX ind_producto_categoria (codigo_categoria ASC),
  CONSTRAINT fk_producto_categoria
    FOREIGN KEY (codigo_categoria)
    REFERENCES CATEGORIAS (codigo_categoria)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla CLIENTES
-- -----------------------------------------------------
CREATE TABLE CLIENTES (
  codigo_customer VARCHAR(10) NOT NULL,
  fecha_nac_customer DATE NOT NULL,
  PRIMARY KEY (codigo_customer),
  INDEX ind_cliente_credencial (codigo_customer ASC),
  CONSTRAINT chk_soloCliente 
  CHECK (codigo_customer LIKE '%customer%'),
  CONSTRAINT fk_cliente_credencial
    FOREIGN KEY (codigo_customer)
    REFERENCES CREDENCIALES (codigo_cred)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla PEDIDOS
-- -----------------------------------------------------
CREATE TABLE PEDIDOS (
  codigo_customer VARCHAR(10) NOT NULL,
  codigo_pedido VARCHAR(10) NOT NULL,
  fecha_pedido DATE NOT NULL,
  ciudad_pedido VARCHAR(50) NOT NULL,
  direccion_pedido VARCHAR(100) NOT NULL,
  total_pl_pedido DECIMAL(10,2) NOT NULL,
  iva_pedido DECIMAL(10,2) NOT NULL,
  total_pr_pedido DECIMAL(10,2) NOT NULL,
  estado_pedido VARCHAR(30) NOT NULL,
  PRIMARY KEY (codigo_pedido),
  INDEX ind_pedido_cliente (codigo_customer ASC),
  CONSTRAINT fk_pedido_cliente
    FOREIGN KEY (codigo_customer)
    REFERENCES CLIENTES (codigo_customer)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla LISTA_PRODUCTOS_PEDIDOS
-- -----------------------------------------------------
CREATE TABLE LISTA_PRODUCTOS_PEDIDOS (
  codigo_pedido VARCHAR(10) NOT NULL,
  codigo_producto VARCHAR(10) NOT NULL,
  cantidad_productos INT NOT NULL,
  INDEX ind_lista_productos_pedido (codigo_pedido ASC),
  INDEX ind_lista_producto_producto (codigo_producto ASC),
  CONSTRAINT fk_lista_productos_pedido
    FOREIGN KEY (codigo_pedido)
    REFERENCES PEDIDOS (codigo_pedido)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_lista_productos_producto
    FOREIGN KEY (codigo_producto)
    REFERENCES PRODUCTOS (codigo_producto)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla VENDEDORES
-- -----------------------------------------------------
CREATE TABLE VENDEDORES (
  codigo_seller VARCHAR(10) NOT NULL,
  salario_seller DECIMAL(15,2) NOT NULL,
  INDEX ind_vendedor_credencial (codigo_seller ASC),
  PRIMARY KEY (codigo_seller),
  CONSTRAINT chk_soloVendedor 
  CHECK (codigo_seller LIKE '%seller%'),
  CONSTRAINT fk_vendedor_credencial
    FOREIGN KEY (codigo_seller)
    REFERENCES CREDENCIALES (codigo_cred)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla VENDEDORES_PEDIDOS
-- -----------------------------------------------------
CREATE TABLE VENDEDORES_PEDIDOS (
  codigo_seller VARCHAR(10) NOT NULL,
  codigo_pedido VARCHAR(10) NOT NULL,
  INDEX ind_credencial_pedido_vendedor (codigo_seller ASC),
  INDEX ind_credencial_pedido_pedido (codigo_pedido ASC),
  PRIMARY KEY (codigo_pedido),
  CONSTRAINT fk_credencial_pedido_vendedor
    FOREIGN KEY (codigo_seller)
    REFERENCES VENDEDORES (codigo_seller)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_credencial_pedido_pedido
    FOREIGN KEY (codigo_pedido)
    REFERENCES PEDIDOS (codigo_pedido)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla COMPRAS
-- -----------------------------------------------------
CREATE TABLE COMPRAS (
  codigo_compra VARCHAR(10) NOT NULL,
  fecha_compra DATE NOT NULL,
  total_pr_compra DECIMAL(10,2) NOT NULL,
  documento_compra BLOB NOT NULL,
  PRIMARY KEY (codigo_compra)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla LISTA_PRODUCTOS_COMPRADOS
-- -----------------------------------------------------
CREATE TABLE LISTA_PRODUCTOS_COMPRADOS (
  codigo_compra VARCHAR(10) NOT NULL,
  codigo_producto VARCHAR(45) NOT NULL,
  precio_producto_compra DECIMAL(10,2) NOT NULL,
  cantidad_productos_compra INT NOT NULL,
  INDEX ind_lista_prod_comp_productos (codigo_producto ASC),
  INDEX ind_lista_prod_comp_compra (codigo_compra ASC),
  CONSTRAINT fk_lista_prod_comp_productos
    FOREIGN KEY (codigo_producto)
    REFERENCES PRODUCTOS (codigo_producto)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_lista_prod_comp_compra
    FOREIGN KEY (codigo_compra)
    REFERENCES COMPRAS (codigo_compra)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;
```