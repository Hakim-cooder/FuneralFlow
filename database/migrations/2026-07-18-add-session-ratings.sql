-- Add aggregate rating fields to services for quick display on the catalog
alter table services
  add column if not exists rating numeric(3,2) default 0,
  add column if not exists review_count integer default 0;

create index if not exists idx_services_rating on services(rating);
