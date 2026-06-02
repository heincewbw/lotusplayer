-- Migration: replace ambil + sisa columns with a single pl (profit/loss) column
-- Existing data is preserved: pl = sisa - ambil

-- Step 1: add the new column
ALTER TABLE SessionEntry ADD COLUMN pl INT NOT NULL DEFAULT 0;

-- Step 2: migrate existing data
UPDATE SessionEntry SET pl = sisa - ambil;

-- Step 3: drop the legacy columns
ALTER TABLE SessionEntry DROP COLUMN ambil;
ALTER TABLE SessionEntry DROP COLUMN sisa;
