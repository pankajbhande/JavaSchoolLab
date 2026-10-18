package com.javaschoollab.auth;

/** The ID token ("credential") that Google Identity Services hands to the browser after the learner picks an account. */
public record GoogleLoginRequest(String credential) {}
