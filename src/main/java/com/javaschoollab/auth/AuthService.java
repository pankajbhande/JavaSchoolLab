package com.javaschoollab.auth;

import com.javaschoollab.common.ApiException;
import com.javaschoollab.security.AuthUser;
import com.javaschoollab.security.JwtService;
import com.javaschoollab.user.Identifier;
import com.javaschoollab.user.UserRow;
import com.javaschoollab.user.UserService;
import com.javaschoollab.user.Validation;
import java.time.LocalDate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/** The sign-up and sign-in rules: validation order, duplicate checks, password and OTP checks, token issue. */
@Service
public class AuthService {

    private final UserService users;
    private final OtpService otp;
    private final JwtService jwt;
    private final PasswordEncoder encoder;
    private final GoogleTokenVerifier google;

    public AuthService(UserService users, OtpService otp, JwtService jwt, PasswordEncoder encoder, GoogleTokenVerifier google) {
        this.google = google;
        this.users = users;
        this.otp = otp;
        this.jwt = jwt;
        this.encoder = encoder;
    }

    public AuthSession register(RegisterRequest r) {
        if (isEmpty(r.fullName()) || isEmpty(r.password()) || isEmpty(r.loginType())) {
            throw ApiException.badRequest("Full name, password, and login type are required");
        }
        Identifier type = Identifier.emailOnly(r.loginType());
        String value = type == Identifier.EMAIL ? r.email() : r.mobile();
        firstError(Validation.identifierError(type, value), Validation.passwordError(r.password()), Validation.nameError(r.fullName()));

        if (users.exists(type, value)) {
            throw ApiException.conflict("User with this " + type.wire() + " already exists");
        }
        return create(r.fullName(), r.email(), r.mobile(), r.password(), r.loginType(), r.gender(), r.dob(), r.organization());
    }

    public AuthSession registerWithOtp(RegisterOtpRequest r) {
        if (isEmpty(r.fullName()) || isEmpty(r.password()) || isEmpty(r.loginType()) || isEmpty(r.otp())) {
            throw ApiException.badRequest("All fields are required");
        }
        Identifier type = Identifier.emailOnly(r.loginType());
        String identifier = type == Identifier.EMAIL ? r.email() : r.mobile();
        firstError(Validation.identifierError(type, identifier), Validation.passwordError(r.password()), Validation.nameError(r.fullName()));

        long otpId = otp.requireVerified(identifier, type.wire(), r.otp(), "register");
        if (users.exists(type, identifier)) {
            throw ApiException.conflict("User with this " + r.loginType() + " already exists");
        }
        AuthSession session =
                create(r.fullName(), r.email(), r.mobile(), r.password(), r.loginType(), r.gender(), r.dob(), r.organization());
        otp.spend(otpId);   // single use: the code has done its job
        return session;
    }

    public AuthSession login(LoginRequest r) {
        if (isEmpty(r.password()) || isEmpty(r.loginType())) {
            throw ApiException.badRequest("Password and login type are required");
        }
        Identifier by = Identifier.emailOnly(r.loginType());
        String value = by == Identifier.EMAIL ? r.email() : r.mobile();
        if (isEmpty(value)) throw ApiException.badRequest(by.wire() + " is required");

        UserRow user = users.findBy(by, value)
                .orElseThrow(() -> ApiException.unauthorized("User not found. Please register first."));
        if (!encoder.matches(r.password(), user.passwordHash())) {
            throw ApiException.unauthorized("Invalid password");
        }
        return sessionFor(user);
    }

    public AuthSession loginWithOtp(LoginOtpRequest r) {
        if (isEmpty(r.loginType()) || isEmpty(r.otp())) {
            throw ApiException.badRequest("Login type and OTP are required");
        }
        Identifier by = Identifier.emailOnly(r.loginType());
        String identifier = by == Identifier.EMAIL ? r.email() : r.mobile();
        if (isEmpty(identifier)) throw ApiException.badRequest(r.loginType() + " is required");

        long otpId = otp.requireVerified(identifier, by.wire(), r.otp(), "login");
        UserRow user = users.findBy(by, identifier)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        otp.spend(otpId);   // a verified code must not log anyone in a second time
        return sessionFor(user);
    }

    /**
     * "Continue with Google": Google has already proved the email address, so there is no password or code to check.
     * Someone with no account yet gets one (its password is random and unknown to everyone); someone who already has
     * an account with that email is signed in to it.
     */
    public AuthSession loginWithGoogle(GoogleLoginRequest r) {
        if (r == null || isEmpty(r.credential())) throw ApiException.badRequest("Google credential is required");
        GoogleProfile profile = google.verify(r.credential());
        UserRow existing = users.findBy(Identifier.EMAIL, profile.email()).orElse(null);
        if (existing != null) return sessionFor(existing);
        String unusableSecret = java.util.UUID.randomUUID().toString();   // bcrypt accepts at most 72 bytes
        return create(profile.name(), profile.email(), null, unusableSecret, "email", null, null, null);
    }

    public String googleClientId() {
        return google.clientId();
    }

    public UserRow currentUser(long id) {
        return users.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
    }

    public void changePassword(long id, ChangePasswordRequest r) {
        if (r.newPassword() == null || r.newPassword().length() < 6) {
            throw ApiException.badRequest("New password must be at least 6 characters");
        }
        UserRow user = currentUser(id);
        String current = r.currentPassword() == null ? "" : r.currentPassword();
        if (!encoder.matches(current, user.passwordHash())) {
            throw ApiException.badRequest("Current password is incorrect");
        }
        users.updatePasswordHash(user.id(), encoder.encode(r.newPassword()));
    }

    private AuthSession create(String fullName, String email, String mobile, String password,
                               String loginType, String gender, String dob, String organization) {
        LocalDate birth = Validation.dateOfBirth(dob).orElse(null);
        long id = users.insert(fullName, Validation.emptyToNull(email), Validation.emptyToNull(mobile),
                encoder.encode(password), loginType, Validation.emptyToNull(gender), birth, Validation.emptyToNull(organization));
        String token = jwt.issue(new AuthUser(id, fullName, email, mobile));
        return new AuthSession(token, id, fullName, email, mobile, loginType, gender, dob, organization);
    }

    private AuthSession sessionFor(UserRow user) {
        String token = jwt.issue(new AuthUser(user.id(), user.fullName(), user.email(), user.mobile()));
        return new AuthSession(token, user.id(), user.fullName(), user.email(), user.mobile(), user.loginType(), null, null, null);
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
