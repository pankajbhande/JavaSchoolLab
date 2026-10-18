/**
 * The profile service: a learner's own details and photo, and the opt-in public profile page.
 *
 * <p>Editing (PATCH /api/auth/profile, PUT/DELETE /api/profile/avatar) goes through {@code ProfileService} and the
 * {@code user} service, which owns the {@code users} table. The public profile (GET /api/profiles/{handle} and
 * /api/profile/settings) is {@code PublicProfileService} over {@code ProfileSettingsRepository}, which owns the
 * {@code user_profiles} table. A profile shows nothing until its owner switches a section on; what may leave the server is
 * decided in one place, {@code PublicProfiles.build}, which never receives email, mobile, date of birth or ids.
 *
 * <p>Uses the {@code user}, {@code certificate}, {@code progress} and {@code quiz} services, only through their
 * {@code *Service} classes.
 */
package com.javaschoollab.profile;
