package com.javaschoollab.auth;

public record LoginOtpRequest(String email, String mobile, String loginType, String otp) {}
