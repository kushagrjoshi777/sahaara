// ============================================
// Sahaara — Validation Utilities
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function getPasswordError(password: string): string | null {
  if (password.length === 0) return null;
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function getEmailError(email: string): string | null {
  if (email.length === 0) return null;
  if (!isValidEmail(email)) return 'Please enter a valid email address';
  return null;
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}
