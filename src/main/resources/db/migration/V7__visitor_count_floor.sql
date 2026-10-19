-- The site already had 1000 visitors before this version. A database that starts from zero (a new server, a restored empty
-- volume) must not show less than that. GREATEST never lowers a counter that is already higher, so a live server that has
-- passed 1000 keeps its own number when this runs.
INSERT INTO visitor_count (id, count) VALUES (1, 1000)
ON DUPLICATE KEY UPDATE count = GREATEST(count, 1000);
