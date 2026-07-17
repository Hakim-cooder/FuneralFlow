-- Prevent duplicate service ratings for the same family member and session
create unique index if not exists ux_reviews_service_family_session
  on reviews (service_id, family_member_id, session_id);
