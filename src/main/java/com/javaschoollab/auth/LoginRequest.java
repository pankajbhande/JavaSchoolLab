package com.javaschoollab.auth;

public record LoginRequest(String email, String mobile, String password, String loginType) {}
