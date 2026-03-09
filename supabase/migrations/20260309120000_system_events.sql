-- System health logging: store operational events (e.g. eval fallback, retrieval errors)
-- for admin visibility on /admin/system-health.
create table if not exists system_events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  route text not null,
  event_type text not null,
  severity text not null check (severity in ('info', 'warn', 'error')),
  agent_id uuid,
  message text not null,
  metadata jsonb
);
