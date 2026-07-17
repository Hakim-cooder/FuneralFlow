-- Keep review timestamps fresh when a rating is edited
create or replace function set_reviews_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_reviews_updated_at on reviews;
create trigger trg_reviews_updated_at
before update on reviews
for each row
execute function set_reviews_updated_at();
