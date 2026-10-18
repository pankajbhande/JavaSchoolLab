package com.javaschoollab.auth;

public record OtpVerifyRequest(String identifier, String identifierType, String otp, String purpose) {}
