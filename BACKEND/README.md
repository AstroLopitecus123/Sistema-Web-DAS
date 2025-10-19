# BACKEND README - BACKEND_SISTEMA_WEB_DAS 

Desarrollado con **Spring Boot 3.5.6** implementando arquitectura de microservicios, autenticación JWT, integración con servicios externos y gestión completa de e-commerce.

## Arquitectura del Backend

```
┌─────────────────────────────────────────────────────────────┐
│                    SPRING BOOT APPLICATION                  │
├─────────────────────────────────────────────────────────────┤
│  Controllers Layer    │  @RestController, @RequestMapping   │
├─────────────────────────────────────────────────────────────┤
│  Service Layer        │  @Service, @Transactional          │
├─────────────────────────────────────────────────────────────┤
│  Repository Layer     │  @Repository, JPA Repositories     │
├─────────────────────────────────────────────────────────────┤
│  Model Layer          │  @Entity, @Table, JPA Annotations  │
├─────────────────────────────────────────────────────────────┤
│  Security Layer       │  JWT, BCrypt, CORS, Guards         │
├─────────────────────────────────────────────────────────────┤
│  External Services    │  Stripe, Twilio, Gmail SMTP        │
└─────────────────────────────────────────────────────────────┘
```

## Stack Tecnológico Detallado

| Componente | Tecnología | Versión | Anotaciones Principales |
|------------|------------|---------|-------------------------|
| **Framework** | Spring Boot | 3.5.6 | `@SpringBootApplication` |
| **Security** | Spring Security | 6.x | `@EnableWebSecurity`, `@PreAuthorize` |
| **JWT** | JJWT | 0.11.5 | `@Component`, `@Service` |
| **Database** | Spring Data JPA | 3.x | `@Repository`, `@Entity` |
| **Database** | MySQL Connector | 8.0+ | `@Table`, `@Column` |
| **Pagos** | Stripe Java | 30.0.0 | `@Value`, `@PostConstruct` |
| **Notificaciones** | Twilio SDK | 10.6.3 | `@Service`, `@Async` |
| **Email** | JavaMail | 6.x | `@Service`, `@Configuration` |
| **Config** | dotenv-java | 3.0.0 | `@Value`, `@Configuration` |

## Prerrequisitos

- Java 21+
- MySQL 8.0+
- Maven 3.6+

## Configuración

### 1. Base de Datos
```
CREATE DATABASE BD_SISTEMA_WEB_DAS;
```

### 2. Variables de Entorno
```
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Ejecutar
```
./mvnw clean install
./mvnw spring-boot:run
```

## API Endpoints Detallados

### Autenticación (`AuthController`)
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody UsuarioRequest request)
    
    @PostMapping("/login") 
    public ResponseEntity<?> login(@RequestBody LoginRequest request)
    
    @PostMapping("/recuperar-contrasena")
    public ResponseEntity<?> solicitarRecuperacion(@RequestBody RecuperarContrasenaRequest request)
}
```

### Productos (`ProductoController`)
```java
@RestController
@RequestMapping("/api/v1/menu")
public class ProductoController {
    
    @GetMapping("/productos")
    public ResponseEntity<List<Producto>> obtenerProductos()
    
    @GetMapping("/categorias")
    public ResponseEntity<List<Categoria>> obtenerCategorias()
}
```

### Pedidos (`PedidoController`)
```java
@RestController
@RequestMapping("/api/v1/pedidos")
public class PedidoController {
    
    @PostMapping
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<?> crearPedido(@RequestBody PedidoRequest request)
    
    @GetMapping("/usuario/{id}")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<List<Pedido>> obtenerPedidosUsuario(@PathVariable Integer id)
}
```

### Pagos (`PagoController`)
```java
@RestController
@RequestMapping("/api/v1/pagos")
public class PagoController {
    
    @PostMapping("/crear-payment-intent")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<?> crearPaymentIntent(@RequestBody PagoRequest request)
}
```

