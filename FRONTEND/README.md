# Frontend - Sistema Web DAS

Frontend desarrollado con **Angular 20** implementando arquitectura de componentes standalone, integración con APIs REST, y servicios externos para e-commerce completo.

## Arquitectura del Frontend

```
┌─────────────────────────────────────────────────────────────┐
│                    ANGULAR APPLICATION                      │
├─────────────────────────────────────────────────────────────┤
│  Components Layer    │  @Component, standalone, @Input     │
│  (Presentación)                                             │
├─────────────────────────────────────────────────────────────┤
│  Services Layer      │  @Injectable, HTTP Client           │
│  (Lógica de negocio)                                        │
├─────────────────────────────────────────────────────────────┤
│  Guards Layer        │  @Injectable, CanActivate          │
│  (Protección de rutas)                                      │
├─────────────────────────────────────────────────────────────┤
│  Models Layer        │  Interfaces, TypeScript Types       │
│  (Tipos de datos)                                           │
├─────────────────────────────────────────────────────────────┤
│  Routing Layer       │  Routes, Guards, Lazy Loading       │
│  (Navegación)                                               │
├─────────────────────────────────────────────────────────────┤
│  External Services   │  Stripe.js, Bootstrap, RxJS         │
│  (Integraciones)                                             │
└─────────────────────────────────────────────────────────────┘
```

## Stack Tecnológico

| Componente | Tecnología | Versión | Decoradores Principales |
|------------|------------|---------|-------------------------|
| **Framework** | Angular | 20.2.0 | `@Component`, `@Injectable` |
| **UI Framework** | Bootstrap | 5.3.8 | CSS Classes, Grid System |
| **Language** | TypeScript | 5.9.2 | `interface`, `type`, `enum` |
| **Reactive** | RxJS | 7.8.0 | `Observable`, `Subject`, `BehaviorSubject` |
| **HTTP** | Angular HTTP | 20.2.0 | `HttpClient`, `HttpInterceptor` |
| **Routing** | Angular Router | 20.2.0 | `Routes`, `CanActivate` |
| **Forms** | Angular Forms | 20.2.0 | `FormsModule`, `ngModel` |
| **Pagos** | Stripe.js | 8.0.0 | `loadStripe`, `StripeElements` |
| **Notificaciones Push** | OneSignal SDK | 16.x | `OneSignal.init`, `OneSignal.User` |

## Prerrequisitos

- Node.js 18 o superior
- Angular CLI 20 o superior
- npm 9 o superior

## Instalación

### 1. Instalar dependencias

```bash
cd FRONTEND
npm install
```

### 2. Ejecutar en desarrollo

```bash
ng serve
```

O para abrir automáticamente el navegador:

```bash
ng serve -o
```

La aplicación estará disponible en: `http://localhost:4200`

## Estructura del Proyecto

```
src/
├── app/
│   ├── componentes/          # Componentes de la aplicación
│   │   ├── admin-dashboard/  # Panel de administración
│   │   ├── admin-pedidos/    # Gestión de pedidos (admin)
│   │   ├── admin-productos/  # Gestión de productos (admin)
│   │   ├── carrito/          # Carrito de compras
│   │   ├── checkout/         # Proceso de pago
│   │   ├── cupones/          # Gestión de cupones
│   │   ├── detalle-producto/ # Modal de detalles de producto
│   │   ├── editar-perfil/    # Edición de perfil
│   │   ├── login/            # Inicio de sesión
│   │   ├── menu/             # Catálogo de productos
│   │   ├── navbar/            # Barra de navegación
│   │   ├── pedidos/          # Historial de pedidos
│   │   ├── perfil-usuario/   # Perfil del usuario
│   │   ├── registro/         # Registro de usuarios
│   │   ├── repartidor-dashboard/ # Dashboard de repartidor
│   │   └── ...
│   │
│   ├── guards/               # Guards de autenticación
│   │   ├── auth.guard.ts     # Guard de autenticación
│   │   ├── admin.guard.ts    # Guard de administrador
│   │   └── repartidor.guard.ts # Guard de repartidor
│   │
│   ├── modelos/              # Interfaces y modelos
│   │   ├── producto.model.ts
│   │   ├── usuario.model.ts
│   │   ├── pedido.model.ts
│   │   └── pago.model.ts
│   │
│   ├── servicios/            # Servicios de la aplicación
│   │   ├── auth.service.ts   # Autenticación
│   │   ├── carrito.service.ts # Carrito de compras
│   │   ├── checkout.service.ts # Proceso de checkout
│   │   ├── menu.service.ts   # Productos y menú
│   │   ├── pago.service.ts   # Integración Stripe
│   │   ├── personalizacion.service.ts # Opciones de personalización
│   │   ├── usuario.service.ts # Gestión de usuarios
│   │   ├── onesignal.service.ts # Notificaciones push OneSignal
│   │   ├── configuracion.service.ts # Configuración dinámica
│   │   ├── repartidor.service.ts # Servicios de repartidor
│   │   └── ...
│   │
│   ├── app.routes.ts         # Configuración de rutas
│   ├── app.config.ts         # Configuración de la aplicación
│   └── app.ts                # Componente raíz
│
├── assets/                   # Recursos estáticos
└── styles.css                # Estilos globales
```

