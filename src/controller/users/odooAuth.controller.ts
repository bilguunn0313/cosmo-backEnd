import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getOdooService } from "../../services/odoo.service";
import { AuthenticationError, ValidationError } from "../../utils/errors";

interface JwtPayload {
  id: number;
  email: string;
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    // Get Odoo service
    const odooService = getOdooService();

    // Authenticate with Odoo
    const user = await odooService.authenticateUser(email, password);

    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email } as JwtPayload,
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error); // Pass to error handler middleware
  }
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AuthenticationError("No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Optionally verify user still exists in Odoo
    const odooService = getOdooService();
    const user = await odooService.getUserById(decoded.id);

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError("Invalid token"));
    } else {
      next(error);
    }
  }
};
