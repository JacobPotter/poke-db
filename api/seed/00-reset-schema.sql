-- mock-dump.sql runs CREATE SCHEMA public, which fails on a fresh database
-- (init scripts run with ON_ERROR_STOP=1). Drop the default schema first.
DROP SCHEMA public CASCADE;
