package com.javaschoollab.security;

import com.javaschoollab.config.AppProperties;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    /** Public API routes: sign-in itself, OTP, the visitor counter and certificate verification. Every other /api route needs a token. */
    private static final String[] PUBLIC_API = {
            "/api/otp/**",
            "/api/auth/register", "/api/auth/login", "/api/auth/register-otp", "/api/auth/login-otp",
            "/api/auth/google", "/api/auth/config",
            "/api/visitors/**",
            "/api/certificates/verify/**",           // what the QR code on a certificate opens
            "/api/profiles/**",                       // public learner profile pages (opt-in, see PublicProfileController)
            "/api/content/**",                        // course content JSON, public like the site itself
    };

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JwtService jwtService) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)            // token in a header, no cookies, so no CSRF surface
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(PUBLIC_API).permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())                // the built React site and its client-side routes
                .exceptionHandling(e -> e.authenticationEntryPoint((req, res, ex) -> {
                    boolean badToken = req.getAttribute(JwtAuthFilter.INVALID_TOKEN) != null;
                    res.setStatus(badToken ? 403 : 401);
                    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    res.getWriter().write(badToken
                            ? "{\"error\":\"Invalid or expired token\"}"
                            : "{\"error\":\"Login required\"}");
                }))
                .addFilterBefore(new JwtAuthFilter(jwtService), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /** cost 10, the same as bcryptjs in the Node server, and it verifies the hashes already in the database. */
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    /** CORS_ORIGIN lists the allowed front-end origins; empty means any origin (development only). */
    @Bean
    CorsConfigurationSource corsConfigurationSource(AppProperties props) {
        List<String> origins = props.cors().list();
        CorsConfiguration c = new CorsConfiguration();
        if (origins.isEmpty()) {
            c.addAllowedOriginPattern("*");
        } else {
            c.setAllowedOrigins(origins);
            c.setAllowCredentials(true);
        }
        c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", c);
        return source;
    }
}
