// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { Role } from "@prisma/client";

// interface JwtPayload {
//   userId: number;
//   role: Role;
// }

// // Extend Express Request type
// declare global {
//   namespace Express {
//     interface Request {
//       user?: JwtPayload;
//     }
//   }
// }

// // Authentication middleware - verifies JWT token
// export const authenticate = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({ error: "Эрх байхгүй байна" });
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET as string
//     ) as JwtPayload;

//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ error: "Invalid token" });
//   }
// };

// // RBAC middleware - checks if user has required role
// export const authorize = (...allowedRoles: Role[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }

//     if (!allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({
//         error: "Access denied. Insufficient permissions.",
//         requiredRoles: allowedRoles,
//         yourRole: req.user.role,
//       });
//     }

//     next();
//   };
// };

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../utils/errors";

interface JwtPayload {
  id: number;
  email: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      throw new AuthenticationError("Access token required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError("Token expired"));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError("Invalid token"));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      req.user = decoded;
    }

    next();
  } catch (error) {
    // For optional auth, continue even if token is invalid
    next();
  }
};
