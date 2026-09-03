// ============================================
// Form Validators
// ============================================

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!re.test(email)) return 'Invalid email address';
  return '';
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return '';
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return '';
}

export function validateUrl(url) {
  if (!url) return '';
  try {
    new URL(url);
    return '';
  } catch {
    return 'Invalid URL format';
  }
}

export function validateFileType(file, allowedTypes) {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(ext)) {
    return `File type ${ext} is not allowed. Allowed: ${allowedTypes.join(', ')}`;
  }
  return '';
}

export function validateFileSize(file, maxSizeMB) {
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File size exceeds ${maxSizeMB}MB limit`;
  }
  return '';
}
