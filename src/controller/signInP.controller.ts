import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";

export const signInP = async (req: Request, res: Response) => {
  const { password, email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password ?? "");
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const accesstoken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ accesstoken, user });
  } catch (error) {
    console.error("Sign-in error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
