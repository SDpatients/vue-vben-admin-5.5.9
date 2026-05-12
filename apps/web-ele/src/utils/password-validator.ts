const MIN_LENGTH = 6;

export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong' | 'very-strong';

export interface PasswordValidationResult {
  valid: boolean;
  message: string;
  strength: PasswordStrengthLevel;
  metTypes: number;
}

export function getPasswordStrength(password: string): PasswordStrengthLevel {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const metTypes = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean)
    .length;

  if (password.length < MIN_LENGTH) return 'weak';
  if (metTypes <= 1) return 'weak';
  if (metTypes === 2) return 'medium';
  if (metTypes === 3) return 'strong';
  return 'very-strong';
}

export function getPasswordStrengthText(strength: PasswordStrengthLevel): string {
  const map: Record<PasswordStrengthLevel, string> = {
    'weak': '弱',
    'medium': '中等',
    'strong': '强',
    'very-strong': '非常强',
  };
  return map[strength];
}

export function getPasswordStrengthColor(strength: PasswordStrengthLevel): string {
  const map: Record<PasswordStrengthLevel, string> = {
    'weak': '#f56c6c',
    'medium': '#e6a23c',
    'strong': '#67c23a',
    'very-strong': '#409eef',
  };
  return map[strength];
}

export function validatePasswordComplexity(password: string): PasswordValidationResult {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const metTypes = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean)
    .length;

  const strength = getPasswordStrength(password);

  if (password.length < MIN_LENGTH) {
    return {
      valid: false,
      message: `密码长度至少 ${MIN_LENGTH} 位`,
      strength,
      metTypes,
    };
  }

  if (metTypes < 3) {
    return {
      valid: false,
      message: '密码必须包含大写字母、小写字母、数字、特殊符号中的至少3种',
      strength,
      metTypes,
    };
  }

  return {
    valid: true,
    message: '',
    strength,
    metTypes,
  };
}

export function isSensitiveDataMasked(value: string | null | undefined): boolean {
  if (!value) return false;
  return value === '***' || /^\*{3,}$/.test(value.trim());
}

export function isMaskedDisplayValue(value: string | null | undefined): boolean {
  if (!value) return false;
  if (value === '***' || /^\*{3,}$/.test(value.trim())) return true;
  return /\*/.test(value) && !/^\*+$/.test(value);
}

export function checkLicenseDataMasked(data: Record<string, any>): boolean {
  const sensitiveFields = [
    'mobile', 'phone', 'idNumber', 'contactPhone', 'agentPhone',
    'agentIdCard', 'creditorBankAccount', 'accountNumber', 'bankAccount',
  ];

  for (const field of sensitiveFields) {
    if (data[field] && isSensitiveDataMasked(String(data[field]))) {
      return true;
    }
  }
  for (const key of Object.keys(data)) {
    for (const field of sensitiveFields) {
      if (key.toLowerCase().includes(field.toLowerCase()) && isSensitiveDataMasked(String(data[key]))) {
        return true;
      }
    }
  }
  return false;
}