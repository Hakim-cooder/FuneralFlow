import { parsePhoneNumberFromString } from 'libphonenumber-js';
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function validEmail(v) { return emailRegex.test(v.trim()); }
export function validStrongPassword(v) { return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(v); }
export function validPhone(v, country = 'GH') { const p = parsePhoneNumberFromString(v, country); return !!p?.isValid(); }
export function otpExpiry(minutes = 10) { return new Date(Date.now() + minutes * 60_000); }
