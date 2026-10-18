package com.javaschoollab.auth;

public record ChangePasswordRequest(String currentPassword, String newPassword) {}