## Componentes Principales

### Componentes Públicos

#### Menu Component
Componente principal del catálogo de productos con filtros y búsqueda.

**Funcionalidades:**
- Visualización de productos activos
- Filtrado por categoría
- Búsqueda por nombre
- Modal de detalles con opciones de personalización
- Agregar productos al carrito

#### Login Component
Autenticación de usuarios existentes.

**Funcionalidades:**
- Login con email y contraseña
- Validación de formulario
- Manejo de errores
- Redirección según rol después del login

#### Registro Component
Registro de nuevos usuarios.

**Funcionalidades:**
- Formulario de registro completo
- Validación de datos
- Generación automática de username
- Normalización de teléfono con +51
- Aceptación de términos y condiciones

### Componentes Protegidos (Cliente)

#### Carrito Component
Gestión del carrito de compras.

**Funcionalidades:**
- Visualización de items
- Modificar cantidades
- Eliminar productos
- Cálculo de totales
- Persistencia en localStorage
- Navegación al checkout

#### Checkout Component
Proceso de pago completo.

**Funcionalidades:**
- Integración con Stripe para tarjetas
- Selección de método de pago (Tarjeta, Billetera Virtual, Efectivo)
- Validación de datos de envío
- Confirmación de pedido
- Notificaciones de éxito/error

#### Perfil Usuario Component
Visualización y gestión del perfil.

**Funcionalidades:**
- Visualización de datos personales
- Estadísticas del usuario (pedidos, total gastado)
- Enlaces a edición y cambio de contraseña
- Eliminación de cuenta
- URL con username: `/mi-perfil/{username}`

#### Pedidos Component
Historial de pedidos del cliente.

**Funcionalidades:**
- Listado de todos los pedidos
- Filtrado por estado
- Detalles de cada pedido
- Seguimiento en tiempo real

### Componentes de Administración

#### Admin Dashboard Component
Panel principal de administración.

**Funcionalidades:**
- Dashboard con estadísticas generales
- Gestión de productos
- Gestión de pedidos
- Gestión de usuarios
- Gestión de cupones
- Configuración (cambio de contraseña)

#### Admin Productos Component
CRUD completo de productos.

**Funcionalidades:**
- Crear, editar, eliminar productos
- Asignar categorías
- Subir imágenes
- Activar/desactivar productos
- Configurar opciones de personalización

#### Admin Pedidos Component
Gestión completa de pedidos.

**Funcionalidades:**
- Visualización de todos los pedidos
- Cambio de estados
- Asignación de repartidores
- Notificaciones por WhatsApp

## Servicios Principales

### AuthService
Servicio de autenticación y gestión de sesión.

**Métodos principales:**
```typescript
login(credentials: LoginRequest): Observable<AuthResponse>
register(userData: RegistroRequest): Observable<AuthResponse>
logout(): void
isAuthenticated(): boolean
getUsuarioActual(): Usuario | null
cambiarContrasena(idUsuario: number, ...): Observable<any>
```

### CarritoService
Gestión del carrito de compras con persistencia local.

**Métodos principales:**
```typescript
getItems(): Observable<ItemCarrito[]>
agregarItem(item: ItemCarrito): void
eliminarItem(idProducto: number): void
actualizarCantidad(idProducto: number, cantidad: number): void
vaciarCarrito(): void
calcularTotal(): number
```

### MenuService
Servicio para productos y menú.

**Métodos principales:**
```typescript
obtenerMenuDisponible(): Observable<Producto[]>
obtenerCategorias(): Observable<Categoria[]>
obtenerProductoPorId(id: number): Observable<Producto>
```

### PersonalizacionService
Gestión de opciones de personalización de productos.

**Métodos principales:**
```typescript
obtenerOpcionesPersonalizacion(idProducto: number): Observable<OpcionPersonalizacion[]>
calcularPrecioOpciones(opciones: OpcionPersonalizacion[]): number
formatearOpcionesSeleccionadas(opciones: OpcionPersonalizacion[]): string
```

### PagoService
Integración con Stripe para pagos.

