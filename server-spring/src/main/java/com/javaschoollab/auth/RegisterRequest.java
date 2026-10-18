package com.javaschoollab.auth;

public record RegisterRequest(String fullName, String email, String mobile, String password, String loginType, String gender, String dob, String organization) {}
