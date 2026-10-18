/**
 * The leaderboard service: ranks learners by XP and shows the top 20 plus the viewer's own place. It owns no table; its
 * repository is a deliberate read-only aggregate over users, topic_progress, quiz_attempts and study_days. It uses the
 * progress service for the XP formula.
 */
package com.javaschoollab.leaderboard;
