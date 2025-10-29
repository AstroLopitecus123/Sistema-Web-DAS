# Backend - Sistema Web DAS

Backend desarrollado con **Spring Boot 3.5.6** implementando arquitectura por capas (Domain, Application, Infrastructure), autenticación JWT, integración con servicios externos (Stripe, Twilio, Gmail SMTP) y gestión completa de e-commerce.

## Arquitectura del Backend

```
┌─────────────────────────────────────────────────────────────┐
│                    SPRING BOOT APPLICATION                  │
├─────────────────────────────────────────────────────────────┤
│  Controllers Layer    │  @RestController, @RequestMapping  │
│  (Infrastructure/Web)                                         │
├─────────────────────────────────────────────────────────────┤
│  Service Layer        │  @Service, @Transactional          │
│  (Application)                                               │
├─────────────────────────────────────────────────────────────┤
│  Repository Layer    │  @Repository, JPA Repositories       │
│  (Domain/Infrastructure)                                     │
├─────────────────────────────────────────────────────────────┤
│  Entity Layer        │  @Entity, @Table, JPA Annotations   │
│  (Infrastructure/Persistence)                                │
├─────────────────────────────────────────────────────────────┤
│  Security Layer      │  JWT, BCrypt, CORS, SecurityConfig  │
│  (Infrastructure)                                            │
├─────────────────────────────────────────────────────────────┤
│  External Services   │  Stripe, Twilio, Gmail SMTP          │
│  (Application/Infrastructure)                               │
└─────────────────────────────────────────────────────────────┘
```

## Stack Tecnológico

| Componente | Tecnología | Versión | Anotaciones Principales |
|------------|------------|---------|-------------------------|
| **Framework** | Spring Boot | 3.5.6 | `@SpringBootApplication` |
| **Security** | Spring Security | 6.x | `@EnableWebSecurity` |
| **JWT** | JJWT | 0.11.5 | `@Component`, `@Service` |
| **Database** | Spring Data JPA | 3.x | `@Repository`, `@Entity` |
| **Database Driver** | MySQL Connector | 8.0+ | `@Table`, `@Column` |
| **Pagos** | Stripe Java | 30.0.0 | `@Service`, `@Value` |
| **Notificaciones** | Twilio SDK | 10.6.3 | `@Service` |
| **Email** | JavaMail | 6.x | `@Service`, `@Configuration` |
| **Config** | dotenv-java | 3.0.0 | `@Value`, `@Configuration` |
| **Java** | OpenJDK | 21 | - |

## Estructura de Capas

### Capa de Dominio (`domain/`)
- **Modelos de Dominio** - Entidades de negocio
- **Repositorios** - Interfaces de acceso a datos
- **DTOs** - Objetos de transferencia de datos
- **Enums** - Estados y tipos del sistema
- **Excepciones** - Excepciones de dominio

### Capa de Aplicación (`application/`)
- **Servicios** - Lógica de negocio e implementaciones
- **Interfaces de Servicio** - Contratos de servicios

### Capa de Infraestructura (`infrastructure/`)
- **Web** - Controladores REST
- **Persistence** - Entidades JPA y repositorios
- **Config** - Configuraciones de seguridad y servicios externos

## Prerrequisitos

- Java 21 o superior
- MySQL 8.0 o superior
- Maven 3.6 o superior

## Configuración

### 1. Base de Datos

Crear la base de datos y ejecutar el script SQL:

```sql
CREATE DATABASE BD_SISTEMA_WEB_DAS;
USE BD_SISTEMA_WEB_DAS;
-- Ejecutar script completo de creación de tablas
```

### 2. Variables de Entorno

Crear archivo `.env` en el directorio `BACKEND/`:

```env
# Base de Datos
DB_URL=jdbc:mysql://localhost:3306/BD_SISTEMA_WEB_DAS?serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=tu_password

# JWT
JWT_SECRET_KEY=tu-clave-secreta-super-segura
JWT_EXPIRATION=86400000

# Stripe
STRIPE_SECRET_KEY=sk_test_tu_clave_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=tu_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Gmail SMTP
GMAIL_USERNAME=tu_email@gmail.com
GMAIL_PASSWORD=tu_app_password

# Servidor
SERVER_PORT=8089
```

### 3. Ejecutar la Aplicación

