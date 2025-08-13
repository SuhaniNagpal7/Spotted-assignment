import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../types';

interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required',
      error: 'UNAUTHORIZED'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      error: 'FORBIDDEN'
    });
  }
};

export const generateToken = (payload: { userId: string; email: string }): string => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
};

export type { AuthenticatedRequest }; 