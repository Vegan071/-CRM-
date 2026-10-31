-- This is an empty migration.
CREATE UNIQUE INDEX "user_email_lower_unique"
    ON "user" (LOWER(email));