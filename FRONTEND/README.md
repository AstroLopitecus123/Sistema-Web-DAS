# FRONTEND README - FRONTEND_SISTEMA_WEB_DAS 

Desarrollado con **Angular 20.2.0** implementando arquitectura de componentes, programación reactiva con RxJS, integración con APIs REST y servicios externos para e-commerce.

## Arquitectura del Frontend

```
┌─────────────────────────────────────────────────────────────┐
│                    ANGULAR APPLICATION                      │
├─────────────────────────────────────────────────────────────┤
│  Components Layer    │  @Component, @Input, @Output        │
├─────────────────────────────────────────────────────────────┤
│  Services Layer      │  @Injectable, HTTP Client           │
├─────────────────────────────────────────────────────────────┤
│  Guards Layer        │  @Injectable, CanActivate           │
├─────────────────────────────────────────────────────────────┤
│  Models Layer        │  Interfaces, TypeScript Types       │
├─────────────────────────────────────────────────────────────┤
│  Routing Layer       │  RouterModule, Guards, Lazy Loading │
├─────────────────────────────────────────────────────────────┤
│  External Services   │  Stripe.js, Bootstrap, RxJS         │
└─────────────────────────────────────────────────────────────┘
```

## Stack Tecnológico Detallado

| Componente | Tecnología | Versión | Decoradores Principales |
|------------|------------|---------|-------------------------|
| **Framework** | Angular | 20.2.0 | `@Component`, `@Injectable` |
| **UI Framework** | Bootstrap | 5.3.8 | CSS Classes, Components |
| **Language** | TypeScript | 5.9.2 | `interface`, `type`, `enum` |
| **Reactive** | RxJS | 7.8.0 | `Observable`, `Subject`, `BehaviorSubject` |
| **HTTP** | Angular HTTP | 20.2.0 | `HttpClient`, `HttpInterceptor` |
| **Routing** | Angular Router | 20.2.0 | `@RouteConfig`, `CanActivate` |
| **Forms** | Angular Forms | 20.2.0 | `FormBuilder`, `Validators` |
| **Pagos** | Stripe.js | 8.0.0 | `loadStripe`, `StripeElements` |

## Prerrequisitos

- Node.js 18+
- Angular CLI 20+
- npm 9+

## Instalación

### 1. Instalar dependencias
```
npm install
```

### 2. Ejecutar en desarrollo
```
ng serve
```

La aplicación estará disponible en: `http://localhost:4200`

## Estructura

```
src/
├── app/
│   ├── componentes/          # Componentes de la aplicación
│   │   ├── admin-dashboard/  # Panel de administración
│   │   ├── carrito/         # Carrito de compras
│   │   ├── checkout/        # Proceso de pago
│   │   ├── login/           # Inicio de sesión
│   │   ├── menu/            # Catálogo de productos
│   │   └── ...
│   ├── guards/              # Guards de autenticación
│   ├── modelos/             # Interfaces y modelos
│   ├── servicios/           # Servicios de la aplicación
│   └── app.routes.ts        # Configuración de rutas
├── assets/                  # Recursos estáticos
└── styles.css              # Estilos globales
```

## Componentes Principales

### Componentes Públicos

#### Menu Component
```typescript
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, DetalleProducto, Notificacion],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  
  constructor(
    private menuService: MenuService,
    private carritoService: CarritoService,
    private filtrosProductosService: FiltrosProductosService
  ) {}
  
  ngOnInit(): void {
    this.cargarProductos();
  }
  
  cargarProductos(): void {
    this.menuService.obtenerMenuDisponible().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosFiltrados = data;
      },
      error: (err) => this.error = err.message
    });
  }
}
```

#### Login Component
```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  loginForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.router.navigate(['/menu']);
        },
        error: (error) => this.errorMessage = error.message
      });
    }
  }
}
```

### Componentes Protegidos (Cliente)

#### Carrito Component
```typescript
@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.css']
})
export class Carrito implements OnInit {
  items: ItemCarrito[] = [];
  total: number = 0;
  
  constructor(
    public carritoService: CarritoService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.carritoService.getItems().subscribe(items => {
      this.items = items;
      this.calcularTotal();
    });
  }
  
  actualizarCantidad(item: ItemCarrito, cantidad: number): void {
    this.carritoService.actualizarCantidad(item.id, cantidad);
    this.calcularTotal();
  }
  
  private calcularTotal(): void {
    this.total = this.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  }
}
```

#### Checkout Component
```typescript
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout implements OnInit {
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;
  
  constructor(
    private checkoutService: CheckoutService,
    private carritoService: CarritoService
  ) {}
  
  async ngOnInit(): Promise<void> {
    await this.initializeStripe();
    this.setupCardElement();
  }
  
  private async initializeStripe(): Promise<void> {
    this.stripe = await loadStripe('pk_test_tu_clave_publica');
    this.elements = this.stripe!.elements();
  }
  
  async procesarPago(): Promise<void> {
    if (!this.stripe || !this.cardElement) return;
    
    const { error, paymentIntent } = await this.stripe.confirmCardPayment(
      this.clientSecret,
      {
        payment_method: {
          card: this.cardElement
        }
      }
    );
    
    if (error) {
      console.error('Error en el pago:', error);
    } else {
      console.log('Pago exitoso:', paymentIntent);
    }
  }
}
```

### Componentes de Administración

