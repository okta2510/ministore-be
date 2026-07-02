const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

module.exports = {
  isNonEmptyString,
  toNumber,
};
