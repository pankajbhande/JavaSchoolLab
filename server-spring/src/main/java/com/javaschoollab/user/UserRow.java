package com.javaschoollab.user;

import java.time.Instant;
import java.time.LocalDate;

/** One row of the users table as the rest of the application sees it. */
public record UserRow(long id, String fullName, String email, String mobile, String passwordHash,
                      String loginType, String gender, LocalDate dob, String organization,
                      String avatar, Instant createdAt) {}
