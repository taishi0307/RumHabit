import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Session configuration
const PgSession = connectPgSimple(session);

export const sessionConfig = session({
  store: new PgSession({
    pool: pool,
    tableName: "sessions",
    createTableIfMissing: false,
  }),
  secret: process.env.SESSION_SECRET || "your-session-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
});

// Password hashing utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// JWT utilities
export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): { userId: number } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch {
    return null;
  }
};

// User service functions
export const createUser = async (userData: InsertUser): Promise<User> => {
  if (userData.password) {
    userData.password = await hashPassword(userData.password);
  }
  
  const [user] = await db.insert(users).values(userData).returning();
  return user;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || null;
};

export const findUserById = async (id: number): Promise<User | null> => {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
};

export const findUserByGoogleId = async (googleId: string): Promise<User | null> => {
  const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
  return user || null;
};

// Passport configuration
passport.use(new LocalStrategy(
  { usernameField: "email" },
  async (email: string, password: string, done) => {
    try {
      const user = await findUserByEmail(email);
      if (!user) {
        return done(null, false, { message: "メールアドレスが見つかりません" });
      }

      if (!user.password) {
        return done(null, false, { message: "Googleアカウントでログインしてください" });
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: "パスワードが間違っています" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with Google ID
      let user = await findUserByGoogleId(profile.id);
      
      if (user) {
        return done(null, user);
      }
      
      // Check if user exists with same email
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await findUserByEmail(email);
        if (user) {
          // Link Google account to existing user
          await db.update(users)
            .set({ googleId: profile.id })
            .where(eq(users.id, user.id));
          user.googleId = profile.id;
          return done(null, user);
        }
      }
      
      // Create new user
      if (email) {
        user = await createUser({
          email: email,
          googleId: profile.id,
          firstName: profile.name?.givenName || "",
          lastName: profile.name?.familyName || "",
          profileImageUrl: profile.photos?.[0]?.value,
        });
        return done(null, user);
      }
      
      return done(new Error("Google profile missing email"));
    } catch (error) {
      return done(error);
    }
  }
  ));
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await findUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Authentication middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Check for JWT token in Authorization header
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      findUserById(decoded.userId)
        .then(user => {
          if (user) {
            req.user = user;
            return next();
          }
          return res.status(401).json({ error: "認証が必要です" });
        })
        .catch(() => res.status(401).json({ error: "認証が必要です" }));
      return;
    }
  }
  
  res.status(401).json({ error: "認証が必要です" });
};

// Optional auth middleware (doesn't require authentication)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      findUserById(decoded.userId)
        .then(user => {
          if (user) {
            req.user = user;
          }
          next();
        })
        .catch(() => next());
      return;
    }
  }
  
  next();
};