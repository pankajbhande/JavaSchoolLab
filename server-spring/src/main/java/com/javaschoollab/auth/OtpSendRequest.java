package com.javaschoollab.auth;

public record OtpSendRequest(String identifier, String identifierType, String purpose) {}
