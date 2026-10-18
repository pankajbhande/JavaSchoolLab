package com.javaschoollab.profile;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.auth.ApiException;
import com.javaschoollab.auth.UserRepository;
import com.javaschoollab.auth.Validation;
import com.javaschoollab.security.AuthUser;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Editing your own details and photo. (Public profile pages and their settings are a later port.) */
@RestController
public class ProfileController {

    private final UserRepository users;

    public ProfileController(UserRepository users) {
        this.users = users;
    }

    @PatchMapping("/api/auth/profile")
    public Map<String, Object> update(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        String fullName = text(body, "fullName").trim();
        if (fullName.length() < 2 || fullName.length() > 100) {
            throw ApiException.badRequest("Name must be 2-100 characters");
        }
        String gender = text(body, "gender").isEmpty() ? null : cut(text(body, "gender"), 20);
        String organization = text(body, "organization").isEmpty() ? null : cut(text(body, "organization").trim(), 150);
        // Only a real YYYY-MM-DD calendar date is stored; anything else clears it.
        var dob = Validation.dateOfBirth(text(body, "dob")).orElse(null);
        users.updateProfile(user.id(), fullName, gender, dob, organization);
        return Map.of("ok", true);
    }

    @PutMapping("/api/profile/avatar")
    public ResponseEntity<Map<String, Object>> setAvatar(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        JsonNode image = body.get("image");
        String problem = AvatarValidator.error(image != null && image.isTextual() ? image.asText() : null);
        if (problem != null) throw ApiException.badRequest(problem);
        users.setAvatar(user.id(), image.asText());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("avatar", image.asText());
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(out);
    }

    @DeleteMapping("/api/profile/avatar")
    public ResponseEntity<Map<String, Object>> removeAvatar(@AuthenticationPrincipal AuthUser user) {
        users.setAvatar(user.id(), null);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("avatar", null);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(out);
    }

    /** String(body?.field ?? '') for a scalar field. */
    private static String text(JsonNode body, String field) {
        JsonNode n = body.get(field);
        return n == null || n.isNull() ? "" : n.asText();
    }

    private static String cut(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max);
    }
}
