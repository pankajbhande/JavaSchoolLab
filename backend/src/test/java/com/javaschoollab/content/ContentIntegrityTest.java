package com.javaschoollab.content;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

/** A course file that no longer matches its manifest hash must be refused, not served. */
class ContentIntegrityTest {

    private final ContentService service = new ContentService(new ObjectMapper());

    @Test
    void tamperedBytesAreRejectedAndGoodBytesPass() {
        byte[] good = "{\"id\":\"x\"}".getBytes(StandardCharsets.UTF_8);
        ContentService.Item item = new ContentService.Item("x", "X", "courses/x.json", ContentService.sha256(good));

        assertArrayEquals(good, service.verified(item, good));

        byte[] tampered = good.clone();
        tampered[2] ^= 1;
        ContentService.IntegrityException e = assertThrows(ContentService.IntegrityException.class, () -> service.verified(item, tampered));
        assertTrue(e.getMessage().contains("courses/x.json"));
    }
}
