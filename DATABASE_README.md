# DATABASE README - Sistema Web DAS

Documentación completa de la base de datos `BD_SISTEMA_WEB_DAS` para el sistema de e-commerce.

## Descripción General

La base de datos está diseñada para gestionar un sistema completo de e-commerce con funcionalidades de:
- Gestión multi-rol de usuarios
- Catálogo de productos con categorías
- Sistema de pedidos con seguimiento de estados
- Procesamiento de pagos
- Sistema de cupones y descuentos
- Carrito de compras
- Reportes y auditoría

## Tablas del Sistema

### 1. Usuarios
**Propósito**: Gestiona todos los usuarios del sistema con diferentes roles.

```sql
CREATE TABLE Usuarios (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
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
- `rol`: Define el tipo de usuario (cliente, administrador, repartidor, vendedor)
- `activo`: Controla si el usuario puede acceder al sistema
- `email`: Único para evitar duplicados
- `contraseña_encriptada`: Almacena la contraseña hasheada con BCrypt

**Relaciones**:
- Referenciada por: Pedidos, Carrito, Cupones, Reportes, Historial_Estado_Pedido

### 2. Categorias
**Propósito**: Organiza los productos en categorías para facilitar la navegación.

```sql
CREATE TABLE Categorias (
  id_categoria INT NOT NULL AUTO_INCREMENT,
  nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  PRIMARY KEY (id_categoria)
);
```

**Campos importantes**:
- `nombre_categoria`: Nombre único de la categoría
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
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_producto),
  FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria)
);
```

**Campos importantes**:
- `estado`: Controla si el producto aparece en el menú
- `precio`: Precio con 2 decimales de precisión
- `imagen_url`: URL de la imagen del producto
- `ultima_actualizacion`: Se actualiza automáticamente al modificar

**Relaciones**:
- Referencia a: Categorias
- Referenciada por: Detalle_Pedido, Carrito

### 4. Pedidos
**Propósito**: Gestiona los pedidos realizados por los clientes.

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
  PRIMARY KEY (id_pedido),
  FOREIGN KEY (id_cliente) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_repartidor) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_cupon_aplicado) REFERENCES Cupones(id_cupon)
);
```

**Campos importantes**:
- `estado_pedido`: Flujo de estados del pedido
- `estado_pago`: Estado del pago independiente del pedido
- `id_repartidor`: Asignación de repartidor (puede ser NULL)
- `descuento_aplicado`: Descuento aplicado por cupón

**Relaciones**:
- Referencia a: Usuarios (cliente y repartidor), Cupones
- Referenciada por: Detalle_Pedido, Pagos, Historial_Estado_Pedido

### 5. Detalle_Pedido
**Propósito**: Almacena los productos específicos de cada pedido.

```sql
CREATE TABLE Detalle_Pedido (
  id_detalle_pedido INT NOT NULL AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  notas_personalizacion TEXT,
  PRIMARY KEY (id_detalle_pedido),
  FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);
```

**Campos importantes**:
- `precio_unitario`: Precio al momento del pedido (puede cambiar)
- `subtotal`: Cantidad × precio_unitario
- `notas_personalizacion`: Especificaciones especiales del cliente

**Relaciones**:
- Referencia a: Pedidos, Productos
- CASCADE DELETE: Si se elimina un pedido, se eliminan sus detalles

### 6. Pagos
**Propósito**: Registra las transacciones de pago de los pedidos.

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
- `referencia_transaccion`: ID de la transacción del gateway de pago
- `estado_transaccion`: Estado de la transacción
- `monto`: Monto exacto pagado

**Relaciones**:
- Referencia a: Pedidos

### 7. Cupones
**Propósito**: Sistema de descuentos y promociones.

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
- `tipo_descuento`: Porcentaje o monto fijo
- `cantidad_disponible`: Límite de usos totales
- `usos_maximos_por_usuario`: Límite por usuario
- `monto_minimo_compra`: Compra mínima requerida

**Relaciones**:
- Referencia a: Usuarios (admin que lo creó)
- Referenciada por: Pedidos, Restricciones_Cupon

### 8. Carrito
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
- `notas_personalizacion`: Especificaciones del cliente
- CASCADE DELETE: Se elimina si se elimina usuario o producto

**Relaciones**:
- Referencia a: Usuarios, Productos

### 9. Reportes
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
- `fecha_inicio_param` y `fecha_fin_param`: Parámetros de fecha del reporte

**Relaciones**:
- Referencia a: Usuarios (admin que generó el reporte)

### 10. Historial_Estado_Pedido
**Propósito**: Auditoría de cambios de estado en pedidos.

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
- `estado_anterior`: Estado previo al cambio
- `estado_nuevo`: Nuevo estado
- `cambiado_por_usuario`: Quién realizó el cambio

**Relaciones**:
- Referencia a: Pedidos, Usuarios

### 11. Restricciones_Cupon
**Propósito**: Restricciones específicas para cupones (productos o categorías).

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
- `tipo_restriccion`: Si aplica a producto específico o categoría
- `id_referencia`: ID del producto o categoría

**Relaciones**:
- Referencia a: Cupones

### 12. tokens_recuperacion_contrasena
**Propósito**: Tokens para recuperación de contraseñas.

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
- `token`: Token único para recuperación
- `fecha_expiracion`: Expiración del token
- `usado`: Si el token ya fue utilizado
- Índices para optimizar búsquedas

**Relaciones**:
- Referencia a: Usuarios

## Script de Creación Completo

```sql
-- Crear base de datos
CREATE DATABASE BD_SISTEMA_WEB_DAS;
USE BD_SISTEMA_WEB_DAS;

