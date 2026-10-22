package com.javaschoollab.account;

import com.javaschoollab.common.ApiException;
import com.javaschoollab.security.TokenRevocation;
import com.javaschoollab.user.UserRow;
import com.javaschoollab.user.UserService;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Download or delete one's own data. */
@Service
public class AccountService {

    private static final Logger log = LoggerFactory.getLogger(AccountService.class);

    private final UserService users;
    private final AccountRepository repo;
    private final TokenRevocation revocation;

    AccountService(UserService users, AccountRepository repo, TokenRevocation revocation) {
        this.users = users;
        this.repo = repo;
        this.revocation = revocation;
    }

    public Map<String, Object> export(long userId) {
        users.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        return repo.export(userId);
    }

    /**
     * Deletes the account and everything that belongs to it, for good. The caller must type the account's own e-mail address,
     * the usual guard against a mis-click (it works for password and Google accounts alike).
     */
    @Transactional
    public void delete(long userId, String confirmation) {
        UserRow user = users.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        String expected = user.email() != null ? user.email() : user.mobile();
        if (confirmation == null || expected == null || !expected.equalsIgnoreCase(confirmation.trim())) {
            throw ApiException.badRequest("Type your account e-mail address exactly to confirm");
        }
        repo.erase(userId, user.email(), user.mobile());
        revocation.forget(userId);
        log.info("Account {} deleted at the owner's request", userId);
    }
}
