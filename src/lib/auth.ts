import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { JwtPayload, UserRole, IUserSafe } from '@/types';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'landvest-secret-production-key-2025';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 12;
const ADMIN_TOKEN_COOKIE = 'token';
const CUSTOMER_TOKEN_COOKIE = 'customer_token';

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

// ─── JWT helpers (Admin / System Users) ───────────────────────────────

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

// ─── Customer Token Helpers ──────────────────────────────────────────

export interface CustomerJwtPayload {
  customerId: string; // e.g. "CUST-00001"
  mongoId: string;
  email: string;
  mobile: string;
  role: 'customer';
  iat?: number;
  exp?: number;
}

export function signCustomerToken(payload: {
  customerId: string;
  mongoId: string;
  email: string;
  mobile: string;
}): string {
  return jwt.sign({ ...payload, role: 'customer' }, JWT_SECRET, {
    expiresIn: '14d',
  });
}

export function verifyCustomerToken(token: string): CustomerJwtPayload {
  return jwt.verify(token, JWT_SECRET) as CustomerJwtPayload;
}

// ─── Token extraction ────────────────────────────────────────────────

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const tokenCookie = req.cookies.get(ADMIN_TOKEN_COOKIE);
  if (tokenCookie?.value) {
    return tokenCookie.value;
  }
  return null;
}

export function getCustomerTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const customerCookie = req.cookies.get(CUSTOMER_TOKEN_COOKIE);
  if (customerCookie?.value) {
    return customerCookie.value;
  }
  return null;
}

// ─── Route protection middleware ─────────────────────────────────────

export interface AuthenticatedRequest extends NextRequest {
  user: JwtPayload;
}

export interface AuthenticatedCustomerRequest extends NextRequest {
  customer: CustomerJwtPayload;
}

type AdminRouteHandler = (
  req: AuthenticatedRequest,
  context?: unknown
) => Promise<NextResponse>;

type CustomerRouteHandler = (
  req: AuthenticatedCustomerRequest,
  context?: unknown
) => Promise<NextResponse>;

/**
 * Wrap an API route handler with Admin JWT authentication.
 */
export function withAuth(
  handler: AdminRouteHandler,
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

      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

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
 * Wrap an API route handler with Customer JWT authentication.
 */
export function withCustomerAuth(
  handler: CustomerRouteHandler
): (req: NextRequest, context?: unknown) => Promise<NextResponse> {
  return async (req: NextRequest, context?: unknown) => {
    try {
      const token = getCustomerTokenFromRequest(req);

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Customer login required' },
          { status: 401 }
        );
      }

      let decoded: CustomerJwtPayload;
      try {
        decoded = verifyCustomerToken(token);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired customer session' },
          { status: 401 }
        );
      }

      (req as AuthenticatedCustomerRequest).customer = decoded;
      return handler(req as AuthenticatedCustomerRequest, context);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Customer authentication failed' },
        { status: 401 }
      );
    }
  };
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export async function getCurrentUser(): Promise<IUserSafe | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    await connectDB();
    const { default: User } = await import('@/models/User');
    const user = await User.findById(decoded.userId).select('-password').lean<IUserSafe>();
    return user;
  } catch {
    return null;
  }
}
