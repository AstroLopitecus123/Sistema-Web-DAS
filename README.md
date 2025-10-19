# GENERAL README - Sistema Web DAS

Sistema desarrollado con **Angular 20** (frontend) y **Spring Boot 3.5** (backend), implementando arquitectura REST con autenticación JWT, pagos con Stripe, notificaciones WhatsApp y gestión multi-rol.

## Arquitectura

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Angular 20    │ ◄─────────────► │  Spring Boot 3.5│
│   (Frontend)    │                 │   (Backend)     │
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
| **Frontend** | Angular | 20.2.0 | SPA Framework |
| **UI** | Bootstrap | 5.3.8 | CSS Framework |
| **Backend** | Spring Boot | 3.5.6 | REST API |
| **Java** | OpenJDK | 21 | Runtime |
| **Database** | MySQL | 8.0+ | Persistencia |
| **Auth** | JWT | 0.11.5 | Autenticación |
| **Pagos** | Stripe | 30.0.0 | Gateway de pago |
| **Notificaciones** | Twilio | 10.6.3 | WhatsApp API |

## Prerrequisitos

- **Java 21** o superior
- **Node.js 18** o superior
- **MySQL 8.0** o superior
- **Maven 3.6** o superior
- **Angular CLI 20** o superior

## Instalación

### 1. Clonar el repositorio
```
git clone https://github.com/tu-usuario/sistema-web-das.git
cd sistema-web-das
```

### 2. Configurar Base de Datos
```
CREATE DATABASE BD_SISTEMA_WEB_DAS;
```

### 3. Configurar Backend

1. **Copiar archivo de configuración:**
   ```
   cp .env.example .env
   ```

2. **Editar `.env` con tus credenciales:**
   ```
   DB_URL=jdbc:mysql://localhost:3306/BD_SISTEMA_WEB_DAS?serverTimezone=UTC
   DB_USERNAME=tu_usuario
   DB_PASSWORD=tu_password
   STRIPE_SECRET_KEY=sk_test_tu_clave_stripe
   # ... otras variables
   ```

3. **Instalar dependencias y ejecutar:**
   ```
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

El backend estará disponible en: `http://localhost:8089`

### 4. Configurar Frontend

1. **Instalar dependencias:**
   ```
   npm install
   ```

2. **Ejecutar en modo desarrollo:**
   ```
   ng serve
   ```

El frontend estará disponible en: `http://localhost:4200`

## Configuración de Servicios

### Stripe
1. Crear cuenta en [Stripe](https://stripe.com)
2. Obtener claves de prueba
3. Configurar en `.env`

### Gmail SMTP
1. Habilitar autenticación de 2 factores
2. Generar contraseña de aplicación
3. Configurar en `.env`

### Twilio WhatsApp
1. Crear cuenta en [Twilio](https://twilio.com)
2. Configurar WhatsApp Sandbox
3. Obtener credenciales y configurar en `.env`

## Estructura del Proyecto

```
├── BACKEND/                
│   ├── src/main/java/      # Código Java
│   ├── src/main/resources/ # Configuraciones
│   ├── .env.example        # Variables de entorno ejemplo
│   └── pom.xml            # Dependencias Maven
├── FRONTEND/              
│   ├── src/app/           # Código Angular
│   ├── src/assets/        # Recursos estáticos
│   └── package.json       # Dependencias Node
├── DATABASE_README.md     # Documentación de la base de datos
└── README.md              # Este archivo
```

## Variables de Entorno

Copia `.env.example` a `.env` y configura:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_URL` | URL de la base de datos | `jdbc:mysql://localhost:3306/BD_SISTEMA_WEB_DAS` |
| `DB_USERNAME` | Usuario de MySQL | `root` |
| `DB_PASSWORD` | Contraseña de MySQL | `tu_password` |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | `sk_test_...` |
| `GMAIL_USERNAME` | Email para SMTP | `tu_email@gmail.com` |
| `GMAIL_PASSWORD` | Contraseña de aplicación | `tu_app_password` |
| `TWILIO_ACCOUNT_SID` | SID de Twilio | `AC...` |
| `TWILIO_AUTH_TOKEN` | Token de Twilio | `tu_token` |

## Comandos Útiles

### Backend
```
# Compilar
./mvnw clean compile

# Ejecutar
./mvnw spring-boot:run

# Ejecutar tests
./mvnw test
```

### Frontend
```
# Instalar dependencias
npm install

# Ejecutar en desarrollo
ng serve

# Compilar para producción
ng build --configuration production

# Ejecutar tests
ng test
```

## Funcionalidades

### Para Clientes
- Registro e inicio de sesión
- Catálogo de productos con filtros
- Carrito de compras
- Proceso de checkout con Stripe
- Seguimiento de pedidos
- Gestión de perfil
- Sistema de cupones

### Para Administradores
- Dashboard con estadísticas
- Gestión de productos
- Gestión de pedidos
- Gestión de usuarios
- Notificaciones por WhatsApp

### Para Repartidores
- Dashboard de repartidor
- Gestión de entregas
- Actualización de estados

## Seguridad

- Autenticación JWT
- Encriptación de contraseñas con BCrypt
- Validación de datos en frontend y backend
- CORS configurado
- Variables de entorno protegidas

## Soporte

Si tienes problemas:

1. Verifica que todos los prerrequisitos estén instalados
2. Revisa que las variables de entorno estén configuradas
3. Asegúrate de que la base de datos esté ejecutándose
4. Revisa los logs del backend para errores

## Licencia

Este proyecto esta en creación

