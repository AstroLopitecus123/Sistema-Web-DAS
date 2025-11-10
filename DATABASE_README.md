# DATABASE README - Sistema Web DAS

Documentación completa de la base de datos `BD_SISTEMA_WEB_DAS` para el sistema de e-commerce con funcionalidades de personalización de productos, gestión multi-rol y sistema completo de pedidos.

## Descripción General

La base de datos está diseñada para gestionar un sistema completo de e-commerce con funcionalidades de:
- Gestión multi-rol de usuarios (cliente, administrador, repartidor, vendedor)
- Catálogo de productos con categorías
- **Sistema de personalización de productos** con opciones configurables
- Sistema de pedidos con seguimiento de estados
- Procesamiento de pagos (Stripe, billetera virtual, efectivo)
- Sistema de cupones y descuentos con restricciones
- Carrito de compras persistente
- Gestión de usuarios por **username único**
- Normalización automática de teléfonos con código de país (+51)
- Reportes y auditoría
- Recuperación de contraseñas

## Tablas del Sistema

### 1. Usuarios
**Propósito**: Gestiona todos los usuarios del sistema con diferentes roles y username único.

```sql
CREATE TABLE Usuarios (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE,
  contraseña_encriptada VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  direccion VARCHAR(255),
  rol ENUM('cliente', 'administrador', 'repartidor', 'vendedor') NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (id_usuario)
);
```

**Campos importantes**:
- `username`: Nombre de usuario único (generado automáticamente durante registro)
- `email`: Email único para evitar duplicados
- `telefono`: Normalizado automáticamente con código +51 (Perú)
- `rol`: Define el tipo de usuario (cliente, administrador, repartidor, vendedor)
- `activo`: Controla si el usuario puede acceder al sistema
- `contraseña_encriptada`: Almacena la contraseña hasheada con BCrypt

**Relaciones**:
- Referenciada por: Pedidos, Carrito, Cupones, Reportes, Historial_Estado_Pedido

### 2. Categorias
**Propósito**: Organiza los productos en categorías para facilitar la navegación y filtrado.

```sql
CREATE TABLE Categorias (
  id_categoria INT NOT NULL AUTO_INCREMENT,
  nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  PRIMARY KEY (id_categoria)
);
```

**Campos importantes**:
- `nombre_categoria`: Nombre único de la categoría (ej: Comidas, Bebidas, Postres)
- `descripcion`: Descripción opcional de la categoría

**Relaciones**:
- Referenciada por: Productos

### 3. Productos
**Propósito**: Catálogo de productos disponibles para la venta.

```sql
CREATE TABLE Productos (
  id_producto INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  id_categoria INT NOT NULL,
  imagen_url VARCHAR(255),
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  stock INT NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_producto),
  FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria)
);
```

**Campos importantes**:
- `stock`: Inventario disponible para el producto (usado por el panel admin)
- `precio`: Precio base del producto con precisión DECIMAL(10,2)
- `imagen_url`: URL de la imagen del producto
- `ultima_actualizacion`: Se actualiza automáticamente al modificar el registro

**Relaciones**:
- Referencia a: Categorias
- Referenciada por: Detalle_Pedido, Carrito, opciones_personalizacion

### 4. Opciones de Personalización (NUEVA)
**Propósito**: Sistema tipo Rappi para personalizar productos con opciones configurables y precios adicionales.

```sql
CREATE TABLE opciones_personalizacion (
  id_opcion INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio_adicional DECIMAL(10, 2) NOT NULL,
  activa BOOLEAN DEFAULT TRUE,
  id_producto INT NOT NULL,
  PRIMARY KEY (id_opcion),
  FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);
```

**Campos importantes**:
- `nombre`: Nombre de la opción (ej: "Extra Queso", "Sin Cebolla")
- `descripcion`: Descripción detallada de la opción
- `precio_adicional`: Precio adicional que se suma al producto (puede ser 0.00)
- `activa`: Controla si la opción está disponible
- `id_producto`: Producto al que pertenece la opción

