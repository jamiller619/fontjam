CREATE VIEW recentlyAdded AS
SELECT
  *
FROM
  families
WHERE
  date(createdAt, 'unixepoch') > date('now', '-7 days')