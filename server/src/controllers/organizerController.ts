import { asyncHandler } from '../utils/errors.js';
import { query } from '../config/db.js';
import { AppError } from '../utils/errors.js';
import { getDaysRemaining, getMonthStart } from '../utils/subscriptionDates.js';

export async function getOrganizerProfilePayload(userId: string) {
  const { rows } = await query(
    `
    select
      u.id,
      u.full_name,
      u.email,
      u.phone,
      u.status as account_status,
      o.id as organizer_id,
      o.organizer_identifier,
      o.subscription_status,
      o.payment_phone,
      (
        select s.ends_at
        from subscriptions s
        where s.organizer_id = o.id
          and s.status = 'ACTIVE'
        order by s.ends_at desc
        limit 1
      ) as subscription_ends_at
    from users u
    join organizers o on o.user_id = u.id
    where u.id = $1
    limit 1
    `,
    [userId]
  );

  if (!rows[0]) {
    return null;
  }

  const now = new Date();
  const latestActiveStartAt = rows[0].subscription_ends_at ? new Date(rows[0].subscription_ends_at) : null;
  const latestActiveEndAt = rows[0].subscription_ends_at ? new Date(rows[0].subscription_ends_at) : null;

  const billingStartsAt = latestActiveStartAt && rows[0].subscription_status === 'ACTIVE'
    ? getMonthStart(latestActiveStartAt)
    : null;
  const billingEndsAt = latestActiveEndAt;
  const daysLeft = billingEndsAt
    ? getDaysRemaining(now, billingEndsAt)
    : null;

  return {
    ...rows[0],
    subscription_ends_at: latestActiveEndAt ? latestActiveEndAt.toISOString() : null,
    subscription_window_starts_at: billingStartsAt ? billingStartsAt.toISOString() : null,
    subscription_window_ends_at: billingEndsAt ? billingEndsAt.toISOString() : null,
    raw_subscription_ends_at: latestActiveEndAt ? latestActiveEndAt.toISOString() : null,
    subscription_is_active: Boolean(rows[0].subscription_status === 'ACTIVE' && billingEndsAt && billingEndsAt > now),
    subscription_days_left: daysLeft,
  };
}

export const updateOrganizerProfile = asyncHandler(async (req, res) => {
  const paymentPhone = req.body.paymentPhone ? String(req.body.paymentPhone).trim() : null;

  await query(
    `update organizers set payment_phone=$1 where user_id=$2 returning payment_phone`,
    [paymentPhone, req.user!.id]
  );

  const profile = await getOrganizerProfilePayload(req.user!.id);

  if (!profile) {
    throw new AppError(404, 'Organizer profile not found');
  }

  res.json(profile);
});
