import { query } from '../config/db.js';
export async function savePushToken(userId, token, platform) {
    await query('insert into push_tokens(user_id, token, platform) values($1,$2,$3) on conflict(token) do update set user_id=excluded.user_id, platform=excluded.platform', [userId, token, platform]);
}
export async function notifyUser(userId, title, body, data = {}) {
    await query('insert into notifications(user_id,title,body,data) values($1,$2,$3,$4)', [userId, title, body, data]);
    // Add Firebase Admin SDK here for true FCM delivery after service-account setup.
    console.log('FCM notification queued', { userId, title, body, data });
}