**Ejemplos de opciones**:
- Para Hamburguesa: Extra Queso (+2.50), Sin Cebolla (0.00), Extra Tocino (+3.00)
- Para Papas Fritas: Papas Grandes (+2.00), Con Queso (+2.50)
- Para Bebidas: Botella Grande (+2.00), Sin Hielo (0.00)

**Relaciones**:
- Referencia a: Productos

### 5. Pedidos
**Propósito**: Gestiona los pedidos realizados por los clientes con seguimiento completo de estados.

```sql
CREATE TABLE Pedidos (
  id_pedido INT NOT NULL AUTO_INCREMENT,
  id_cliente INT NOT NULL,
  fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado_pedido ENUM('pendiente', 'aceptado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  total_pedido DECIMAL(10, 2) NOT NULL,
  direccion_entrega VARCHAR(255) NOT NULL,
  notas_cliente TEXT,
  id_repartidor INT,
  id_cupon_aplicado INT,
  descuento_aplicado DECIMAL(10, 2) DEFAULT 0.00,
  metodo_pago ENUM('tarjeta', 'billetera_virtual', 'efectivo') NOT NULL,
  estado_pago ENUM('pendiente', 'pagado', 'fallido', 'reembolsado') NOT NULL DEFAULT 'pendiente',
  fecha_entrega DATETIME,
  problema_reportado TINYINT(1) DEFAULT 0,
  detalle_problema TEXT,
  fecha_problema DATETIME,
  PRIMARY KEY (id_pedido),
  FOREIGN KEY (id_cliente) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_repartidor) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_cupon_aplicado) REFERENCES Cupones(id_cupon)
);
```

**Campos importantes**:
- `estado_pedido`: Flujo de estados del pedido (pendiente → aceptado → en_preparacion → en_camino → entregado)
- `estado_pago`: Estado del pago independiente del pedido
- `id_repartidor`: Asignación de repartidor (puede ser NULL hasta asignarse)
- `descuento_aplicado`: Descuento aplicado por cupón (si aplica)
- `metodo_pago`: Método de pago seleccionado (tarjeta, billetera_virtual, efectivo)
- `total_pedido`: Total del pedido incluyendo personalizaciones y descuentos

**Estados del Pedido**:
1. `pendiente` - Pedido creado, esperando confirmación
2. `aceptado` - Pedido aceptado por el restaurante
3. `en_preparacion` - Pedido en proceso de preparación
4. `en_camino` - Pedido asignado a repartidor, en camino
5. `entregado` - Pedido entregado al cliente
6. `cancelado` - Pedido cancelado

**Relaciones**:
- Referencia a: Usuarios (cliente y repartidor), Cupones
- Referenciada por: Detalle_Pedido, Pagos, Historial_Estado_Pedido

### 6. Detalle_Pedido
**Propósito**: Almacena los productos específicos de cada pedido con sus personalizaciones.

```sql
CREATE TABLE Detalle_Pedido (
  id_detalle_pedido INT NOT NULL AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  notas_personalizacion TEXT,
  opciones_seleccionadas TEXT,
  precio_opciones DECIMAL(10, 2) DEFAULT 0.00,
  PRIMARY KEY (id_detalle_pedido),
  FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);
```

**Campos importantes**:
- `precio_unitario`: Precio del producto al momento del pedido (puede cambiar después)
- `subtotal`: (cantidad × precio_unitario) + precio_opciones
- `notas_personalizacion`: Notas especiales del cliente (texto libre)
- `opciones_seleccionadas`: JSON o texto con las opciones seleccionadas
- `precio_opciones`: Suma de precios adicionales de las opciones seleccionadas

**Cálculo del Subtotal**:
```
subtotal = (cantidad × precio_unitario) + (cantidad × precio_opciones)
```

**Relaciones**:
- Referencia a: Pedidos, Productos
- CASCADE DELETE: Si se elimina un pedido, se eliminan sus detalles automáticamente

### 7. Pagos
**Propósito**: Registra las transacciones de pago de los pedidos con integración Stripe.

