-- Rename top_picks table to obsessions
ALTER TABLE top_picks RENAME TO obsessions;

-- Rename foreign key constraints
ALTER TABLE obsessions RENAME CONSTRAINT top_picks_product_id_fkey TO obsessions_product_id_fkey;
ALTER TABLE obsessions RENAME CONSTRAINT top_picks_user_id_fkey TO obsessions_user_id_fkey;

-- Rename RLS policies (drop and recreate with new names)
-- List existing policies first: SELECT policyname FROM pg_policies WHERE tablename = 'obsessions';
-- Adjust these names to match your actual policy names:

DO $$
DECLARE
  pol RECORD;
  pol_def TEXT;
BEGIN
  FOR pol IN
    SELECT policyname, pg_get_expr(polqual, polrelid) AS using_expr,
           pg_get_expr(polwithcheck, polrelid) AS check_expr,
           CASE polcmd
             WHEN 'r' THEN 'SELECT'
             WHEN 'a' THEN 'INSERT'
             WHEN 'w' THEN 'UPDATE'
             WHEN 'd' THEN 'DELETE'
             WHEN '*' THEN 'ALL'
           END AS command,
           CASE polpermissive WHEN TRUE THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END AS permissive,
           (SELECT string_agg(rolname, ', ') FROM pg_roles WHERE oid = ANY(polroles)) AS roles
    FROM pg_policy
    WHERE polrelid = 'public.obsessions'::regclass
  LOOP
    -- Rename policy by replacing 'top_picks' with 'obsessions' in the name
    IF pol.policyname LIKE '%top_picks%' THEN
      EXECUTE format(
        'ALTER POLICY %I ON obsessions RENAME TO %I',
        pol.policyname,
        replace(pol.policyname, 'top_picks', 'obsessions')
      );
    END IF;
  END LOOP;
END $$;

-- Rename indexes (if any exist with top_picks in the name)
DO $$
DECLARE
  idx RECORD;
BEGIN
  FOR idx IN
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'obsessions' AND indexname LIKE '%top_picks%'
  LOOP
    EXECUTE format(
      'ALTER INDEX %I RENAME TO %I',
      idx.indexname,
      replace(idx.indexname, 'top_picks', 'obsessions')
    );
  END LOOP;
END $$;
