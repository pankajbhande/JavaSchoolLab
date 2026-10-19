package com.javaschoollab.achievements;

import com.javaschoollab.security.AuthUser;
import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/achievements: my level, my badges with progress, and the badges I earned since the last call (to celebrate once). */
@RestController
public class AchievementsController {

    private final AchievementsService achievements;

    public AchievementsController(AchievementsService achievements) {
        this.achievements = achievements;
    }

    @GetMapping("/api/achievements")
    public ResponseEntity<Map<String, Object>> mine(@AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(achievements.evaluate(user.id()));
    }
}