```sql
CREATE TABLE Pagos (
  id_pago INT NOT NULL AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  metodo_pago ENUM('tarjeta', 'billetera_virtual', 'efectivo') NOT NULL,
  estado_transaccion ENUM('exitoso', 'fallido', 'pendiente') NOT NULL,
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  referencia_transaccion VARCHAR(255),
  PRIMARY KEY (id_pago),
  FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido)
);
```

**Campos importantes**:
- `referencia_transaccion`: ID de la transacción del gateway de pago (Stripe PaymentIntent ID)
- `estado_transaccion`: Estado final de la transacción
- `monto`: Monto exacto pagado
- `metodo_pago`: Método utilizado (coincide con el del pedido)

**Métodos de Pago**:
- `tarjeta`: Procesado por Stripe, referencia_transaccion contiene PaymentIntent ID
- `billetera_virtual`: Confirmación manual, referencia puede contener número de transacción
- `efectivo`: Confirmación manual, referencia puede contener información adicional

**Relaciones**:
- Referencia a: Pedidos

### 8. Cupones
**Propósito**: Sistema de descuentos y promociones con restricciones configurables.

```sql
CREATE TABLE Cupones (
  id_cupon INT NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  tipo_descuento ENUM('porcentaje', 'monto_fijo') NOT NULL,
  valor_descuento DECIMAL(10, 2) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  cantidad_disponible INT,
  usos_maximos_por_usuario INT DEFAULT 1,
  monto_minimo_compra DECIMAL(10, 2) DEFAULT 0.00,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  creado_por_admin INT NOT NULL,
  PRIMARY KEY (id_cupon),
  FOREIGN KEY (creado_por_admin) REFERENCES Usuarios(id_usuario)
);
```

**Campos importantes**:
- `codigo`: Código único del cupón (ej: "BIENVENIDA10")
- `tipo_descuento`: 'porcentaje' (ej: 10%) o 'monto_fijo' (ej: 5.00)
- `valor_descuento`: Valor del descuento según el tipo
- `cantidad_disponible`: Límite de usos totales del cupón
- `usos_maximos_por_usuario`: Límite de usos por usuario individual
- `monto_minimo_compra`: Compra mínima requerida para aplicar el cupón
- `activo`: Si el cupón está disponible para uso

**Relaciones**:
- Referencia a: Usuarios (admin que lo creó)
- Referenciada por: Pedidos, Restricciones_Cupon

### 9. Carrito
**Propósito**: Carrito temporal de compras por usuario.

```sql
CREATE TABLE Carrito (
  id_carrito INT NOT NULL AUTO_INCREMENT,
  id_cliente INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  notas_personalizacion TEXT,
  fecha_adicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_carrito),
  FOREIGN KEY (id_cliente) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES Productos(id_producto) ON DELETE CASCADE
);
```

**Campos importantes**:
- `notas_personalizacion`: Especificaciones del cliente o JSON con opciones seleccionadas
- `fecha_adicion`: Fecha en que se agregó al carrito
- CASCADE DELETE: Se elimina automáticamente si se elimina usuario o producto

**Relaciones**:
- Referencia a: Usuarios, Productos

### 10. Reportes
**Propósito**: Registro de reportes generados por administradores.

```sql
CREATE TABLE Reportes (
  id_reporte INT NOT NULL AUTO_INCREMENT,
  nombre_reporte VARCHAR(100) NOT NULL,
  tipo_reporte ENUM('ventas', 'productos_vendidos', 'ganancias') NOT NULL,
  fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  generado_por_admin INT NOT NULL,
  fecha_inicio_param DATE,
  fecha_fin_param DATE,
  PRIMARY KEY (id_reporte),
  FOREIGN KEY (generado_por_admin) REFERENCES Usuarios(id_usuario)
);
```

**Campos importantes**:
- `tipo_reporte`: Tipo de reporte generado
- `fecha_inicio_param` y `fecha_fin_param`: Rango de fechas del reporte
- `fecha_generacion`: Cuándo se generó el reporte

**Relaciones**:
- Referencia a: Usuarios (admin que generó el reporte)

### 11. Historial_Estado_Pedido
**Propósito**: Auditoría completa de cambios de estado en pedidos.

