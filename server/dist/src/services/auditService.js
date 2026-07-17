import { query } from '../config/db.js';
export async function audit(userId, action, entity, entityId, metadata = {}) { await query('insert into audit_logs(user_id,action,entity,entity_id,metadata) values($1,$2,$3,$4,$5)', [userId, action, entity, entityId, metadata]); }
