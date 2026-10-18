package com.javaschoollab.auth;

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

    public OtpController(OtpService otp) {
        this.otp = otp;
    }

    @PostMapping("/send")
    public Map<String, Object> send(@RequestBody OtpSendRequest r) {
        return otp.send(r.identifier(), r.identifierType(), r.purpose());
    }

    @PostMapping("/verify")
    public Map<String, Object> verify(@RequestBody OtpVerifyRequest r) {
        return otp.verify(r.identifier(), r.identifierType(), r.otp(), r.purpose());
    }
}