```sql
CREATE TABLE Historial_Estado_Pedido (
  id_historial INT NOT NULL AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  estado_anterior ENUM('pendiente', 'aceptado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado'),
  estado_nuevo ENUM('pendiente', 'aceptado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado') NOT NULL,
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cambiado_por_usuario INT,
  PRIMARY KEY (id_historial),
  FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (cambiado_por_usuario) REFERENCES Usuarios(id_usuario)
);
```

**Campos importantes**:
- `estado_anterior`: Estado previo al cambio (NULL para el primer estado)
- `estado_nuevo`: Nuevo estado del pedido
- `cambiado_por_usuario`: ID del usuario que realizó el cambio (admin o repartidor)
- `fecha_cambio`: Timestamp del cambio

**Relaciones**:
- Referencia a: Pedidos, Usuarios
- CASCADE DELETE: Se elimina si se elimina el pedido

### 12. Restricciones_Cupon
**Propósito**: Restricciones específicas para cupones aplicables a productos o categorías.

```sql
CREATE TABLE Restricciones_Cupon (
  id_restriccion INT NOT NULL AUTO_INCREMENT,
  id_cupon INT NOT NULL,
  tipo_restriccion ENUM('producto', 'categoria') NOT NULL,
  id_referencia INT NOT NULL,
  PRIMARY KEY (id_restriccion),
  FOREIGN KEY (id_cupon) REFERENCES Cupones(id_cupon) ON DELETE CASCADE
);
```

**Campos importantes**:
- `tipo_restriccion`: Si aplica a un producto específico o una categoría completa
- `id_referencia`: ID del producto (si tipo='producto') o categoría (si tipo='categoria')
- Permite crear cupones específicos para ciertos productos o categorías

**Ejemplos**:
- Cupón solo para hamburguesas: `tipo_restriccion='categoria'`, `id_referencia=1` (id de Comidas)
- Cupón solo para un producto: `tipo_restriccion='producto'`, `id_referencia=1` (id del producto)

**Relaciones**:
- Referencia a: Cupones
- CASCADE DELETE: Se elimina si se elimina el cupón

### 13. tokens_recuperacion_contrasena
**Propósito**: Tokens temporales para recuperación segura de contraseñas.

```sql
CREATE TABLE tokens_recuperacion_contrasena (
  id_token INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion DATETIME NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id_token),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expiracion (fecha_expiracion)
);
```

**Campos importantes**:
- `token`: Token único y seguro para recuperación
- `fecha_expiracion`: Expiración del token (generalmente 24 horas)
- `usado`: Flag para marcar si el token ya fue utilizado
- **Índices**: Optimizan búsquedas por token y expiración

**Seguridad**:
- Tokens únicos generados aleatoriamente
- Expiración automática
- Uso único (marcado como usado después del primer uso)
- Eliminación automática si se elimina el usuario

**Relaciones**:
- Referencia a: Usuarios
- CASCADE DELETE: Se elimina si se elimina el usuario

## Script de Creación Completo

