-- Backfill session_services from existing selected_services data on funeral_requests
insert into session_services (session_id, service_id, name, price)
select
  fs.id,
  case
    when nullif(item->>'service_id', '') is null then null
    else (item->>'service_id')::uuid
  end as service_id,
  coalesce(nullif(item->>'name', ''), s.name, 'Service') as name,
  coalesce((nullif(item->>'price', '')::numeric(12,2)), s.price, 0) as price
from funeral_sessions fs
join funeral_requests fr on fr.id = fs.request_id
cross join jsonb_array_elements(coalesce(fr.selected_services, '[]'::jsonb)) as item
left join services s on s.id = (case when nullif(item->>'service_id', '') is null then null else (item->>'service_id')::uuid end)
where case
  when nullif(item->>'service_id', '') is null then null
  else (item->>'service_id')::uuid
end is not null
  and not exists (
    select 1
    from session_services ss
    where ss.session_id = fs.id
      and ss.service_id = (case when nullif(item->>'service_id', '') is null then null else (item->>'service_id')::uuid end)
  );
