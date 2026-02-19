-- Add the missing 'tool_type' column
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS tool_type TEXT;

-- Ensure 'result_json' column exists (Rename result_data if it was created incorrectly)
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'diagnostic_results' AND column_name = 'result_data') THEN
    ALTER TABLE diagnostic_results RENAME COLUMN result_data TO result_json;
  END IF;
END $$;

-- Verify the table schema
-- SELECT * FROM diagnostic_results;
