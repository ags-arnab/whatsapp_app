// Backend Token Generation (src/utils/generateToken.js)
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/config');

const generateToken = (id) => {
  return jwt.sign({ id: id.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

module.exports = generateToken;