```bash
# Compilar
./mvnw clean install

# Ejecutar
./mvnw spring-boot:run

# O especificar la clase principal
./mvnw spring-boot:run -Dspring-boot.run.main-class=com.web.capas.BackendSistemaWebDasApplication
```

La API estará disponible en: `http://localhost:8089`

## API Endpoints Principales

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/registro` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/recuperar-contrasena` | Solicitar recuperación | No |
| POST | `/api/auth/restablecer-contrasena` | Restablecer contraseña | No |
| POST | `/api/auth/cambiar-contrasena` | Cambiar contraseña | Sí |
| GET | `/api/auth/verificar-email` | Verificar si email existe | No |

### Productos (`/api/v1/menu`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/menu/productos` | Obtener todos los productos | No |
| GET | `/api/v1/menu/categorias` | Obtener todas las categorías | No |
| GET | `/api/v1/menu/productos/{id}/opciones` | Opciones de personalización | No |

### Pedidos (`/api/v1/pedidos`)

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| POST | `/api/v1/pedidos` | Crear nuevo pedido | Sí | Cliente |
| GET | `/api/v1/pedidos/usuario/{id}` | Pedidos del usuario | Sí | Cliente |
| GET | `/api/v1/pedidos/{id}` | Obtener pedido por ID | Sí | - |

### Pagos (`/api/v1/pagos`)

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| POST | `/api/v1/pagos/crear-intent` | Crear PaymentIntent Stripe | Sí | Cliente |
| POST | `/api/v1/pagos/confirmar/{id}` | Confirmar pago de Stripe | Sí | Cliente |
| POST | `/api/v1/pagos/confirmar-manual/{idPedido}` | Confirmar pago manual | Sí | Cliente |
| GET | `/api/v1/pagos/estado/{referencia}` | Estado de pago | Sí | - |

### Perfil de Usuario (`/api/v1/usuarios`)

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| GET | `/api/v1/usuarios/{id}` | Obtener perfil por ID | Sí | - |
| GET | `/api/v1/usuarios/username/{username}` | Obtener perfil por username | Sí | - |
| PUT | `/api/v1/usuarios/perfil/{id}` | Actualizar perfil | Sí | Propietario |
| DELETE | `/api/v1/usuarios/{id}` | Eliminar cuenta | Sí | Propietario |
| GET | `/api/v1/usuarios/estadisticas/{id}` | Estadísticas del usuario | Sí | Cliente |

### Administración (`/api/admin/usuarios`)

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| GET | `/api/admin/usuarios` | Listar todos los usuarios | Sí | Admin |
| GET | `/api/admin/usuarios/{id}` | Obtener usuario por ID | Sí | Admin |
| PUT | `/api/admin/usuarios/{id}/rol` | Cambiar rol de usuario | Sí | Admin |
| PUT | `/api/admin/usuarios/{id}/estado` | Activar/desactivar usuario | Sí | Admin |
| DELETE | `/api/admin/usuarios/{id}/seguro` | Eliminar usuario seguro | Sí | Admin |
| GET | `/api/admin/usuarios/estadisticas` | Estadísticas generales | Sí | Admin |

## Modelos de Datos Principales

### Usuario
```java
@Entity
@Table(name = "Usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idUsuario;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Enumerated(EnumType.STRING)
    private Rol rol; // cliente, administrador, repartidor, vendedor
    
    private String telefono; // Normalizado con +51
    // ... otros campos
}
```

### Producto
```java
@Entity
@Table(name = "Productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idProducto;
    
    private String nombre;
    private BigDecimal precio;
    
    @ManyToOne
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;
    
    @Enumerated(EnumType.STRING)
    private EstadoProducto estado; // activo, inactivo
    // ... otros campos
}
```

### Pedido
```java
@Entity
@Table(name = "Pedidos")
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPedido;
    
    @ManyToOne
    @JoinColumn(name = "id_cliente")
    private Usuario cliente;
    
    @Enumerated(EnumType.STRING)
    private EstadoPedido estadoPedido; // pendiente, aceptado, en_preparacion, etc.
    
    @Enumerated(EnumType.STRING)
    private MetodoPago metodoPago; // tarjeta, billetera_virtual, efectivo
    
    private BigDecimal totalPedido;
    // ... otros campos
}
```

## Servicios Principales

