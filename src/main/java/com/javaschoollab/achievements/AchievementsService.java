package com.javaschoollab.achievements;

import com.javaschoollab.certificate.CertificateService;
import com.javaschoollab.progress.ProgressService;
import com.javaschoollab.progress.ProgressSummary;
import com.javaschoollab.quiz.QuizAttempt;
import com.javaschoollab.quiz.QuizService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.ToIntFunction;
import org.springframework.stereotype.Service;

/**
 * Levels and badges. Everything is worked out from the learner's real activity every time (topics opened, streaks, quizzes, certificates),
 * so it cannot be inflated; the database only remembers when each one was earned so the site can celebrate it once.
 * Levels are named after the forts of the Maratha empire, from Torna, where Shivaji Maharaj took his first fort, up to Raigad, the capital.
 */
@Service
public class AchievementsService {

    static final String INIT = "_init";

    /** What we know about a learner. */
    record Facts(int xp, int topics, int longestStreak, int attempts, int passedModules, int perfectScores, int certificates, int studyHours, int coursesStudied) {}

    record Level(int number, String name, int minXp, String saying) {}

    record Def(String id, String kind, String name, String description, String icon, int target, String message, ToIntFunction<Facts> value) {}

    static final List<Level> LEVELS = List.of(
            new Level(1, "Torna", 0, "Every fort begins with a first step."),
            new Level(2, "Sinhagad", 100, "You are climbing now. Keep going."),
            new Level(3, "Purandar", 300, "Strong foundations. Your skills are taking shape."),
            new Level(4, "Pratapgad", 700, "Courage and consistency, that is how forts are held."),
            new Level(5, "Rajgad", 1500, "You have built something real. Be proud."),
            new Level(6, "Raigad", 3000, "The capital. You have reached the top of the fort."));

    static final List<Def> DEFS;
    static {
        List<Def> d = new ArrayList<>();
        d.add(new Def("first-step", "badge", "First Step", "Open your first topic", "footprints", 1, "You have begun. That is the hardest part, and it is done.", Facts::topics));
        d.add(new Def("curious-10", "badge", "Curious Mind", "Study 10 topics", "lightbulb", 10, "Ten topics in. Your curiosity is turning into skill.", Facts::topics));
        d.add(new Def("explorer-50", "badge", "Explorer", "Study 50 topics", "compass", 50, "Fifty topics! You are exploring like a real developer.", Facts::topics));
        d.add(new Def("scholar-200", "badge", "Scholar", "Study 200 topics", "book", 200, "Two hundred topics. That is real dedication.", Facts::topics));
        d.add(new Def("streak-3", "badge", "Warming Up", "Study 3 days in a row", "flame", 3, "Three days in a row. A habit is starting to form.", Facts::longestStreak));
        d.add(new Def("streak-7", "badge", "On Fire", "Study 7 days in a row", "flame", 7, "A full week without stopping. Most people never do this.", Facts::longestStreak));
        d.add(new Def("streak-30", "badge", "Unstoppable", "Study 30 days in a row", "mountain", 30, "Thirty days. You have proved that you do not give up.", Facts::longestStreak));
        d.add(new Def("first-quiz", "badge", "Test Taker", "Take your first quiz", "clipboard", 1, "You tested yourself. That is how real learning happens.", Facts::attempts));
        d.add(new Def("module-pass", "badge", "Module Master", "Pass your first module quiz", "check", 1, "A module passed. Well earned.", Facts::passedModules));
        d.add(new Def("modules-5", "badge", "Fort Builder", "Pass 5 modules", "castle", 5, "Five modules. Stone by stone, you are building your fort.", Facts::passedModules));
        d.add(new Def("perfect", "badge", "Perfectionist", "Score 100% on a quiz", "star", 1, "A perfect score! Your hard work shows.", Facts::perfectScores));
        d.add(new Def("certified", "badge", "Certified", "Earn your first certificate", "award", 1, "Your first certificate. Show it to the world, you earned it.", Facts::certificates));
        d.add(new Def("hours-1", "badge", "Dedicated", "Study for 1 hour in total", "clock", 1, "An hour of focused learning. Every hour counts.", Facts::studyHours));
        d.add(new Def("hours-10", "badge", "Deeply Focused", "Study for 10 hours in total", "clock", 10, "Ten hours of study. That is serious commitment.", Facts::studyHours));
        d.add(new Def("all-rounder", "badge", "All-Rounder", "Study topics in 3 different courses", "layers", 3, "Three courses and counting. You are becoming well-rounded.", Facts::coursesStudied));
        for (Level l : LEVELS) {
            if (l.number() == 1) continue;        // everyone starts as Torna
            d.add(new Def("level-" + l.number(), "level", "Level " + l.number() + ": " + l.name(), "Reach " + l.minXp() + " XP", "level", l.minXp(), l.saying(), Facts::xp));
        }
        DEFS = List.copyOf(d);
    }

