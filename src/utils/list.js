// Adds the text still sitting in a box (not yet "Added") to the list when saving
export const withPending = (items, text) => {
  const value = text.trim();
  const exists = items.some((item) => item.toLowerCase() === value.toLowerCase());
  return value && !exists ? [...items, value] : items;
};