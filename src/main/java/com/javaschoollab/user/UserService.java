package com.javaschoollab.user;

import java.time.LocalDate;
import java.util.Optional;
import org.springframework.stereotype.Service;

/** The users service: the only way other packages read or change an account. */
@Service
public class UserService implements com.javaschoollab.security.TokenCutoffs {

    private final UserRepository users;

    public UserService(UserRepository users) {
        this.users = users;
    }

    public boolean exists(Identifier by, String value) {
        return users.exists(by, value);
    }

    public Optional<UserRow> findBy(Identifier by, String value) {
        return users.findBy(by, value);
    }

    public Optional<UserRow> findById(long id) {
        return users.findById(id);
    }

    public long insert(String fullName, String email, String mobile, String passwordHash, String loginType,
                       String gender, LocalDate dob, String organization) {
        return users.insert(fullName, email, mobile, passwordHash, loginType, gender, dob, organization);
    }

    @Override
    public Optional<java.time.Instant> tokensValidFrom(long id) {
        return users.tokensValidFrom(id);
    }

    @Override
    public void revokeTokens(long id, java.time.Instant from) {
        users.revokeTokens(id, from);
    }

    public void updatePasswordHash(long id, String hash) {
        users.updatePasswordHash(id, hash);
    }

    public void updateProfile(long id, String fullName, String gender, LocalDate dob, String organization) {
        users.updateProfile(id, fullName, gender, dob, organization);
    }

    /** null removes the photo. */
    public void setAvatar(long id, String dataUrl) {
        users.setAvatar(id, dataUrl);
    }
}
