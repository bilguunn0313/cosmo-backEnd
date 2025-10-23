import { Request, Response, NextFunction } from "express";
import { getOdooService } from "../../services/odoo.service";
import { ValidationError } from "../../utils/errors";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const odooService = getOdooService();
    const users = await odooService.getAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      throw new ValidationError("Invalid user ID");
    }

    const odooService = getOdooService();
    const user = await odooService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const odooService = getOdooService();
    const users = await odooService.getActiveUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const odooService = getOdooService();
    const users = await odooService.getUserByEmail(email);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // req.user is set by auth middleware
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new ValidationError("User not authenticated");
    }

    const odooService = getOdooService();
    const user = await odooService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