    private final AchievementsRepository repo;
    private final ProgressService progress;
    private final QuizService quiz;
    private final CertificateService certificates;

    AchievementsService(AchievementsRepository repo, ProgressService progress, QuizService quiz, CertificateService certificates) {
        this.repo = repo;
        this.progress = progress;
        this.quiz = quiz;
        this.certificates = certificates;
    }

    private Facts facts(long userId) {
        ProgressSummary s = progress.summary(userId);
        List<QuizAttempt> attempts = quiz.recentAttempts(userId);
        int perfect = (int) attempts.stream().filter(a -> a.percentage() >= 100).count();
        int courses = (int) s.byCourse().values().stream().filter(n -> n != null && n > 0).count();
        return new Facts(s.xp(), s.topicsSeen(), s.longestStreak(), attempts.size(), s.modulesPassed(), perfect,
                certificates.forUser(userId).size(), (int) (s.studySecondsTotal() / 3600), courses);
    }

    static Level levelFor(int xp) {
        Level current = LEVELS.get(0);
        for (Level l : LEVELS) if (xp >= l.minXp()) current = l;
        return current;
    }

    /**
     * The learner's level, every badge with progress, and which badges were earned since the last call (so the site can celebrate each
     * exactly once). The first time a learner is looked at, what they had already earned is recorded quietly, not announced.
     */
    public Map<String, Object> evaluate(long userId) {
        Facts f = facts(userId);
        Map<String, LocalDateTime> had = repo.earned(userId);
        boolean firstLook = !had.containsKey(INIT);

        List<Def> newly = new ArrayList<>();
        for (Def d : DEFS) {
            if (d.value().applyAsInt(f) >= d.target() && !had.containsKey(d.id()) && repo.insert(userId, d.id())) newly.add(d);
        }
        if (firstLook) {
            repo.insert(userId, INIT);
            newly.clear();               // existing progress is not "new"; a brand-new learner has nothing earned yet anyway
        }
        Map<String, LocalDateTime> now = repo.earned(userId);

        List<Map<String, Object>> badges = new ArrayList<>();
        for (Def d : DEFS) {
            if (!"badge".equals(d.kind())) continue;
            badges.add(badge(d, f, now));
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("level", levelInfo(f.xp()));
        out.put("levels", levels(f.xp()));
        out.put("badges", badges);
        out.put("totalEarned", badges.stream().filter(b -> Boolean.TRUE.equals(b.get("earned"))).count());
        out.put("totalBadges", badges.size());
        out.put("newlyEarned", newly.stream().map(this::announcement).toList());
        return out;
    }

    private Map<String, Object> badge(Def d, Facts f, Map<String, LocalDateTime> earned) {
        int value = d.value().applyAsInt(f);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", d.id());
        m.put("name", d.name());
        m.put("description", d.description());
        m.put("icon", d.icon());
        m.put("target", d.target());
        m.put("progress", Math.min(value, d.target()));
        m.put("earned", earned.containsKey(d.id()) || value >= d.target());
        m.put("earnedAt", earned.get(d.id()) == null ? null : earned.get(d.id()).toString());
        return m;
    }

    private Map<String, Object> announcement(Def d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", d.id());
        m.put("kind", d.kind());
        m.put("name", d.name());
        m.put("description", d.description());
        m.put("icon", d.icon());
        m.put("message", d.message());
        return m;
    }

    static Map<String, Object> levelInfo(int xp) {
        Level cur = levelFor(xp);
        Level next = cur.number() < LEVELS.size() ? LEVELS.get(cur.number()) : null;   // list is 0-based, numbers are 1-based
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("number", cur.number());
        m.put("name", cur.name());
        m.put("saying", cur.saying());
        m.put("xp", xp);
        m.put("fromXp", cur.minXp());
        m.put("toXp", next == null ? null : next.minXp());
        m.put("percent", next == null ? 100 : (int) Math.round(100.0 * (xp - cur.minXp()) / (next.minXp() - cur.minXp())));
        m.put("nextName", next == null ? null : next.name());
        m.put("maxed", next == null);
        return m;
    }

    private static List<Map<String, Object>> levels(int xp) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Level l : LEVELS) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("number", l.number());
            m.put("name", l.name());
            m.put("minXp", l.minXp());
            m.put("reached", xp >= l.minXp());
            out.add(m);
        }
        return out;
    }
}
