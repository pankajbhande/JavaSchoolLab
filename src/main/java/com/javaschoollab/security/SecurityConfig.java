package com.javaschoollab.security;

import com.javaschoollab.common.RateLimiters;
import com.javaschoollab.config.AppProperties;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
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
            "/api/analytics/event",                   // the site reports page views and searches (no login needed, rate limited)
            "/api/search/**",                         // topic search (needs no login; rate limited)
            "/api/payments/plans",                    // the price list; checkout itself needs a token
            "/api/payments/webhook",                  // Razorpay calling us; authenticated by its signature over the body
    };

    /**
     * The operations endpoints (Spring Boot Actuator), a chain of their own that is checked before the API chain below.
     * {@code /actuator/health} (with its liveness and readiness probes) and {@code /actuator/info} are public: a load balancer, Docker or
     * Kubernetes must be able to call them, and anonymous callers only ever get the status, never details. Everything else that is
     * exposed (metrics, prometheus) needs HTTP Basic with the ACTUATOR account. With no ACTUATOR_PASSWORD configured the account
     * does not exist, so those endpoints stay closed. In production they are also on a separate port that is not published to the internet.
     */
    @Bean
    @Order(1)
    SecurityFilterChain actuatorFilterChain(HttpSecurity http, PasswordEncoder encoder,
                                            @Value("${app.actuator.user:actuator}") String user,
                                            @Value("${app.actuator.password:}") String password) throws Exception {
        UserDetailsService accounts = password == null || password.isBlank()
                ? new InMemoryUserDetailsManager()
                : new InMemoryUserDetailsManager(User.withUsername(user).password(encoder.encode(password)).roles("ACTUATOR").build());
        http
                .securityMatcher(EndpointRequest.toAnyEndpoint())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(EndpointRequest.to("health", "info")).permitAll()
                        .anyRequest().hasRole("ACTUATOR"))
                .userDetailsService(accounts)
                .httpBasic(Customizer.withDefaults());
        return http.build();
    }

    /**
     * An explicit, empty user store. Without it Spring Boot creates a default "user" account with a random password and prints it in the
     * log at start-up ("Using generated security password..."). Sign-in here uses JWTs and the ACTUATOR account has its own store, so
     * no such account should exist.
     */
    @Bean
    UserDetailsService noDefaultUser() {
        return new InMemoryUserDetailsManager();
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JwtService jwtService, TokenRevocation revocation, RateLimiters limiters,
                                    @Value("${app.rate-limit.writes-per-minute:120}") int writesPerMinute) throws Exception {
        JwtAuthFilter jwtFilter = new JwtAuthFilter(jwtService, revocation);
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
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(new ApiWriteGuardFilter(limiters.perMinute("api-write", writesPerMinute)), JwtAuthFilter.class);
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
