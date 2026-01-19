const ISRC_REGEX = /^[A-Z]{2}-?[A-Z0-9]{3}-?\d{2}-?\d{5}$/i;

export const isValidIsrc = (value: string | undefined | null) => {
  if (!value) return false;

  return ISRC_REGEX.test(value);
};
