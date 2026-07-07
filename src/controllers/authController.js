const { login } = require('../services/authService');
const { isEmailString, isNonEmptyString } = require('../helpers/validators');
const { ApiError } = require('../helpers/apiError');

const loginHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      throw new ApiError(400, 'Email and password are required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!isEmailString(normalizedEmail)) {
      throw new ApiError(400, 'Invalid email format');
    }

    const result = await login({ email: normalizedEmail, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginHandler,
};
