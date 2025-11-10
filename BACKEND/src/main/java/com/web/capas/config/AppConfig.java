package com.web.capas.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

// Configuración principal de la aplicación
// Maneja seguridad, CORS y Stripe
@Configuration
@EnableWebSecurity
public class AppConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final StripeProperties stripeProperties;
    private final ApplicationUrlsProperties applicationUrlsProperties;

    public AppConfig(
        JwtAuthenticationFilter jwtAuthenticationFilter,
        StripeProperties stripeProperties,
        ApplicationUrlsProperties applicationUrlsProperties) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.stripeProperties = stripeProperties;
        this.applicationUrlsProperties = applicationUrlsProperties;
    }

    // Inicializar Stripe con la clave secreta
    @PostConstruct
    public void initStripe() {
        if (stripeProperties.getSecretKey() != null && !stripeProperties.getSecretKey().isBlank()) {
            Stripe.apiKey = stripeProperties.getSecretKey();
        }
    }

    // Configurar seguridad y filtros JWT
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .anonymous(anonymous -> anonymous.authorities("ROLE_INVITADO"))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST,
                    "/api/auth/login",
                    "/api/auth/registro",
                    "/api/auth/recuperar-contrasena",
                    "/api/auth/restablecer-contrasena")
                    .hasRole("INVITADO")
                .requestMatchers("/api/auth/**")
                    .hasAnyRole("CLIENTE", "ADMINISTRADOR", "REPARTIDOR", "VENDEDOR")
                .requestMatchers(HttpMethod.GET, "/api/v1/menu/**").hasAnyRole("INVITADO", "CLIENTE", "ADMINISTRADOR", "REPARTIDOR", "VENDEDOR")
                .requestMatchers("/api/v1/menu/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/admin/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/v1/carrito/**").hasRole("CLIENTE")
                .requestMatchers("/api/v1/pedidos/**").hasAnyRole("CLIENTE", "ADMINISTRADOR", "REPARTIDOR")
                .requestMatchers("/api/v1/pagos/**").hasAnyRole("CLIENTE", "ADMINISTRADOR")
                .requestMatchers("/api/repartidor/**").hasAnyRole("REPARTIDOR", "ADMINISTRADOR")
                .requestMatchers("/api/admin/notificaciones/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/v1/usuarios/**").hasAnyRole("CLIENTE", "ADMINISTRADOR", "REPARTIDOR", "VENDEDOR")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    // Configurar CORS para el frontend
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> allowedOrigins = applicationUrlsProperties.getCorsAllowed();
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            allowedOrigins = List.of(applicationUrlsProperties.getFrontend());
        }
        if (applicationUrlsProperties.getBackend() != null && !applicationUrlsProperties.getBackend().isBlank()
            && !allowedOrigins.contains(applicationUrlsProperties.getBackend())) {
            allowedOrigins = new java.util.ArrayList<>(allowedOrigins);
            allowedOrigins.add(applicationUrlsProperties.getBackend());
        }
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
