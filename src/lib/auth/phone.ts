const MOROCCO_COUNTRY_CODE = '212';
const MOROCCAN_NATIONAL_NUMBER = /^[5-8]\d{8}$/;

export function normalizeMoroccanPhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/[\s().-]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return null;
  if (digits.startsWith('00')) digits = digits.slice(2);

  let nationalNumber: string;
  if (digits.startsWith(MOROCCO_COUNTRY_CODE)) {
    nationalNumber = digits.slice(MOROCCO_COUNTRY_CODE.length);
  } else if (digits.startsWith('0')) {
    nationalNumber = digits.slice(1);
  } else {
    nationalNumber = digits;
  }

  if (!MOROCCAN_NATIONAL_NUMBER.test(nationalNumber)) return null;
  return `+${MOROCCO_COUNTRY_CODE}${nationalNumber}`;
}

export function isNormalizedMoroccanPhone(value: string): boolean {
  return /^\+212[5-8]\d{8}$/.test(value);
}
