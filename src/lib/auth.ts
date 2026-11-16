import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { JwtPayload, UserRole, IUserSafe } from '@/types';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 12;
const TOKEN_COOKIE_NAME = 'token';

// ─── Password helpers ────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ─── JWT helpers ─────────────────────────────────────────────────────

export function signToken(payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// ─── Token extraction ────────────────────────────────────────────────

export function getTokenFromRequest(req: NextRequest): string | null {
  // 1. Check Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. Check cookies
  const tokenCookie = req.cookies.get(TOKEN_COOKIE_NAME);
  if (tokenCookie?.value) {
    return tokenCookie.value;
  }

  return null;
}

// ─── Route protection middleware ─────────────────────────────────────

export interface AuthenticatedRequest extends NextRequest {
  user: JwtPayload;
}

type RouteHandler = (
  req: AuthenticatedRequest,
  context?: unknown
) => Promise<NextResponse>;

/**
 * Wrap an API route handler with JWT authentication.
 * Optionally restrict to specific roles.
 */
export function withAuth(
  handler: RouteHandler,
  allowedRoles?: UserRole[]
): (req: NextRequest, context?: unknown) => Promise<NextResponse> {
  return async (req: NextRequest, context?: unknown) => {
    try {
      const token = getTokenFromRequest(req);

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      let decoded: JwtPayload;
      try {
        decoded = verifyToken(token);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Check role-based access
      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Attach user to the request
      (req as AuthenticatedRequest).user = decoded;

      return handler(req as AuthenticatedRequest, context);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

/**
 * Check if user has one of the specified roles
 */
export function hasRole(
  userRole: UserRole,
  allowedRoles: UserRole[]
): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Get current user from cookies (server-side)
 */
export async function getCurrentUser(): Promise<IUserSafe | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

    if (!token) return null;

    const decoded = verifyToken(token);

    await connectDB();
    const { default: User } = await import('@/models/User');
    const user = await User.findById(decoded.userId)
      .select('-password')
      .lean<IUserSafe>();

    return user;
  } catch {
    return null;
  }
}
