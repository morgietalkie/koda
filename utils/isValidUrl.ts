export const isValidUrl = (value: string | undefined | null) => {
  if (!value) {
    return false;
  }

  try {
    const parsedUrl = new URL(value.trim());
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};
