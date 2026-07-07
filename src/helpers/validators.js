const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isEmailString = (value) => {
  if (!isNonEmptyString(value)) return false;
  const normalized = value.trim();
  if (normalized.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toPositiveInt = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

module.exports = {
  isNonEmptyString,
  isEmailString,
  toNumber,
  toPositiveInt,
};
