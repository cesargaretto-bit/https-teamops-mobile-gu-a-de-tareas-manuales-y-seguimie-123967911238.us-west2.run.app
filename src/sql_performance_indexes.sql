-- Performance indexes for Daily Ops Mobile
--
-- Every table follows the same shape: { id text primary key, payload jsonb,
-- updated_at timestamptz }. The app loads each table once on startup with:
--   supabase.from(table).select('payload').order('updated_at', { ascending: false })
-- Without an index on updated_at, Postgres has to do a full sequential scan
-- and sort that column from scratch on every single load — for every user,
-- every time they open the app or refresh. This adds a btree index on
-- updated_at for each table so that ordering is served directly from the
-- index instead of a full table sort. Safe to run multiple times.
--
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query).

do $$
declare
  tbl text;
begin
  foreach tbl in array array['tasks', 'collaborators', 'countries', 'roles', 'departments', 'statuses', 'locations']
  loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = tbl) then
      execute format('create index if not exists idx_%I_updated_at on %I (updated_at desc);', tbl, tbl);
    end if;
  end loop;
end $$;

-- Extra: tasks are also frequently filtered client-side by assigned
-- collaborator and by due date (Guía de Tareas, Panel Admin, Reportes).
-- These are stored inside the jsonb payload, not as real columns, so a plain
-- btree index can't target them directly. A GIN index on the payload lets
-- Postgres use jsonb containment/path queries efficiently if/when the app
-- moves any of that filtering server-side in the future. Cheap to have now,
-- and immediately useful if a future filter (e.g. "assigned to me") gets
-- pushed into the query instead of being done in the browser.
create index if not exists idx_tasks_payload_gin on tasks using gin (payload);
