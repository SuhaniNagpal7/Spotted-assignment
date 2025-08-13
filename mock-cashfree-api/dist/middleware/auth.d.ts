import { Request, Response, NextFunction } from 'express';
import { AuthTokenPayload } from '../types';
interface AuthenticatedRequest extends Request {
    user?: AuthTokenPayload;
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const generateToken: (payload: {
    userId: string;
    email: string;
}) => string;
export type { AuthenticatedRequest };
//# sourceMappingURL=auth.d.ts.map