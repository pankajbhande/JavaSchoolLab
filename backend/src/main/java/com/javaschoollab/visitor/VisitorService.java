package com.javaschoollab.visitor;

import java.util.List;
import org.springframework.stereotype.Service;

/** The page-load counter; a missing row reads as zero. */
@Service
public class VisitorService {

    private final VisitorRepository repo;

    public VisitorService(VisitorRepository repo) {
        this.repo = repo;
    }

    public long increment() {
        repo.increment();
        return count();
    }

    public long count() {
        List<Long> rows = repo.count();
        return rows.isEmpty() ? 0L : rows.get(0);
    }
}
