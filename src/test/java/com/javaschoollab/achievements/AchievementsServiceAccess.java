package com.javaschoollab.achievements;

/** Test-only window onto the package-private level rules. */
public final class AchievementsServiceAccess {
    private AchievementsServiceAccess() {}

    public static String levelName(int xp) {
        return AchievementsService.levelFor(xp).name();
    }
}
