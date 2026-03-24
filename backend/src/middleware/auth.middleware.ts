import { Request, Response, NextFunction } from 'express';
import { Role, JwtPayload } from '../types/index.js';
import { verifyAccessToken } from '../services/auth.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'No token provided', code: 401 });
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token', code: 401 });
  }
};

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required', code: 401 });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        code: 403 
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(Role.ADMIN);
export const requirePMOrAdmin = requireRole(Role.ADMIN, Role.PM);
export const requireAnyRole = requireRole(Role.ADMIN, Role.PM, Role.DEVELOPER);
