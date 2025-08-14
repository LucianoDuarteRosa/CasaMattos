import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Token de acesso requerido'
        });
        return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            res.status(403).json({
                success: false,
                message: 'Token inválido'
            });
            return;
        }

        req.user = user;
        next();
    });
};
