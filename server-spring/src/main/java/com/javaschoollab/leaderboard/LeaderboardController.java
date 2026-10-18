package com.javaschoollab.leaderboard;

import com.javaschoollab.security.AuthUser;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** The leaderboard over HTTP; ranking and name shortening live in {@link LeaderboardService}. */
@RestController
public class LeaderboardController {

    private final LeaderboardService leaderboard;

    public LeaderboardController(LeaderboardService leaderboard) {
        this.leaderboard = leaderboard;
    }

    @GetMapping("/api/leaderboard")
    public Map<String, Object> leaderboard(@AuthenticationPrincipal AuthUser me) {
        Leaderboard board = leaderboard.leaderboard(me.id());
        var top = board.top().stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("rank", r.rank());
            m.put("name", r.name());
            m.put("xp", r.xp());
            m.put("modulesPassed", r.modulesPassed());
            m.put("isMe", r.id() == me.id());
            return m;
        }).toList();

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("top", top);
        out.put("me", board.me() == null ? null : Map.<String, Object>of("rank", board.me().rank(), "xp", board.me().xp()));
        out.put("total", board.total());
        return out;
    }
}
