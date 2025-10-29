# Sistema Web DAS

Sistema completo de gestión de pedidos y e-commerce desarrollado con **Angular 20** y **Spring Boot 3.5**, implementando arquitectura REST con autenticación JWT, integración de pagos con Stripe, notificaciones por WhatsApp y gestión multi-rol.

## Arquitectura General

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Angular 20    │ ◄─────────────► │  Spring Boot 3.5│
│   (Frontend)    │                 │   (Backend)     │
│  localhost:4200 │                 │  localhost:8089 │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │                                   │
    Bootstrap 5                        ┌─────────────┐
    Stripe.js                          │   MySQL 8.0 │
    RxJS                               │  (Database)  │
                                       └─────────────┘
                                               │
                                       ┌─────────────┐
                                       │   Twilio    │
                                       │ (WhatsApp)  │
                                       └─────────────┘
```

## Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|------------|---------|-----------|
| **Frontend** | Angular | 20.2.0 | Framework SPA |
| **UI Framework** | Bootstrap | 5.3.8 | Sistema de diseño |
| **Backend** | Spring Boot | 3.5.6 | Framework REST API |
| **Java** | OpenJDK | 21 | Runtime Environment |
| **Database** | MySQL | 8.0+ | Sistema de gestión de base de datos |
| **Autenticación** | JWT | 0.11.5 | Tokens de autenticación |
| **Pagos** | Stripe | 30.0.0 | Gateway de pagos |
| **Notificaciones** | Twilio | 10.6.3 | API de WhatsApp |
| **Email** | Gmail SMTP | - | Servicio de correo electrónico |

## Estructura de Base de Datos

El sistema utiliza MySQL con las siguientes tablas principales:

### Tablas Principales
- **Usuarios** - Gestión de usuarios con roles (cliente, administrador, repartidor, vendedor)
- **Productos** - Catálogo de productos con categorías
- **Opciones de Personalización** - Opciones personalizables por producto con precios adicionales
- **Pedidos** - Gestión completa de pedidos con estados
- **Detalle_Pedido** - Items de cada pedido con personalizaciones
- **Pagos** - Registro de transacciones de pago
- **Cupones** - Sistema de descuentos y promociones
- **Carrito** - Carrito de compras por cliente
- **Tokens de Recuperación** - Tokens para recuperación de contraseña

## Prerrequisitos

- **Java 21** o superior
- **Node.js 18** o superior
- **MySQL 8.0** o superior
- **Maven 3.6** o superior
- **Angular CLI 20** o superior

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/sistema-web-das.git
cd sistema-web-das
```

### 2. Configurar Base de Datos

Ejecutar el script SQL proporcionado para crear la base de datos y tablas:

```sql
CREATE DATABASE BD_SISTEMA_WEB_DAS;
USE BD_SISTEMA_WEB_DAS;
-- Ejecutar el script completo de creación de tablas
```

### 3. Configurar Backend

1. **Navegar al directorio del backend:**
   ```bash
   cd BACKEND
   ```

2. **Configurar variables de entorno:**
   - Crear archivo `.env` en el directorio `BACKEND`
   - Configurar las siguientes variables:

   ```env
   # Base de Datos
   DB_URL=jdbc:mysql://localhost:3306/BD_SISTEMA_WEB_DAS?serverTimezone=UTC
   DB_USERNAME=tu_usuario
   DB_PASSWORD=tu_password

   # JWT
   JWT_SECRET_KEY=tu-clave-secreta-super-segura
   JWT_EXPIRATION=86400000

   # Stripe
   STRIPE_SECRET_KEY=sk_test_tu_clave_stripe
   STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica

   # Twilio
   TWILIO_ACCOUNT_SID=tu_account_sid
   TWILIO_AUTH_TOKEN=tu_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

   # Gmail SMTP
   GMAIL_USERNAME=tu_email@gmail.com
   GMAIL_PASSWORD=tu_app_password
   ```

