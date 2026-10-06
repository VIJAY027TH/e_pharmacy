package com.example.epharmacy.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final String frontendUrl;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthFilter,
            CustomUserDetailsService userDetailsService,
            @Value("${app.cors.frontend-url:${FRONTEND_URL:https://welcoming-passion-production-5ad9.up.railway.app}}") String frontendUrl) {

        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
        this.frontendUrl = frontendUrl;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .csrf(AbstractHttpConfigurer::disable)

            .headers(headers ->
                headers.frameOptions(frame -> frame.sameOrigin())
            )

            .authorizeHttpRequests(auth -> auth

                // Public authentication endpoints
                .requestMatchers(
                    "/api/auth/**",
                    "/h2-console/**",
                    "/uploads/**"
                ).permitAll()

                // Public GET endpoints
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/medicines/**",
                    "/api/categories/**",
                    "/api/reviews/**"
                ).permitAll()

                // Admin endpoints
                .requestMatchers("/api/admin/**")
                .hasAuthority("ROLE_ADMIN")

                // User endpoints
                .requestMatchers(
                    "/api/cart/**",
                    "/api/prescriptions/upload"
                )
                .hasAuthority("ROLE_USER")

                // Orders
                .requestMatchers(HttpMethod.POST, "/api/orders/**")
                .hasAuthority("ROLE_USER")

                .requestMatchers(HttpMethod.PUT, "/api/orders/*/cancel")
                .hasAuthority("ROLE_USER")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authenticationProvider(authenticationProvider())

            .addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider authProvider =
            new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {

        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
            new CorsConfiguration();

        List<String> allowedOrigins = new ArrayList<>(List.of(
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173"
        ));

        if (frontendUrl != null && !frontendUrl.isBlank()) {
            for (String origin : frontendUrl.split(",")) {
                String trimmed = origin.trim();
                if (!trimmed.isEmpty() && !allowedOrigins.contains(trimmed)) {
                    allowedOrigins.add(trimmed);
                }
            }
        }

        // Include default production domain if not already present
        if (!allowedOrigins.contains("https://welcoming-passion-production-5ad9.up.railway.app")) {
            allowedOrigins.add("https://welcoming-passion-production-5ad9.up.railway.app");
        }
        if (!allowedOrigins.contains("https://e-pharmacy.up.railway.app")) {
            allowedOrigins.add("https://e-pharmacy.up.railway.app");
        }

        configuration.setAllowedOrigins(allowedOrigins);

        configuration.setAllowedMethods(Arrays.asList(
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS",
            "PATCH"
        ));

        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With"
        ));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            configuration
        );

        return source;
    }
}