const UID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isValidUID = (value: string | undefined | null) => {
  if (!value) {
    return false;
  }

  return UID_REGEX.test(value);
};
