-- Recover session-based review support for services rated during a funeral session
alter table reviews
  add column if not exists session_id uuid references funeral_sessions(id) on delete cascade,
  add column if not exists created_by uuid references users(id),
  add column if not exists updated_at timestamptz default now();

create index if not exists idx_reviews_session on reviews(session_id);
create index if not exists idx_reviews_created_by on reviews(created_by);
