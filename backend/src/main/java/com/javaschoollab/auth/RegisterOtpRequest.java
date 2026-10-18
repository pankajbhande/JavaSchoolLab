package com.javaschoollab.auth;

public record RegisterOtpRequest(String fullName, String email, String mobile, String password, String loginType, String otp, String gender, String dob, String organization) {}
