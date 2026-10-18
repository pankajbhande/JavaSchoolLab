package com.javaschoollab.content;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

/** A data set file that no longer matches its manifest hash must be refused. */
class DatasetIntegrityTest {

    private final DatasetService service = new DatasetService(new ObjectMapper());

    @Test
    void tamperedBytesAreRejected() {
        byte[] good = "[1,2,3]".getBytes(StandardCharsets.UTF_8);
        ContentService.Item item = new ContentService.Item("x", "x", "x.json", ContentService.sha256(good));
        assertArrayEquals(good, service.verified(item, good));
        byte[] tampered = good.clone();
        tampered[1] ^= 1;
        assertThrows(ContentService.IntegrityException.class, () -> service.verified(item, tampered));
    }
}