```sql
CREATE DATABASE BD_SISTEMA_WEB_DAS;
USE BD_SISTEMA_WEB_DAS;

-- TABLA USUARIOS (con campo username añadido)
CREATE TABLE Usuarios (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE,
  contraseña_encriptada VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  direccion VARCHAR(255),
  rol ENUM('cliente', 'administrador', 'repartidor', 'vendedor') NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (id_usuario)
);

-- TABLA CATEGORIAS
CREATE TABLE Categorias (
  id_categoria INT NOT NULL AUTO_INCREMENT,
  nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  PRIMARY KEY (id_categoria)
);

-- TABLA PRODUCTOS
CREATE TABLE Productos (
  id_producto INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  id_categoria INT NOT NULL,
  imagen_url VARCHAR(255),
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  stock INT NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_producto),
  FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria)
);

-- TABLA OPCIONES DE PERSONALIZACIÓN (NUEVA)
CREATE TABLE opciones_personalizacion (
  id_opcion INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio_adicional DECIMAL(10, 2) NOT NULL,
  activa BOOLEAN DEFAULT TRUE,
  id_producto INT NOT NULL,
  PRIMARY KEY (id_opcion),
  FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- TABLA CUPONES
CREATE TABLE Cupones (
  id_cupon INT NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  tipo_descuento ENUM('porcentaje', 'monto_fijo') NOT NULL,
  valor_descuento DECIMAL(10, 2) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  cantidad_disponible INT,
  usos_maximos_por_usuario INT DEFAULT 1,
  monto_minimo_compra DECIMAL(10, 2) DEFAULT 0.00,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  creado_por_admin INT NOT NULL,
  PRIMARY KEY (id_cupon),
  FOREIGN KEY (creado_por_admin) REFERENCES Usuarios(id_usuario)
);

-- TABLA PEDIDOS
CREATE TABLE Pedidos (
  id_pedido INT NOT NULL AUTO_INCREMENT,
  id_cliente INT NOT NULL,
  fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado_pedido ENUM('pendiente', 'aceptado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  total_pedido DECIMAL(10, 2) NOT NULL,
  direccion_entrega VARCHAR(255) NOT NULL,
  notas_cliente TEXT,
  id_repartidor INT,
  id_cupon_aplicado INT,
  descuento_aplicado DECIMAL(10, 2) DEFAULT 0.00,
  metodo_pago ENUM('tarjeta', 'billetera_virtual', 'efectivo') NOT NULL,
  estado_pago ENUM('pendiente', 'pagado', 'fallido', 'reembolsado') NOT NULL DEFAULT 'pendiente',
  fecha_entrega DATETIME,
  problema_reportado TINYINT(1) DEFAULT 0,
  detalle_problema TEXT,
  fecha_problema DATETIME,
  PRIMARY KEY (id_pedido),
  FOREIGN KEY (id_cliente) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_repartidor) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_cupon_aplicado) REFERENCES Cupones(id_cupon)
);

-- TABLA DETALLE_PEDIDO (con campos de personalización añadidos)
CREATE TABLE Detalle_Pedido (
  id_detalle_pedido INT NOT NULL AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  notas_personalizacion TEXT,
  opciones_seleccionadas TEXT,
  precio_opciones DECIMAL(10, 2) DEFAULT 0.00,
  PRIMARY KEY (id_detalle_pedido),
  FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- TABLA PAGOS
CREATE TABLE Pagos (
  id_pago INT NOT NULL AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  metodo_pago ENUM('tarjeta', 'billetera_virtual', 'efectivo') NOT NULL,
  estado_transaccion ENUM('exitoso', 'fallido', 'pendiente') NOT NULL,
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  referencia_transaccion VARCHAR(255),
  PRIMARY KEY (id_pago),
  FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido)
);

-- TABLA REPORTES
CREATE TABLE Reportes (
  id_reporte INT NOT NULL AUTO_INCREMENT,
  nombre_reporte VARCHAR(100) NOT NULL,
  tipo_reporte ENUM('ventas', 'productos_vendidos', 'ganancias') NOT NULL,
  fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  generado_por_admin INT NOT NULL,
  fecha_inicio_param DATE,
  fecha_fin_param DATE,
  PRIMARY KEY (id_reporte),
  FOREIGN KEY (generado_por_admin) REFERENCES Usuarios(id_usuario)
);

-- TABLA HISTORIAL_ESTADO_PEDIDO
CREATE TABLE Historial_Estado_Pedido (
  id_historial INT NOT NULL AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  estado_anterior ENUM('pendiente', 'aceptado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado'),
  estado_nuevo ENUM('pendiente', 'aceptado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado') NOT NULL,
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cambiado_por_usuario INT,
  PRIMARY KEY (id_historial),
  FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (cambiado_por_usuario) REFERENCES Usuarios(id_usuario)
);

-- TABLA RESTRICCIONES_CUPON
CREATE TABLE Restricciones_Cupon (
  id_restriccion INT NOT NULL AUTO_INCREMENT,
  id_cupon INT NOT NULL,
  tipo_restriccion ENUM('producto', 'categoria') NOT NULL,
  id_referencia INT NOT NULL,
  PRIMARY KEY (id_restriccion),
  FOREIGN KEY (id_cupon) REFERENCES Cupones(id_cupon) ON DELETE CASCADE
);

-- TABLA CARRITO
CREATE TABLE Carrito (
  id_carrito INT NOT NULL AUTO_INCREMENT,
  id_cliente INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  notas_personalizacion TEXT,
  fecha_adicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_carrito),
  FOREIGN KEY (id_cliente) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES Productos(id_producto) ON DELETE CASCADE
);

-- TABLA TOKENS_RECUPERACION_CONTRASENA
CREATE TABLE tokens_recuperacion_contrasena (
  id_token INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion DATETIME NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id_token),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expiracion (fecha_expiracion)
);
```

