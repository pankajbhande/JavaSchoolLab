package com.javaschoollab.profile;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.common.ApiException;
import com.javaschoollab.user.UserService;
import com.javaschoollab.user.Validation;
import org.springframework.stereotype.Service;

/** The rules for editing your own details and photo. */
@Service
public class ProfileService {

    private final UserService users;

    public ProfileService(UserService users) {
        this.users = users;
    }

    public void update(long userId, JsonNode body) {
        String fullName = text(body, "fullName").trim();
        if (fullName.length() < 2 || fullName.length() > 100) {
            throw ApiException.badRequest("Name must be 2-100 characters");
        }
        String gender = text(body, "gender").isEmpty() ? null : cut(text(body, "gender"), 20);
        String organization = text(body, "organization").isEmpty() ? null : cut(text(body, "organization").trim(), 150);
        // Only a real YYYY-MM-DD calendar date is stored; anything else clears it.
        var dob = Validation.dateOfBirth(text(body, "dob")).orElse(null);
        users.updateProfile(userId, fullName, gender, dob, organization);
    }

    /** Validates and stores the photo (a data URL); returns what was stored. */
    public String setAvatar(long userId, JsonNode body) {
        JsonNode image = body.get("image");
        String problem = AvatarValidator.error(image != null && image.isTextual() ? image.asText() : null);
        if (problem != null) throw ApiException.badRequest(problem);
        users.setAvatar(userId, image.asText());
        return image.asText();
    }

    public void removeAvatar(long userId) {
        users.setAvatar(userId, null);
    }

    /** String(body?.field ?? '') for a scalar field. */
    private static String text(JsonNode body, String field) {
        JsonNode n = body.get(field);
        return n == null || n.isNull() ? "" : n.asText();
    }

    private static String cut(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max);
    }
}