#### Admin Dashboard Component
```typescript
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  seccionActiva: string = 'dashboard';
  usuarios: UsuarioAdmin[] = [];
  estadisticas: EstadisticasUsuarios | null = null;
  
  constructor(
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService
  ) {}
  
  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarEstadisticas();
  }
  
  cambiarRol(usuario: UsuarioAdmin, nuevoRol: string): void {
    this.usuarioService.cambiarRolUsuario(usuario.id, nuevoRol).subscribe({
      next: (response) => {
        this.mostrarNotificacion('Rol actualizado correctamente', 'exito');
        this.cargarUsuarios();
      },
      error: (error) => this.mostrarNotificacion('Error al actualizar rol', 'error')
    });
  }
}
```

## Servicios Principales

### Auth Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8089/api';
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();
  
  constructor(private http: HttpClient) {
    this.cargarUsuarioDesdeStorage();
  }
  
  login(credenciales: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credenciales)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
          this.usuarioSubject.next(response.usuario);
        })
      );
  }
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
  }
  
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.isTokenExpired(token);
  }
}
```

### Carrito Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private itemsSubject = new BehaviorSubject<ItemCarrito[]>([]);
  public items$ = this.itemsSubject.asObservable();
  
  constructor() {
    this.cargarItemsDesdeStorage();
  }
  
  agregarItem(item: ItemCarrito): void {
    const items = this.itemsSubject.value;
    const itemExistente = items.find(i => i.id === item.id);
    
    if (itemExistente) {
      itemExistente.cantidad += item.cantidad;
    } else {
      items.push(item);
    }
    
    this.actualizarItems(items);
  }
  
  eliminarItem(id: number): void {
    const items = this.itemsSubject.value.filter(item => item.id !== id);
    this.actualizarItems(items);
  }
  
  private actualizarItems(items: ItemCarrito[]): void {
    this.itemsSubject.next(items);
    localStorage.setItem('carrito', JSON.stringify(items));
  }
}
```

### Checkout Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private baseUrl = 'http://localhost:8089/api';
  
  constructor(private http: HttpClient) {}
  
  crearPaymentIntent(monto: number): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(`${this.baseUrl}/pagos/crear-payment-intent`, {
      monto: monto,
      moneda: 'usd'
    });
  }
  
  procesarPedido(pedido: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.baseUrl}/pedidos`, pedido);
  }
}
```

## Guards de Autenticación

### Auth Guard
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
```

### Admin Guard
```typescript
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const usuario = this.authService.getUsuarioActual();
    
    if (usuario && usuario.rol === 'administrador') {
      return true;
    } else {
      this.router.navigate(['/menu']);
      return false;
    }
  }
}
```

## Modelos TypeScript

### Usuario Model
```typescript
export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  rol: 'cliente' | 'administrador' | 'repartidor';
  fechaRegistro: Date;
  activo: boolean;
}

export interface LoginRequest {
  email: string;
  contrasena: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
  mensaje: string;
}
```

### Producto Model
```typescript
export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: Categoria;
  activo: boolean;
  stock: number;
}

export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion?: string;
}
```

### Carrito Model
```typescript
export interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  categoria: string;
}

export interface PedidoRequest {
  items: ItemCarrito[];
  total: number;
  direccion: string;
  telefono: string;
  metodoPago: string;
}
```

## Autenticación

### Guards
- `AuthGuard` - Protege rutas que requieren autenticación
- `AdminGuard` - Protege rutas de administración
- `RepartidorGuard` - Protege rutas de repartidor

### Servicios
- `AuthService` - Gestión de autenticación
- `UsuarioService` - Gestión de usuarios

## Estilos

- **Bootstrap 5** - Framework CSS
- **CSS personalizado** - Estilos específicos
- **Responsive** - Diseño adaptable

## Comandos

```
# Desarrollo
ng serve

# Compilar
ng build

# Compilar para producción
ng build --configuration production

# Limpiar
ng clean

# Ayuda
ng help
```

## Funcionalidades

### Catálogo
- Listado de productos
- Filtros por categoría
- Búsqueda por nombre
- Modal de detalles

### Carrito
- Agregar/eliminar productos
- Modificar cantidades
- Cálculo de totales
- Persistencia local

### Checkout
- Integración con Stripe
- Formulario de pago
- Validaciones
- Confirmación de pedido

### Administración
- Dashboard con métricas
- CRUD de productos
- Gestión de pedidos
- Gestión de usuarios

## Configuración

### Variables de Entorno
El frontend se conecta al backend en `http://localhost:8089`

### Stripe
Configuración en `checkout.service.ts`:
```typescript
const stripe = Stripe('pk_test_tu_clave_publica');
```

### API
Base URL configurada en los servicios:
```typescript
private baseUrl = 'http://localhost:8089/api';
```

## Estado de la Aplicación

- **Servicios** - Gestión de estado global
- **LocalStorage** - Persistencia de sesión
- **RxJS** - Programación reactiva

## Rutas

### Públicas
- `/` - Redirige a menu
- `/menu` - Catálogo de productos
- `/login` - Inicio de sesión
- `/registro` - Registro de usuario

### Protegidas
- `/carrito` - Carrito de compras
- `/checkout` - Proceso de pago
- `/mis-pedidos` - Historial de pedidos
- `/mi-perfil` - Perfil de usuario

### Administración
- `/admin/dashboard` - Panel de administración
- `/admin/productos` - Gestión de productos
- `/admin/pedidos` - Gestión de pedidos

## Debugging

### Herramientas
- Angular DevTools
- Console del navegador
- Network tab para API calls

### Logs
```typescript
console.log('Debug info:', data);
```

## Responsive

- **Mobile First** - Diseño móvil primero
- **Breakpoints** - Bootstrap breakpoints
- **Flexible** - Adaptable a todos los dispositivos