### UsuarioService
- Registro de usuarios con generación automática de username
- Autenticación y validación de credenciales
- Gestión de perfiles con normalización de teléfonos (+51)
- Recuperación y cambio de contraseñas
- Validación de existencia de email y username

### ProductoService
- Gestión de catálogo de productos
- Filtrado por categoría y estado
- Búsqueda de productos
- Gestión de opciones de personalización

### PedidoService
- Creación de pedidos con validaciones
- Gestión de estados de pedidos
- Cálculo de totales con personalizaciones
- Integración con sistema de pagos

### PagoService
- Integración con Stripe para pagos con tarjeta
- Confirmación de pagos manuales (billetera virtual, efectivo)
- Gestión de estados de transacciones
- Notificaciones automáticas por WhatsApp

### WhatsAppService
- Notificación de confirmación de pedido
- Notificación de pedido en camino
- Notificación de pedido entregado
- Notificación de pedido cancelado

### EmailService
- Envío de emails de recuperación de contraseña
- Plantillas HTML para correos
- Configuración SMTP con Gmail

## Seguridad

### Configuración JWT
- Tokens con expiración de 24 horas
- Firmado con clave secreta configurable
- Validación en cada request autenticado
- Claims incluyen ID de usuario y rol

### Spring Security
- Configuración CORS para desarrollo
- Filtros de autenticación JWT
- Protección de rutas por rol
- Deshabilitación de CSRF (API REST)

### Encriptación
- Contraseñas encriptadas con BCrypt
- Normalización automática de teléfonos
- Validación de datos de entrada

## Integraciones Externas

### Stripe
- Creación de PaymentIntent
- Confirmación de pagos con tarjeta
- Manejo de estados de pago
- Webhooks (opcional)

### Twilio WhatsApp
- Integración con WhatsApp API
- Mensajes automáticos de confirmación
- Notificaciones de cambios de estado
- Mensajes personalizados

### Gmail SMTP
- Configuración SMTP
- Envío de emails HTML
- Plantillas personalizadas
- Recuperación de contraseña por email

## Base de Datos

### Tablas Principales
- `Usuarios` - Usuarios con username único
- `Productos` - Catálogo de productos
- `Categorias` - Categorías de productos
- `opciones_personalizacion` - Opciones personalizables
- `Pedidos` - Pedidos realizados
- `Detalle_Pedido` - Items de pedidos con personalizaciones
- `Pagos` - Transacciones de pago
- `Cupones` - Sistema de descuentos
- `Carrito` - Carrito de compras
- `tokens_recuperacion_contrasena` - Tokens de recuperación

### Características
- Normalización automática de teléfonos con +51
- Username único por usuario
- Precios con DECIMAL(10,2) para precisión
- Estados con ENUM para validación
- Foreign keys para integridad referencial

## Logs y Monitoreo

Los logs se muestran en consola con diferentes niveles:
- `INFO` - Información general de operaciones
- `WARN` - Advertencias y casos no críticos
- `ERROR` - Errores que requieren atención

## Comandos Útiles

```bash
# Compilar proyecto
./mvnw clean compile

# Ejecutar aplicación
./mvnw spring-boot:run

# Ejecutar tests
./mvnw test

# Compilar y empaquetar
./mvnw clean package

# Limpiar proyecto
./mvnw clean
```

## Configuración Avanzada

### Puerto del Servidor
Por defecto: `8089`
Configurar en `.env`: `SERVER_PORT=8089`

### CORS
Configurado para permitir:
- `http://localhost:4200` (Frontend desarrollo)
- Configurable en `AppConfig.java`

### JWT
- Clave secreta configurable en `.env`: `JWT_SECRET_KEY`
- Expiración configurable: `JWT_EXPIRATION` (ms)
- Por defecto: 24 horas (86400000 ms)

### Base de Datos
- Tipo: MySQL 8.0+
- Timezone: UTC

## Validaciones y Reglas de Negocio

### Registro de Usuarios
- Email único obligatorio
- Username generado automáticamente (único)
- Contraseña mínimo 6 caracteres
- Teléfono normalizado a +51 si está presente

### Pedidos
- Validación de stock disponible
- Validación de método de pago
- Cálculo automático de totales con personalizaciones
- Estados válidos según flujo de negocio

### Pagos
- Validación de métodos de pago
- Integración con Stripe para tarjetas
- Confirmación manual para efectivo/billetera virtual
- Notificaciones automáticas
