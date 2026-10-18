package com.javaschoollab.auth;

/** A signed-in session: the token plus the account fields the response echoes (gender, dob, organization only after registering). */
public record AuthSession(String token, long id, String fullName, String email, String mobile, String loginType,
                          String gender, String dob, String organization) {}