-- Desactivar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Tabla de Usuarios
CREATE TABLE Usuarios (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contraseña_encriptada VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  direccion VARCHAR(255),
  rol ENUM('cliente', 'administrador', 'repartidor', 'vendedor') NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (id_usuario)
);

-- Tabla de Categorías
CREATE TABLE Categorias (
  id_categoria INT NOT NULL AUTO_INCREMENT,
  nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  PRIMARY KEY (id_categoria)
);

-- Tabla de Productos
CREATE TABLE Productos (
  id_producto INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  id_categoria INT NOT NULL,
  imagen_url VARCHAR(255),
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_producto),
  FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria)
);

-- Tabla de Cupones
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

-- Tabla de Pedidos
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
  PRIMARY KEY (id_pedido),
  FOREIGN KEY (id_cliente) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_repartidor) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_cupon_aplicado) REFERENCES Cupones(id_cupon)
);

-- Tabla de Detalle de Pedidos
CREATE TABLE Detalle_Pedido (
  id_detalle_pedido INT NOT NULL AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  notas_personalizacion TEXT,
  PRIMARY KEY (id_detalle_pedido),
  FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- Tabla de Pagos
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

-- Tabla de Reportes
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

-- Tabla de Historial de Estados
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

-- Tabla de Restricciones de Cupones
CREATE TABLE Restricciones_Cupon (
  id_restriccion INT NOT NULL AUTO_INCREMENT,
  id_cupon INT NOT NULL,
  tipo_restriccion ENUM('producto', 'categoria') NOT NULL,
  id_referencia INT NOT NULL,
  PRIMARY KEY (id_restriccion),
  FOREIGN KEY (id_cupon) REFERENCES Cupones(id_cupon) ON DELETE CASCADE
);

-- Tabla de Carrito
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

-- Tabla de Tokens de Recuperación
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

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;
```

## Datos de Ejemplo

```sql
-- Insertar usuarios de ejemplo
-- NOTA: Las contraseñas están encriptadas con BCrypt. Las contraseñas reales son:
-- - Administrador: admin123
-- - Repartidor: repartidor123  
-- - Cliente: cliente123
INSERT INTO usuarios (id_usuario, nombre, apellido, email, contraseña_encriptada, telefono, direccion, rol, fecha_registro, activo)
VALUES
(1, 'Administrador', 'General', 'admin.tienda@gmail.com', '$2a$10$ziusMzpRfckPip9uk3R9pu94cw.7.y54dEXR5FY2Jy3f.Q3IXK3CS', '987123456', 'Oficina Central, Lima', 'administrador', '2025-10-08 11:44:03', TRUE),
(2, 'Diego', 'Mendoza', 'repartidor.tienda@gmail.com', '$2a$10$4tLBaTJNdNCDscGPICsZZeULmFpHBk1ECID9JfTCUrcYsnb4lcX5m', '960815325', 'Av. Defensores del Morro 2765, Chorrillos, Lima', 'repartidor', '2025-10-19 02:01:13', TRUE),
(3, 'Luis', 'Ruiz', 'cliente.tienda@gmail.com', '$2a$10$JASawiIiJKBDUt18J8AFVu1egepDaifCbv8zt18rTbUn9M53WoDaO', '96173519', 'Av. Caminos del Inca 2882, Santiago de Surco', 'cliente', '2025-10-19 02:03:13', TRUE);

-- Insertar categorías
INSERT INTO categorias (id_categoria, nombre_categoria, descripcion)
VALUES
(1, 'Comidas', 'Platos principales'),
(2, 'Acompañamientos', 'Complementos de comidas'),
(3, 'Bebidas', 'Bebidas frías o calientes'),
(4, 'Postres', 'Dulces y postres variados'),
(5, 'Ensaladas', 'Ensaladas frescas');

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, id_categoria, imagen_url, estado)
VALUES
('Hamburguesa Clásica', 'Doble carne, queso cheddar y salsa especial.', 15.00, 1, 'https://png.pngtree.com/png-vector/20240715/ourmid/pngtree-hamburger-png-image_13094305.png', 'activo'),
('Papas Fritas', 'Porción grande de papas crujientes y doradas.', 5.50, 2, 'https://static.vecteezy.com/system/resources/thumbnails/025/063/639/small/french-fries-with-ai-generated-free-png.png', 'activo'),
('Refresco Coca-Cola', 'Lata de 355ml.', 4.50, 3, 'https://static.vecteezy.com/system/resources/previews/036/573/453/non_2x/a-can-of-coca-cola-drink-isolated-free-png.png', 'activo'),
('Ensalada César', 'Fresca con pollo y aderezo césar.', 9.90, 5, 'https://png.pngtree.com/png-vector/20240510/ourmid/pngtree-veg-caesar-salad-png-image_12372147.png', 'activo'),
('Postre Brownie', 'Brownie con helado de vainilla.', 8.00, 4, 'https://www.nicepng.com/png/full/197-1973214_milk-shakes-brownie-brownie-con-helado-de-vainilla.png', 'activo');
```

## Consideraciones de Seguridad

1. **Encriptación**: Las contraseñas deben estar hasheadas con BCrypt
2. **Validación**: Todos los inputs deben ser validados antes de insertar
3. **Transacciones**: Usar transacciones para operaciones críticas
4. **Backup**: Realizar backups regulares de la base de datos

