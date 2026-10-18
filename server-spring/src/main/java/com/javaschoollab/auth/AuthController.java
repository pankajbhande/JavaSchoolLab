package com.javaschoollab.auth;

import com.javaschoollab.security.AuthUser;
import com.javaschoollab.security.JwtService;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Register, sign in (password or OTP), the current user and password change. Same URLs, bodies and messages as the Node server. */
@RestController
@RequestMapping("/api")
public class AuthController {

    public record OtpSendRequest(String identifier, String identifierType, String purpose) {}
    public record OtpVerifyRequest(String identifier, String identifierType, String otp, String purpose) {}
    public record RegisterRequest(String fullName, String email, String mobile, String password, String loginType,
                                  String gender, String dob, String organization) {}
    public record RegisterOtpRequest(String fullName, String email, String mobile, String password, String loginType,
                                     String otp, String gender, String dob, String organization) {}
    public record LoginRequest(String email, String mobile, String password, String loginType) {}
    public record LoginOtpRequest(String email, String mobile, String loginType, String otp) {}
    public record ChangePasswordRequest(String currentPassword, String newPassword) {}

    private final UserRepository users;
    private final OtpService otp;
    private final JwtService jwt;
    private final PasswordEncoder encoder;

    public AuthController(UserRepository users, OtpService otp, JwtService jwt, PasswordEncoder encoder) {
        this.users = users;
        this.otp = otp;
        this.jwt = jwt;
        this.encoder = encoder;
    }

    // ---------- OTP ----------

    @PostMapping("/otp/send")
    public Map<String, Object> sendOtp(@RequestBody OtpSendRequest r) {
        return otp.send(r.identifier(), r.identifierType(), r.purpose());
    }

    @PostMapping("/otp/verify")
    public Map<String, Object> verifyOtp(@RequestBody OtpVerifyRequest r) {
        return otp.verify(r.identifier(), r.identifierType(), r.otp(), r.purpose());
    }

