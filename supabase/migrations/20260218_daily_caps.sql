-- Global daily generation counter for cost protection
create table if not exists daily_stats (
  date text primary key,
  free_generations int not null default 0
);

-- Allow service role full access (no RLS needed — server-side only)
alter table daily_stats enable row level security;

-- No policies for anon — this table is only accessed via service role key
