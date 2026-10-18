// Some topic and course ids across the course data are raw display names
// ("Control Statements in Java") rather than clean slugs ("arraylist"). This turns any id
// into a URL-safe segment (spaces -> underscores) purely for the address bar, without
// touching the underlying id used everywhere else (state, visitedTopics, data lookups).
export const slugify = (id: string) => id.trim().replace(/\s+/g, '_');
