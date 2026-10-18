package com.javaschoollab.profile;

import com.fasterxml.jackson.databind.JsonNode;
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

/** HTTP for editing your own details and photo. */
@RestController
public class ProfileController {

    private final ProfileService profiles;

    public ProfileController(ProfileService profiles) {
        this.profiles = profiles;
    }

    @PatchMapping("/api/auth/profile")
    public Map<String, Object> update(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        profiles.update(user.id(), body);
        return Map.of("ok", true);
    }

    @PutMapping("/api/profile/avatar")
    public ResponseEntity<Map<String, Object>> setAvatar(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        return avatar(profiles.setAvatar(user.id(), body));
    }

    @DeleteMapping("/api/profile/avatar")
    public ResponseEntity<Map<String, Object>> removeAvatar(@AuthenticationPrincipal AuthUser user) {
        profiles.removeAvatar(user.id());
        return avatar(null);
    }

    private static ResponseEntity<Map<String, Object>> avatar(String value) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("avatar", value);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(out);
    }
}
