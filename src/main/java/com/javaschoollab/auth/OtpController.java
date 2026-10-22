package com.javaschoollab.auth;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** HTTP for the one-time codes: send and verify. */
@RestController
@RequestMapping("/api/otp")
public class OtpController {

    private final OtpService otp;
    private final AuthGuard guard;

    public OtpController(OtpService otp, AuthGuard guard) {
        this.otp = otp;
        this.guard = guard;
    }

    @PostMapping("/send")
    public Map<String, Object> send(@RequestBody OtpSendRequest r, HttpServletRequest request) {
        guard.sendOtp(request.getRemoteAddr(), r.identifier());
        return otp.send(r.identifier(), r.identifierType(), r.purpose());
    }

    @PostMapping("/verify")
    public Map<String, Object> verify(@RequestBody OtpVerifyRequest r, HttpServletRequest request) {
        guard.verifyOtp(request.getRemoteAddr(), r.identifier());
        return otp.verify(r.identifier(), r.identifierType(), r.otp(), r.purpose());
    }
}
