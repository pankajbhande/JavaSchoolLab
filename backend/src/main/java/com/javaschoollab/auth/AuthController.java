package com.javaschoollab.auth;

import com.javaschoollab.security.AuthUser;
import com.javaschoollab.user.UserRow;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** HTTP for register, sign in (password or OTP), the current user and password change. Same URLs, bodies and messages as the Node server. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest r) {
        return created(auth.register(r));
    }

    @PostMapping("/register-otp")
    public ResponseEntity<Map<String, Object>> registerWithOtp(@RequestBody RegisterOtpRequest r) {
        return created(auth.registerWithOtp(r));
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest r) {
        return session(auth.login(r));
    }

    @PostMapping("/login-otp")
    public Map<String, Object> loginWithOtp(@RequestBody LoginOtpRequest r) {
        return session(auth.loginWithOtp(r));
    }

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal AuthUser principal) {
        UserRow u = auth.currentUser(principal.id());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", u.id());
        body.put("fullName", u.fullName());
        body.put("email", u.email());
        body.put("mobile", u.mobile());
        body.put("loginType", u.loginType());
        body.put("gender", u.gender());
        body.put("dob", u.dob() == null ? null : u.dob().toString());
        body.put("organization", u.organization());
        body.put("avatar", u.avatar() == null || u.avatar().isEmpty() ? null : u.avatar());
        body.put("createdAt", u.createdAt());
        return body;
    }

    @PostMapping("/change-password")
    public Map<String, Object> changePassword(@AuthenticationPrincipal AuthUser principal, @RequestBody ChangePasswordRequest r) {
        auth.changePassword(principal.id(), r);
        return Map.of("ok", true);
    }

    private static ResponseEntity<Map<String, Object>> created(AuthSession s) {
        Map<String, Object> user = new LinkedHashMap<>();
        user.put("id", s.id());
        user.put("fullName", s.fullName());
        user.put("email", s.email());
        user.put("mobile", s.mobile());
        user.put("loginType", s.loginType());
        user.put("gender", s.gender());
        user.put("dob", s.dob());
        user.put("organization", s.organization());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("token", s.token(), "user", user));
    }

    private static Map<String, Object> session(AuthSession s) {
        Map<String, Object> user = new LinkedHashMap<>();
        user.put("id", s.id());
        user.put("fullName", s.fullName());
        user.put("email", s.email());
        user.put("mobile", s.mobile());
        user.put("loginType", s.loginType());
        return Map.of("token", s.token(), "user", user);
    }
}
