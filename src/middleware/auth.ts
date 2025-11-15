import { Request, Response, NextFunction } from 'express';
import { supabaseServiceClient } from '../services/supabase.js';

export interface AuthRequest extends Request {
  userId?: string;
  body: any; // Explicitly include body property
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabaseServiceClient.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.userId = user.id;
  next();
}
