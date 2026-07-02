const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getClient } = require('../../db');
const { ApiError } = require('../helpers/apiError');

const login = async ({ username, password }) => {
  const db = getClient();
  const result = await db.execute('SELECT id, name, email, password, role, status FROM User WHERE email = ? LIMIT 1', [
    username,
  ]);

  const user = result.rows[0];
  if (!user) {
    throw new ApiError(401, 'Invalid username or password');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new ApiError(401, 'Invalid username or password');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};

module.exports = {
  login,
};
