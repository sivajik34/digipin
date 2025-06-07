export const formatDigipin = (str) => {
  if (!str) return "";
  const clean = str.replace(/-/g, "").toUpperCase();
  return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6, 10)}`;
};