### Administración (`UsuarioController`)
```java
@RestController
@RequestMapping("/api/admin/usuarios")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class UsuarioController {
    
    @GetMapping
    public ResponseEntity<List<Usuario>> obtenerTodosLosUsuarios()
    
    @PutMapping("/{id}/rol")
    public ResponseEntity<?> cambiarRolUsuario(@PathVariable Integer id, @RequestBody RolRequest request)
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Integer id)
}
```

## Estructura de Capas

### Modelos (`@Entity`)
```java
@Entity
@Table(name = "Usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idUsuario;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Enumerated(EnumType.STRING)
    private Rol rol;
    
    // Getters, setters, constructores
}
```

### Repositorios (`@Repository`)
```java
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByEmail(String email);
    List<Usuario> findByRol(Rol rol);
    long countByActivoTrue();
}
```

### Servicios (`@Service`)
```java
@Service
@Transactional
public class UsuarioServiceImpl implements UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    @Override
    public Usuario registrarUsuario(Usuario usuario) {
        // Lógica de negocio
    }
}
```

### Controladores (`@RestController`)
```java
@RestController
@RequestMapping("/api/v1/usuarios")
public class PerfilController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    @GetMapping("/perfil")
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMINISTRADOR', 'REPARTIDOR')")
    public ResponseEntity<Usuario> obtenerPerfil(Authentication auth) {
        // Lógica del controlador
    }
}
```

## Seguridad y Autenticación

### JWT Service
```java
@Service
public class JwtService {
    
    private static final String SECRET_KEY = "mi-clave-secreta-super-segura";
    private static final int JWT_EXPIRATION = 86400000; // 24 horas
    
    public String generateToken(Usuario usuario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", usuario.getIdUsuario());
        claims.put("rol", usuario.getRol().toString());
        return createToken(claims, usuario.getEmail());
    }
    
    public Boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}
```

### Security Configuration
```java
@Configuration
@EnableWebSecurity
public class AppConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/v1/menu/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

## Integraciones Externas

### Stripe Integration
```java
@Service
public class StripeService {
    
    @Value("${stripe.secret.key}")
    private String stripeSecretKey;
    
    @PostConstruct
    public void initStripe() {
        Stripe.apiKey = stripeSecretKey;
    }
    
    public PaymentIntent crearPaymentIntent(Long monto, String moneda) {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(monto)
            .setCurrency(moneda)
            .build();
        
        return PaymentIntent.create(params);
    }
}
```

### Twilio WhatsApp
```java
@Service
public class WhatsAppService {
    
    @Value("${twilio.account.sid}")
    private String accountSid;
    
    @Value("${twilio.auth.token}")
    private String authToken;
    
    @Value("${twilio.whatsapp.from}")
    private String fromNumber;
    
    @Async
    public void enviarMensajeWhatsApp(String to, String mensaje) {
        Twilio.init(accountSid, authToken);
        
        Message message = Message.creator(
            new PhoneNumber(to),
            new PhoneNumber(fromNumber),
            mensaje
        ).create();
    }
}
```

### Gmail SMTP
```java
@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${gmail.username}")
    private String fromEmail;
    
    public void enviarEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        
        mailSender.send(message);
    }
}
```

## Seguridad

- Autenticación JWT
- Encriptación BCrypt
- CORS configurado
- Validación de roles

## Base de Datos

### Tablas Principales
- `Usuarios` - Información de usuarios
- `Productos` - Catálogo de productos
- `Pedidos` - Pedidos realizados
- `Pagos` - Información de pagos
- `PasswordResetTokens` - Tokens de recuperación

## Comandos

```
# Compilar
./mvnw clean compile

# Ejecutar
./mvnw spring-boot:run

# Tests
./mvnw test

# Limpiar
./mvnw clean
```

## Logs

Los logs se muestran en consola con diferentes niveles:
- `INFO` - Información general
- `WARN` - Advertencias
- `ERROR` - Errores

## Configuración Avanzada

### Puerto
Por defecto: `8089`
Cambiar en `.env`: `SERVER_PORT=8089`

### CORS
Configurado para `http://localhost:4200`
Cambiar en `AppConfig.java`

### JWT
Clave secreta configurable en `.env`
Expiración: 24 horas