**Métodos principales:**
```typescript
inicializarStripe(publishableKey: string): Promise<void>
crearElementoTarjeta(containerId: string): Promise<void>
crearPaymentIntent(monto: number, idPedido: number): Observable<any>
confirmarPago(paymentIntentId: string): Observable<any>
```

### CheckoutService
Servicio para proceso de checkout.

**Métodos principales:**
```typescript
crearPedidoEnBackend(datosPedido: DatosPedido): Promise<any>
procesarPago(datosPago: DatosPago): Observable<any>
```

## Guards de Autenticación

### AuthGuard
Protege rutas que requieren autenticación.

```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
```

### AdminGuard
Protege rutas exclusivas de administradores.

```typescript
canActivate(): boolean {
  const usuario = this.authService.getUsuarioActual();
  if (usuario && usuario.rol === 'administrador') {
    return true;
  }
  this.router.navigate(['/menu']);
  return false;
}
```

### RepartidorGuard
Protege rutas exclusivas de repartidores.

```typescript
canActivate(): boolean {
  const usuario = this.authService.getUsuarioActual();
  if (usuario && usuario.rol === 'repartidor') {
    return true;
  }
  this.router.navigate(['/menu']);
  return false;
}
```

## Modelos TypeScript

### Usuario
```typescript
export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  username?: string;
  telefono?: string;
  direccion?: string;
  rol: 'cliente' | 'administrador' | 'repartidor' | 'vendedor';
  activo: boolean;
  fechaRegistro?: string;
}
```

### Producto
```typescript
export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria: Categoria | string;
  estado: 'activo' | 'inactivo';
}
```

### OpcionPersonalizacion
```typescript
export interface OpcionPersonalizacion {
  idOpcion: number;
  nombre: string;
  descripcion?: string;
  precioAdicional: number;
  activa: boolean;
  idProducto: number;
}
```

### ItemCarrito
```typescript
export interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  categoria: string;
  opcionesSeleccionadas?: OpcionPersonalizacion[];
  precioOpciones?: number;
}
```

## Rutas de la Aplicación

### Rutas Públicas
- `/` - Redirige a menu
- `/menu` - Catálogo de productos
- `/login` - Inicio de sesión
- `/registro` - Registro de usuario
- `/recuperar-contrasena` - Recuperación de contraseña
- `/restablecer-contrasena` - Restablecer contraseña con token
- `/terminos-y-condiciones` - Términos y condiciones
- `/politica-de-privacidad` - Política de privacidad

### Rutas Protegidas (Cliente)
- `/carrito` - Carrito de compras (AuthGuard)
- `/mis-pedidos` - Historial de pedidos (AuthGuard)
- `/mis-cupones` - Cupones del usuario (AuthGuard)
- `/mi-perfil/:username` - Perfil del usuario (AuthGuard)
- `/editar-perfil` - Editar perfil (AuthGuard)
- `/cambiar-contrasena` - Cambiar contraseña (AuthGuard)

### Rutas de Administración
- `/admin/dashboard` - Panel de administración (AdminGuard)
- `/admin/productos` - Gestión de productos (AdminGuard)
- `/admin/pedidos` - Gestión de pedidos (AdminGuard)

### Rutas de Repartidor
- `/repartidor/dashboard` - Dashboard de repartidor con notificaciones push (RepartidorGuard)

## Funcionalidades Principales

### Catálogo de Productos
- Listado completo de productos activos
- Filtrado por categoría (Hamburguesas, Bebidas, etc.)
- Búsqueda por nombre
- Visualización de productos con imágenes
- Modal de detalles con opciones de personalización

### Personalización de Productos
- Sistema tipo Rappi para personalizar productos
- Opciones configurables por producto
- Precios adicionales que afectan el total
- Visualización en tiempo real del precio final
- Persistencia de opciones en el carrito

### Carrito de Compras
- Agregar/eliminar productos
- Modificar cantidades (máximo 99 por producto)
- Persistencia en localStorage
- Cálculo automático de totales
- Consideración de precios de personalizaciones

### Checkout y Pagos
- Selección de método de pago:
  - **Tarjeta**: Integración completa con Stripe
  - **Billetera Virtual**: Confirmación manual
  - **Efectivo**: Confirmación manual
- Validación de datos de envío
- Integración con Stripe Elements
- Manejo de estados de pago
- Notificaciones automáticas

### Gestión de Perfil
- Visualización de datos personales
- Edición de información (nombre, apellido, teléfono, dirección)
- Cambio de contraseña
- Normalización automática de teléfono con +51
- URLs amigables con username
- Estadísticas personalizadas

