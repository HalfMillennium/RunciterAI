import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import { InsertUser } from '@shared/schema';

// Add user info to the session type
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

/**
 * Middleware to check if user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

/**
 * Register a new user
 */
export async function register(username: string, password: string) {
  try {
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const userData: InsertUser = {
      username,
      password: hashedPassword,
    };
    
    const user = await storage.createUser(userData);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
}

/**
 * Authenticate a user and return user data if successful
 */
export async function authenticate(username: string, password: string) {
  try {
    // Find user by username
    const user = await storage.getUserByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid username or password');
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
}