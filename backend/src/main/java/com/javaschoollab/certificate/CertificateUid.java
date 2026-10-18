package com.javaschoollab.certificate;

import java.security.SecureRandom;
import java.util.regex.Pattern;

/** Certificate ids such as JSL-7K3M-Q9XD-4HTB. Same format and alphabet as the Node server. */
public final class CertificateUid {

    // Crockford base32: no I, L, O or U, so an id read aloud or typed from paper can't be misread.
    private static final String ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();
    // Every id ever issued (including the older timestamp format): JSL-<letters, digits, dashes>.
    private static final Pattern VALID = Pattern.compile("^JSL-[A-Za-z0-9-]{4,60}$");

    private CertificateUid() {}

    /** 12 characters from a CSPRNG (60 bits): ids can't be guessed or counted, which matters now that verification is public. */
    public static String generate() {
        byte[] bytes = new byte[12];
        RANDOM.nextBytes(bytes);
        StringBuilder chars = new StringBuilder(12);
        for (byte b : bytes) chars.append(ALPHABET.charAt((b & 0xff) % 32));
        return "JSL-" + chars.substring(0, 4) + "-" + chars.substring(4, 8) + "-" + chars.substring(8, 12);
    }

    /** Anything else is rejected before it touches the database. */
    public static boolean isValid(String value) {
        return value != null && VALID.matcher(value).matches();
    }
}