### Administración
- Dashboard con métricas en tiempo real
- CRUD completo de productos
- Gestión de opciones de personalización
- Gestión de pedidos con cambio de estados
- Gestión de usuarios (CRUD, roles, estado)
- Sistema de cupones y promociones
- Configuración dinámica del sistema (porcentaje de costo)
- Gestión de métodos de pago inhabilitados (reactivación)
- Reportes de ventas con configuración dinámica

### Repartidor
- Dashboard con actualización en tiempo real
- Notificaciones push cuando hay nuevos pedidos disponibles
- Visualización de pedidos disponibles y asignados
- Aceptación y gestión de pedidos
- Confirmación de pagos en efectivo
- Gestión de perfil personal (edición de datos, cambio de contraseña)

## Características Especiales

### Personalización de Productos
- Opciones por defecto configuradas en base de datos
- Precios adicionales que se suman al precio base
- Cálculo en tiempo real del precio total
- Persistencia en carrito y pedidos

### URLs con Username
- Rutas amigables: `/mi-perfil/{username}`
- Generación automática de username único
- Búsqueda de usuarios por username

### Normalización de Teléfonos
- Prefijo +51 automático para Perú
- Validación de formato
- Normalización en registro y edición

### Notificaciones Push (OneSignal)
- Integración con OneSignal SDK v16
- Inicialización solo para usuarios con rol 'repartidor'
- Registro automático de Player ID en backend
- Notificaciones en tiempo real cuando hay nuevos pedidos
- Click en notificación abre directamente el detalle del pedido
- Service Worker configurado para notificaciones

### Configuración Dinámica
- Servicio para obtener y actualizar configuraciones
- Ejemplo: porcentaje de costo para reportes de ganancias
- Actualización sin reiniciar el backend
- Interfaz en panel de administración

## Estado de la Aplicación

### Gestión de Estado
- **Servicios Reactivos**: RxJS con Observables
- **BehaviorSubject**: Para estado compartido
- **LocalStorage**: Persistencia de sesión y carrito
- **Signals** (Angular 20): Reactividad mejorada

### Autenticación
- Tokens JWT almacenados en localStorage
- Validación automática de sesión
- Refresh de token (opcional)
- Guards para protección de rutas

## Comandos de Desarrollo

```bash
# Desarrollo
ng serve                    # Servidor de desarrollo
ng serve -o                 # Abrir navegador automáticamente
ng serve --port 4200        # Especificar puerto

# Compilación
ng build                    # Compilar para desarrollo
ng build --prod             # Compilar para producción

# Testing
ng test                     # Ejecutar tests unitarios
ng e2e                      # Ejecutar tests e2e

# Utilidades
ng generate component nombre # Generar nuevo componente
ng generate service nombre   # Generar nuevo servicio
ng lint                      # Linter del código
```

## Configuración

### API Base URL
Configurado en `configuracion.service.ts`:
```typescript
private apiUrl = 'http://localhost:8089/api';
```

### Stripe
Clave pública configurable en `pago.service.ts`:
```typescript
const stripeKey = 'pk_test_tu_clave_publica';
```

### Variables de Entorno
El frontend se conecta al backend en `http://localhost:8089` por defecto.
Para producción, actualizar en los servicios correspondientes.

### OneSignal
Configurar en `index.html`:
```html
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
```

Y en `onesignal.service.ts`:
```typescript
private readonly APP_ID = 'tu_app_id_onesignal';
```

**Importante**: Solo se inicializa para usuarios con rol 'repartidor'.

## Responsive Design

- **Mobile First**: Diseño pensado primero para móviles
- **Bootstrap Grid**: Sistema de grillas responsive
- **Breakpoints**: Adaptación a diferentes tamaños de pantalla
- **Flexible Layout**: Componentes adaptables

## Estilos

- **Bootstrap 5**: Framework CSS principal
- **CSS Personalizado**: Estilos específicos por componente
- **Component Scoped**: Estilos encapsulados por componente
- **Global Styles**: Estilos compartidos en `styles.css`

## Integraciones

### Stripe.js
- Integración completa para pagos con tarjeta
- Stripe Elements para formularios seguros
- Manejo de estados de pago
- Confirmación de transacciones

### OneSignal SDK
- Inicialización condicional por rol de usuario
- Registro de Player ID automático
- Manejo de eventos de notificación
- Navegación automática al hacer click en notificación

### Bootstrap 5
- Sistema de componentes
- Utilidades CSS
- Grid system responsive
- Iconos y componentes UI

## Mejoras Futuras

- Implementar Angular Signals para reactividad mejorada
- Agregar PWA (Progressive Web App)
- Implementar lazy loading de módulos
- Agregar internacionalización (i18n)
- Mejorar accesibilidad (a11y)
- Implementar tests unitarios completos
- Agregar animaciones con Angular Animations