## Datos de Ejemplo

### Usuarios de Prueba

```sql
-- INSERTAR USUARIOS DE PRUEBA
INSERT INTO usuarios (id_usuario, nombre, apellido, email, username, contraseña_encriptada, telefono, direccion, rol, fecha_registro, activo) 
VALUES
-- Administrador
(1, 'Administrador', 'General', 'admin.tienda@gmail.com', 'admin_general', 
 '$2a$10$ziusMzpRfckPip9uk3R9pu94cw.7.y54dEXR5FY2Jy3f.Q3IXK3CS', 
 '+51987123456', 'Oficina Central, Lima', 'administrador', '2025-10-08 11:44:03', TRUE),

-- Repartidor
(2, 'Diego', 'Mendoza', 'repartidor.tienda@gmail.com', 'diego_mendoza', 
 '$2a$10$3j0ez72HDyTKfLh7S4bqVeIeDnAmbyM9Z9BJd3Qv.BT1WQpQsiqPa', 
 '+51960815325', 'Av. Defensores del Morro 2765, Chorrillos, Lima', 'repartidor', '2025-10-19 02:01:13', TRUE),

-- Cliente
(3, 'Luis', 'Ruiz', 'cliente.tienda@gmail.com', 'luis_ruiz', 
 '$2a$10$tj8XtOr7veA1zVPf17FYlOS067q6Pl1IwdQuDeOfoalmLGio9u2tm', 
 '+5196173519', 'Av. Caminos del Inca 2882, Santiago de Surco', 'cliente', '2025-10-19 02:03:13', TRUE);
```

**⚠️ IMPORTANTE - Contraseñas de Prueba:**

Las contraseñas en la base de datos están encriptadas con BCrypt. Para hacer login con los usuarios de prueba, utiliza las siguientes contraseñas **sin encriptar**:

- **Administrador** (admin.tienda@gmail.com): `admin123`
- **Repartidor** (repartidor.tienda@gmail.com): `repartidor123`
- **Cliente** (cliente.tienda@gmail.com): `cliente123`

Estas contraseñas son válidas para el sistema de autenticación. Las versiones encriptadas en la base de datos no se pueden usar directamente para login.

### Categorías

```sql
-- INSERTAR CATEGORÍAS
INSERT INTO categorias (id_categoria, nombre_categoria, descripcion)
VALUES
(1, 'Comidas', 'Platos principales y hamburguesas'),
(2, 'Acompañamientos', 'Complementos de comidas'),
(3, 'Bebidas', 'Bebidas frías o calientes'),
(4, 'Postres', 'Dulces y postres variados'),
(5, 'Ensaladas', 'Ensaladas frescas y saludables');
```

### Productos

