package com.javaschoollab.notes;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.common.ApiException;
import java.util.List;
import org.springframework.stereotype.Service;

/** Bookmark rules: a topic reference is required, and the display name is cut to 200 characters. */
@Service
public class BookmarkService {

    private final BookmarkRepository repo;

    public BookmarkService(BookmarkRepository repo) {
        this.repo = repo;
    }

    public List<Bookmark> list(long userId) {
        return repo.bookmarks(userId);
    }

    public void add(long userId, JsonNode body) {
        TopicRef ref = TopicRef.from(body);
        if (ref == null) throw ApiException.badRequest("courseId, moduleId and topicId are required");
        repo.addBookmark(userId, ref.courseId(), ref.moduleId(), ref.topicId(), ref.topicName());
    }

    public void remove(long userId, JsonNode body) {
        if (body == null || !TopicRef.present(body.get("courseId")) || !TopicRef.present(body.get("topicId"))) {
            throw ApiException.badRequest("courseId and topicId are required");
        }
        repo.removeBookmark(userId, body.get("courseId").asText(), body.get("topicId").asText());
    }
}
