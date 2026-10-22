package com.javaschoollab.auth;

import com.javaschoollab.common.ApiException;
import com.javaschoollab.common.RateLimiter;
import com.javaschoollab.common.RateLimiters;
import com.javaschoollab.config.AppProperties;
import java.util.Locale;
import java.util.OptionalLong;
import org.springframework.stereotype.Component;

/**
 * Brute-force protection for the routes that need no login: password sign-in, sending a one-time code and checking one.
 * Every action is limited twice: per client address (one attacker, many accounts) and per account (many addresses, one account).
 * The address limit is 10 times the account limit, so a classroom or office behind one shared address is not locked out.
 * Redis-backed when REDIS_ENABLED=true, so the limits are shared by every app server and survive a restart.
 */
@Component
public class AuthGuard {

    private final RateLimiter loginByIp;
    private final RateLimiter loginByAccount;
    private final RateLimiter sendByIp;
    private final RateLimiter sendByAccount;
    private final RateLimiter verifyByIp;
    private final RateLimiter verifyByAccount;

    public AuthGuard(RateLimiters limiters, AppProperties props) {
        AppProperties.RateLimit r = props.rateLimit();
        this.loginByIp = limiters.perMinute("login-ip", r.loginPerMinute() * 10);
        this.loginByAccount = limiters.perMinute("login-acct", r.loginPerMinute());
        this.sendByIp = limiters.perMinute("otp-send-ip", r.otpSendPerMinute() * 10);
        this.sendByAccount = limiters.perMinute("otp-send-acct", r.otpSendPerMinute());
        this.verifyByIp = limiters.perMinute("otp-verify-ip", r.otpVerifyPerMinute() * 10);
        this.verifyByAccount = limiters.perMinute("otp-verify-acct", r.otpVerifyPerMinute());
    }

    /** Password sign-in, registration. */
    public void login(String clientAddress, String account) {
        enforce(loginByIp, clientAddress);
        enforce(loginByAccount, normalise(account));
    }

    /** Sending a one-time code. */
    public void sendOtp(String clientAddress, String account) {
        enforce(sendByIp, clientAddress);
        enforce(sendByAccount, normalise(account));
    }

    /** Checking (or spending) a one-time code: this is what stops the 6-digit code from being guessed. */
    public void verifyOtp(String clientAddress, String account) {
        enforce(verifyByIp, clientAddress);
        enforce(verifyByAccount, normalise(account));
    }

    private static void enforce(RateLimiter limiter, String key) {
        OptionalLong wait = limiter.check(key);
        if (wait.isPresent()) throw ApiException.tooManyRequests(wait.getAsLong());
    }

    private static String normalise(String account) {
        return account == null ? "-" : account.trim().toLowerCase(Locale.ROOT);
    }
}
