import jwt, { SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  name?: string;
}

/**
 * Generate a cryptographically signed JWT authentication token
 */
export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET || 'casaaura-jwt-dev-secret-key-2026';
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

/**
 * Verify and decode a JWT authentication token
 */
export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET || 'casaaura-jwt-dev-secret-key-2026';
  return jwt.verify(token, secret) as TokenPayload;
};
