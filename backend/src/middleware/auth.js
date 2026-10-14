import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isValidId, publicUser } from '../utils/helpers.js';

const TOKEN_TTL = '7d';
const secret = () => process.env.JWT_SECRET || 'bookbridge-default-signing-secret';

export function signToken(user) {
  return jwt.sign({ userId: String(user._id), email: user.email }, secret(), { expiresIn: TOKEN_TTL });
}

async function userFromRequest(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret());
    if (!isValidId(payload.userId)) return null;
    const doc = await User.findById(payload.userId).lean();
    return doc ? publicUser(doc) : null;
  } catch {
    return null;
  }
}

/** Attaches req.user when a valid token is sent; never blocks the request. */
export async function optionalAuth(req, _res, next) {
  req.user = await userFromRequest(req);
  next();
}

/** Blocks the request with 401 unless a valid token is sent. */
export function requireAuth(message = 'Please sign in') {
  return async (req, res, next) => {
    req.user = await userFromRequest(req);
    if (!req.user) return res.status(401).json({ error: message });
    next();
  };
}
