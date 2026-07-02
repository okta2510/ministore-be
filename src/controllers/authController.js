const { login } = require('../services/authService');
const { isNonEmptyString } = require('../helpers/validators');
const { ApiError } = require('../helpers/apiError');

const loginHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      throw new ApiError(400, 'Email and password are required');
    }

    const result = await login({ username: email.trim(), password });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginHandler,
};
