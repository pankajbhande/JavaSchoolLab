package com.javaschoollab.account;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.security.AuthUser;
import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** The signed-in user's own data: GET /api/account/export (a download) and DELETE /api/account (the e-mail typed as confirmation). */
@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AccountService account;

    public AccountController(AccountService account) {
        this.account = account;
    }

    @GetMapping("/export")
    public ResponseEntity<Map<String, Object>> export(@AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header("Content-Disposition", "attachment; filename=\"javaschoollab-my-data.json\"")
                .body(account.export(user.id()));
    }

    @DeleteMapping
    public Map<String, Object> delete(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        account.delete(user.id(), body.hasNonNull("confirm") ? body.get("confirm").asText() : null);
        return Map.of("ok", true);
    }
}