3. **Instalar dependencias y ejecutar:**
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

El backend estará disponible en: `http://localhost:8089`

### 4. Configurar Frontend

1. **Navegar al directorio del frontend:**
   ```bash
   cd FRONTEND
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   ng serve -o
   ```

El frontend estará disponible en: `http://localhost:4200`

## Configuración de Servicios Externos

### Stripe
1. Crear cuenta en [Stripe](https://stripe.com)
2. Obtener claves de prueba desde el Dashboard
3. Configurar `STRIPE_SECRET_KEY` y `STRIPE_PUBLISHABLE_KEY` en `.env`

### Gmail SMTP
1. Habilitar autenticación de 2 factores en tu cuenta Gmail
2. Generar contraseña de aplicación desde [Configuración de Google](https://myaccount.google.com/apppasswords)
3. Configurar `GMAIL_USERNAME` y `GMAIL_PASSWORD` en `.env`

### Twilio WhatsApp
1. Crear cuenta en [Twilio](https://www.twilio.com)
2. Configurar WhatsApp Sandbox
3. Obtener `ACCOUNT_SID` y `AUTH_TOKEN` desde el Dashboard
4. Configurar en `.env`

## Estructura del Proyecto

```
├── BACKEND/                
│   ├── src/main/java/      
│   │   └── com/web/capas/
│   │       ├── application/   # Capa de aplicación (servicios)
│   │       ├── domain/        # Capa de dominio (modelos, repositorios)
│   │       └── infrastructure/ # Capa de infraestructura (web, persistence)
│   ├── src/main/resources/   # Configuraciones y recursos
│   │   ├── application.properties
│   │   └── templates/        # Plantillas de email
│   ├── .env                  # Variables de entorno 
│   └── pom.xml               # Dependencias Maven
│
├── FRONTEND/              
│   ├── src/app/
│   │   ├── componentes/      # Componentes Angular
│   │   ├── guards/           # Guards de rutas
│   │   ├── modelos/          # Interfaces TypeScript
│   │   ├── servicios/        # Servicios Angular
│   │   └── app.routes.ts     # Configuración de rutas
│   ├── src/assets/           # Recursos estáticos
│   └── package.json          # Dependencias Node
│
└── README.md                 # Este archivo
```

## Funcionalidades Principales

### Para Clientes
- ✅ Registro e inicio de sesión con username único
- ✅ Catálogo de productos con filtros por categoría
- ✅ Personalización de productos con opciones y precios adicionales
- ✅ Carrito de compras persistente
- ✅ Proceso de checkout con múltiples métodos de pago (Tarjeta, Billetera Virtual, Efectivo)
- ✅ Integración con Stripe para pagos con tarjeta
- ✅ Seguimiento de pedidos en tiempo real
- ✅ Gestión de perfil personal (edición de datos, cambio de contraseña)
- ✅ Sistema de cupones y descuentos
- ✅ Estadísticas personales (pedidos realizados, total gastado)
- ✅ Teléfono normalizado automáticamente con código de país +51 (Perú)

### Para Administradores
- ✅ Dashboard con estadísticas generales
- ✅ Gestión completa de productos (CRUD)
- ✅ Gestión de opciones de personalización por producto
- ✅ Gestión de pedidos (visualización, cambio de estados)
- ✅ Gestión de usuarios (CRUD, cambio de roles, activación/desactivación)
- ✅ Sistema de cupones y promociones
- ✅ Notificaciones por WhatsApp para clientes
- ✅ Cambio de contraseña desde panel de administración

### Para Repartidores
- ✅ Dashboard de repartidor
- ✅ Visualización de pedidos asignados
- ✅ Actualización de estados de entrega
- ✅ Gestión de perfil personal

## Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_URL` | URL de conexión a MySQL | `jdbc:mysql://localhost:3306/BD_SISTEMA_WEB_DAS` |
| `DB_USERNAME` | Usuario de MySQL | `root` |
| `DB_PASSWORD` | Contraseña de MySQL | `tu_password` |
| `JWT_SECRET_KEY` | Clave secreta para JWT | `clave-super-secreta` |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe | `pk_test_...` |
| `TWILIO_ACCOUNT_SID` | SID de cuenta Twilio | `AC...` |
| `TWILIO_AUTH_TOKEN` | Token de autenticación Twilio | `token...` |
| `TWILIO_WHATSAPP_FROM` | Número de WhatsApp Twilio | `whatsapp:+14155238886` |
| `GMAIL_USERNAME` | Email para SMTP | `tu_email@gmail.com` |
| `GMAIL_PASSWORD` | Contraseña de aplicación Gmail | `app_password` |

## Comandos Útiles

### Backend

```bash
# Compilar proyecto
cd BACKEND
./mvnw clean compile

# Ejecutar aplicación
./mvnw spring-boot:run

# Ejecutar tests
./mvnw test

# Limpiar y compilar
./mvnw clean install
```

### Frontend

```bash
# Instalar dependencias
cd FRONTEND
npm install

# Ejecutar en desarrollo
ng serve

# Ejecutar y abrir navegador
ng serve -o

# Compilar para producción
ng build --configuration production

# Ejecutar tests
ng test
```

## Seguridad

- 🔐 Autenticación JWT con tokens de 24 horas
- 🔒 Encriptación de contraseñas con BCrypt
- 🛡️ Validación de datos en frontend y backend
- 🌐 CORS configurado para desarrollo y producción
- 🔑 Variables de entorno protegidas (no versionadas)
- 👮 Guards de autenticación por rol
- ✅ Normalización de teléfonos con código de país

## Características Especiales

### Personalización de Productos
- Sistema tipo Rappi para personalizar productos
- Opciones por defecto configurables por producto
- Precios adicionales que afectan el precio final
- Soporte para múltiples opciones seleccionables

### Gestión de Usuarios por Username
- URLs amigables con username: `/mi-perfil/{username}`
- Generación automática de username único durante el registro
- Búsqueda de usuarios por username o email

### Normalización de Teléfonos
- Automático para código de país +51 (Perú)
- Validación y formato consistente
- Integración en registro y edición de perfil

## Base de Datos

### Estructura Completa

Ver el script SQL completo para la estructura de todas las tablas. El esquema incluye:

- **Usuarios** con campo `username` único
- **Opciones de personalización** vinculadas a productos
- **Detalle de pedidos** con campos para opciones seleccionadas y precios
- **Sistema completo de cupones** con restricciones
- **Historial de estados de pedidos**
- **Tokens de recuperación de contraseña**

### Datos de Prueba

El script incluye:
- 3 usuarios de prueba (admin, repartidor, cliente)
- 5 categorías de productos
- 6 productos de ejemplo
- Opciones de personalización por producto
- 3 cupones de prueba
- 1 pedido de ejemplo

## Documentación Adicional

- Ver `BACKEND/README.md` para detalles del backend
- Ver `FRONTEND/README.md` para detalles del frontend
- Ver `DATABASE_README.md` para documentación completa de la base de datos

## Soporte y Resolución de Problemas

### Problemas Comunes

1. **Error de conexión a la base de datos:**
   - Verificar que MySQL esté ejecutándose
   - Revisar credenciales en `.env`
   - Confirmar que la base de datos existe

2. **Error de CORS:**
   - Verificar configuración en `AppConfig.java`
   - Confirmar que el frontend esté en `localhost:4200`

3. **Error de autenticación:**
   - Verificar que el token JWT esté configurado
   - Revisar expiración del token
   - Confirmar que el usuario esté activo

4. **Pagos con Stripe no funcionan:**
   - Verificar claves de API en `.env`
   - Confirmar que las claves sean de modo test
   - Revisar logs del backend para errores

## Licencia

Este proyecto está en desarrollo y creación continua.

## Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.
