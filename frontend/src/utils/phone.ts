export function normalizePhone(input: string) {
  if (!input) return input;
  const raw = String(input).trim();
  if (!raw) return raw;
  // If already starts with + and digits, normalize formatting
  if (raw.startsWith('+')) {
    const digits = raw.replace(/[^0-9]/g, '');
    return '+' + digits;
  }

  // Strip all non-digit characters
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return raw;

  // If it already contains country code (e.g. 233...), add +
  if (digits.startsWith('233')) return '+' + digits;

  // Remove leading zeros then prefix Ghana country code +233
  const withoutLeadingZeros = digits.replace(/^0+/, '');
  return '+233' + withoutLeadingZeros;
}

export default normalizePhone;