```sql
-- INSERTAR PRODUCTOS
INSERT INTO productos (id_producto, nombre, descripcion, precio, id_categoria, imagen_url, estado, stock) 
VALUES
(1, 'Hamburguesa Clásica', 'Doble carne, queso cheddar y salsa especial.', 15.00, 1, 
 'https://png.pngtree.com/png-vector/20240715/ourmid/pngtree-hamburger-png-image_13094305.png', 'activo', 50),
 
(2, 'Papas Fritas', 'Porción grande de papas crujientes y doradas.', 5.50, 2, 
 'https://static.vecteezy.com/system/resources/thumbnails/025/063/639/small/french-fries-with-ai-generated-free-png.png', 'activo', 50),
 
(3, 'Refresco Coca-Cola', 'Lata de 355ml.', 4.50, 3, 
 'https://static.vecteezy.com/system/resources/previews/036/573/453/non_2x/a-can-of-coca-cola-drink-isolated-free-png.png', 'activo', 50),
 
(4, 'Ensalada César', 'Fresca con pollo y aderezo césar.', 9.90, 5, 
 'https://png.pngtree.com/png-vector/20240510/ourmid/pngtree-veg-caesar-salad-png-image_12372147.png', 'activo', 50),
 
(5, 'Postre Brownie', 'Brownie con helado de vainilla.', 8.00, 4, 
 'https://www.nicepng.com/png/full/197-1973214_milk-shakes-brownie-brownie-con-helado-de-vainilla.png', 'activo', 50),
 
(6, 'Jugo de Naranja', 'Jugo natural de naranja.', 6.00, 3, 
 'https://png.pngtree.com/png-clipart/20250604/original/pngtree-orange-juice-png-image_21121883.png', 'activo', 50);
```

### Opciones de Personalización

```sql
-- OPCIONES PARA HAMBURGUESA CLÁSICA (id_producto = 1)
INSERT INTO opciones_personalizacion (nombre, descripcion, precio_adicional, activa, id_producto) 
VALUES
('Extra Queso', 'Añadir queso cheddar adicional', 2.50, TRUE, 1),
('Sin Cebolla', 'Preparar sin cebolla', 0.00, TRUE, 1),
('Extra Tocino', 'Añadir tocino extra', 3.00, TRUE, 1),
('Pan Integral', 'Cambiar a pan integral', 1.00, TRUE, 1),
('Doble Carne', 'Añadir una porción extra de carne', 4.00, TRUE, 1),
('Salsa Picante', 'Añadir salsa picante', 0.50, TRUE, 1);

-- OPCIONES PARA PAPAS FRITAS (id_producto = 2)
INSERT INTO opciones_personalizacion (nombre, descripcion, precio_adicional, activa, id_producto) 
VALUES
('Papas Grandes', 'Cambiar a porción grande', 2.00, TRUE, 2),
('Con Queso', 'Añadir queso derretido', 2.50, TRUE, 2),
('Con Salsa BBQ', 'Añadir salsa BBQ', 1.00, TRUE, 2),
('Sin Sal', 'Preparar sin sal', 0.00, TRUE, 2),
('Con Bacon', 'Añadir trozos de bacon', 3.00, TRUE, 2);

-- OPCIONES PARA REFRESCO COCA-COLA (id_producto = 3)
INSERT INTO opciones_personalizacion (nombre, descripcion, precio_adicional, activa, id_producto) 
VALUES
('Botella Grande', 'Cambiar a botella de 500ml', 2.00, TRUE, 3),
('Sin Hielo', 'Servir sin hielo', 0.00, TRUE, 3),
('Extra Frío', 'Servir muy frío', 0.00, TRUE, 3);

-- OPCIONES PARA ENSALADA CÉSAR (id_producto = 4)
INSERT INTO opciones_personalizacion (nombre, descripcion, precio_adicional, activa, id_producto) 
VALUES
('Extra Pollo', 'Añadir más pollo', 3.00, TRUE, 4),
('Sin Crutones', 'Preparar sin crutones', 0.00, TRUE, 4),
('Aderezo Extra', 'Añadir más aderezo césar', 1.50, TRUE, 4),
('Sin Queso', 'Preparar sin queso parmesano', 0.00, TRUE, 4),
('Con Palta', 'Añadir palta', 2.50, TRUE, 4);

-- OPCIONES PARA POSTRE BROWNIE (id_producto = 5)
INSERT INTO opciones_personalizacion (nombre, descripcion, precio_adicional, activa, id_producto) 
VALUES
('Helado Extra', 'Añadir más helado de vainilla', 2.00, TRUE, 5),
('Salsa de Chocolate', 'Añadir salsa de chocolate', 1.50, TRUE, 5),
('Sin Helado', 'Solo brownie', -1.00, TRUE, 5),
('Helado de Fresa', 'Cambiar helado a fresa', 0.50, TRUE, 5),
('Con Nuez', 'Añadir nueces', 1.00, TRUE, 5);
```

