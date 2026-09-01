const { ApiError } = require('./apiError');
const { toNumber } = require('./validators');

const validateNonNegativeNumber = (value, fieldName) => {
  const num = toNumber(value);
  if (num === null) {
    throw new ApiError(400, `${fieldName} must be a valid number`, 'INVALID_NUMBER');
  }
  if (num < 0) {
    throw new ApiError(400, `${fieldName} must be a non-negative number`, `NEGATIVE_${fieldName.toUpperCase()}`);
  }
  return num;
};

module.exports = {
  validateNonNegativeNumber,
};
