-- Data migration for the "retours test site" changes.
-- Append to the generated migration (prisma migrate dev --create-only), after the schema statements.

-- Legacy timezone slugs -> IANA identifiers
UPDATE "users" SET "timezone" = 'Europe/Paris'        WHERE "timezone" = 'europe_paris';
UPDATE "users" SET "timezone" = 'Europe/London'       WHERE "timezone" = 'europe_london';
UPDATE "users" SET "timezone" = 'America/New_York'    WHERE "timezone" = 'america_new_york';
UPDATE "users" SET "timezone" = 'America/Los_Angeles' WHERE "timezone" = 'america_los_angeles';
UPDATE "users" SET "timezone" = 'America/Toronto'     WHERE "timezone" IS NULL;