### Cupones de Prueba

```sql
-- INSERTAR CUPONES DE PRUEBA
INSERT INTO cupones (codigo, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, cantidad_disponible, usos_maximos_por_usuario, monto_minimo_compra, activa, creado_por_admin) 
VALUES
('BIENVENIDA10', 'porcentaje', 10.00, '2024-01-01', '2024-12-31', 100, 1, 20.00, TRUE, 1),
('DESCUENTO5', 'monto_fijo', 5.00, '2024-01-01', '2024-12-31', 50, 2, 15.00, TRUE, 1),
('CLIENTE20', 'porcentaje', 20.00, '2024-01-01', '2024-12-31', 25, 1, 30.00, TRUE, 1);
```

### Pedido de Prueba

```sql
-- INSERTAR PEDIDO DE PRUEBA (ID de cliente es 3)
INSERT INTO pedidos (id_cliente, estado_pedido, total_pedido, direccion_entrega, notas_cliente, metodo_pago, estado_pago) 
VALUES
(3, 'entregado', 25.50, 'Av. Caminos del Inca 2882, Santiago de Surco', 'Entregar en el portón principal', 'tarjeta', 'pagado');

-- INSERTAR DETALLE DEL PEDIDO DE PRUEBA
INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal, notas_personalizacion, opciones_seleccionadas, precio_opciones) 
VALUES
(1, 1, 1, 15.00, 15.00, 'Sin cebolla', '["Extra Queso", "Sin Cebolla"]', 2.50),
(1, 2, 1, 5.50, 5.50, '', '["Papas Grandes"]', 2.00),
(1, 3, 1, 4.50, 4.50, '', '["Botella Grande"]', 2.00);
```

## Características Especiales

### Sistema de Personalización
- Cada producto puede tener múltiples opciones de personalización
- Las opciones tienen precios adicionales configurables (pueden ser 0.00 o negativos para descuentos)
- Las opciones se almacenan en `opciones_seleccionadas` como JSON o texto
- El `precio_opciones` se calcula sumando los precios adicionales seleccionados
- El subtotal incluye: `(cantidad × precio_unitario) + (cantidad × precio_opciones)`

### Gestión por Username
- Campo `username` único y obligatorio
- Generado automáticamente durante el registro desde el email
- Usado en URLs amigables: `/mi-perfil/{username}`
- Permite búsqueda de usuarios por username o email

### Normalización de Teléfonos
- El sistema normaliza automáticamente los teléfonos con código de país +51 (Perú)
- Se almacena en formato: `+51999999999`
- Validación y normalización en backend y frontend

## Relaciones entre Tablas

```
Usuarios
  ├──→ Pedidos (id_cliente, id_repartidor)
  ├──→ Carrito (id_cliente)
  ├──→ Cupones (creado_por_admin)
  ├──→ Reportes (generado_por_admin)
  ├──→ Historial_Estado_Pedido (cambiado_por_usuario)
  └──→ tokens_recuperacion_contrasena

Categorias
  └──→ Productos (id_categoria)

Productos
  ├──→ Detalle_Pedido (id_producto)
  ├──→ Carrito (id_producto)
  └──→ opciones_personalizacion (id_producto)

Pedidos
  ├──→ Detalle_Pedido (id_pedido)
  ├──→ Pagos (id_pedido)
  └──→ Historial_Estado_Pedido (id_pedido)

Cupones
  ├──→ Pedidos (id_cupon_aplicado)
  └──→ Restricciones_Cupon (id_cupon)
```

## Consideraciones de Seguridad

1. **Encriptación**: Las contraseñas deben estar hasheadas con BCrypt
2. **Validación**: Todos los inputs deben ser validados antes de insertar
3. **Transacciones**: Usar transacciones para operaciones críticas
4. **Backup**: Realizar backups regulares de la base de datos
5. **Índices**: Los índices en tokens optimizan las búsquedas de recuperación
6. **CASCADE DELETE**: Usado cuidadosamente para mantener integridad referencial
7. **Normalización**: Teléfonos normalizados para consistencia