    // ---------- register ----------

    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest r) {
        if (isEmpty(r.fullName()) || isEmpty(r.password()) || isEmpty(r.loginType())) {
            throw ApiException.badRequest("Full name, password, and login type are required");
        }
        Identifier type = Identifier.of(r.loginType())
                .orElseThrow(() -> ApiException.badRequest("Login type must be email or mobile"));
        String value = type == Identifier.EMAIL ? r.email() : r.mobile();
        firstError(Validation.identifierError(type, value), Validation.passwordError(r.password()), Validation.nameError(r.fullName()));

        if (users.exists(type, value)) {
            throw ApiException.conflict("User with this " + type.wire() + " already exists");
        }
        return created(r.fullName(), r.email(), r.mobile(), r.password(), r.loginType(), r.gender(), r.dob(), r.organization());
    }

    @PostMapping("/auth/register-otp")
    public ResponseEntity<Map<String, Object>> registerWithOtp(@RequestBody RegisterOtpRequest r) {
        if (isEmpty(r.fullName()) || isEmpty(r.password()) || isEmpty(r.loginType()) || isEmpty(r.otp())) {
            throw ApiException.badRequest("All fields are required");
        }
        Identifier type = Identifier.of(r.loginType())
                .orElseThrow(() -> ApiException.badRequest("Login type must be email or mobile"));
        String identifier = type == Identifier.EMAIL ? r.email() : r.mobile();
        firstError(Validation.identifierError(type, identifier), Validation.passwordError(r.password()), Validation.nameError(r.fullName()));

        long otpId = otp.requireVerified(identifier, type.wire(), r.otp(), "register");
        if (users.exists(type, identifier)) {
            throw ApiException.conflict("User with this " + r.loginType() + " already exists");
        }
        ResponseEntity<Map<String, Object>> response =
                created(r.fullName(), r.email(), r.mobile(), r.password(), r.loginType(), r.gender(), r.dob(), r.organization());
        otp.spend(otpId);   // single use: the code has done its job
        return response;
    }

    private ResponseEntity<Map<String, Object>> created(String fullName, String email, String mobile, String password,
                                                        String loginType, String gender, String dob, String organization) {
        LocalDate birth = Validation.dateOfBirth(dob).orElse(null);
        long id = users.insert(fullName, Validation.emptyToNull(email), Validation.emptyToNull(mobile),
                encoder.encode(password), loginType, Validation.emptyToNull(gender), birth, Validation.emptyToNull(organization));
        Map<String, Object> user = new LinkedHashMap<>();
        user.put("id", id);
        user.put("fullName", fullName);
        user.put("email", email);
        user.put("mobile", mobile);
        user.put("loginType", loginType);
        user.put("gender", gender);
        user.put("dob", dob);
        user.put("organization", organization);
        String token = jwt.issue(new AuthUser(id, fullName, email, mobile));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("token", token, "user", user));
    }

    // ---------- sign in ----------

    @PostMapping("/auth/login")
    public Map<String, Object> login(@RequestBody LoginRequest r) {
        if (isEmpty(r.password()) || isEmpty(r.loginType())) {
            throw ApiException.badRequest("Password and login type are required");
        }
        Identifier by = "email".equals(r.loginType()) ? Identifier.EMAIL : Identifier.MOBILE;
        String value = by == Identifier.EMAIL ? r.email() : r.mobile();
        if (isEmpty(value)) throw ApiException.badRequest(by.wire() + " is required");

        UserRepository.UserRow user = users.findBy(by, value)
                .orElseThrow(() -> ApiException.unauthorized("User not found. Please register first."));
        if (!encoder.matches(r.password(), user.passwordHash())) {
            throw ApiException.unauthorized("Invalid password");
        }
        return session(user);
    }

    @PostMapping("/auth/login-otp")
    public Map<String, Object> loginWithOtp(@RequestBody LoginOtpRequest r) {
        if (isEmpty(r.loginType()) || isEmpty(r.otp())) {
            throw ApiException.badRequest("Login type and OTP are required");
        }
        Identifier by = Identifier.of(r.loginType())
                .orElseThrow(() -> ApiException.badRequest("Login type must be email or mobile"));
        String identifier = by == Identifier.EMAIL ? r.email() : r.mobile();
        if (isEmpty(identifier)) throw ApiException.badRequest(r.loginType() + " is required");

        long otpId = otp.requireVerified(identifier, by.wire(), r.otp(), "login");
        UserRepository.UserRow user = users.findBy(by, identifier)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        otp.spend(otpId);   // a verified code must not log anyone in a second time
        return session(user);
    }

    private Map<String, Object> session(UserRepository.UserRow user) {
        Map<String, Object> u = new LinkedHashMap<>();
        u.put("id", user.id());
        u.put("fullName", user.fullName());
        u.put("email", user.email());
        u.put("mobile", user.mobile());
        u.put("loginType", user.loginType());
        String token = jwt.issue(new AuthUser(user.id(), user.fullName(), user.email(), user.mobile()));
        return Map.of("token", token, "user", u);
    }

    // ---------- current user ----------

    @GetMapping("/auth/me")
    public Map<String, Object> me(@AuthenticationPrincipal AuthUser principal) {
        UserRepository.UserRow u = users.findById(principal.id()).orElseThrow(() -> ApiException.notFound("User not found"));
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", u.id());
        body.put("fullName", u.fullName());
        body.put("email", u.email());
        body.put("mobile", u.mobile());
        body.put("loginType", u.loginType());
        body.put("gender", u.gender());
        body.put("dob", u.dob() == null ? null : u.dob().toString());
        body.put("organization", u.organization());
        body.put("avatar", isEmpty(u.avatar()) ? null : u.avatar());
        body.put("createdAt", u.createdAt());
        return body;
    }

    @PostMapping("/auth/change-password")
    public Map<String, Object> changePassword(@AuthenticationPrincipal AuthUser principal, @RequestBody ChangePasswordRequest r) {
        if (r.newPassword() == null || r.newPassword().length() < 6) {
            throw ApiException.badRequest("New password must be at least 6 characters");
        }
        UserRepository.UserRow user = users.findById(principal.id()).orElseThrow(() -> ApiException.notFound("User not found"));
        String current = r.currentPassword() == null ? "" : r.currentPassword();
        if (!encoder.matches(current, user.passwordHash())) {
            throw ApiException.badRequest("Current password is incorrect");
        }
        users.updatePasswordHash(user.id(), encoder.encode(r.newPassword()));
        return Map.of("ok", true);
    }

    private static boolean isEmpty(String s) {
        return s == null || s.isEmpty();
    }

    /** Throws for the first validation message that is not null (the order the Node server checked them in). */
    private static void firstError(String... messages) {
        for (String m : messages) {
            if (m != null) throw ApiException.badRequest(m);
        }
    }
}
