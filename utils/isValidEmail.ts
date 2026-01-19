const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string | undefined | null) => {
  if (!value) {
    return false;
  }

  return EMAIL_REGEX.test(value.trim());
};
