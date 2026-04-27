const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function optionalAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return next();
  try {
    req.user = jwt.verify(auth.slice(7), env.jwtSecret);
  } catch (error) {
    req.user = null;
  }
  return next();
}

module.exports = { optionalAuth };
