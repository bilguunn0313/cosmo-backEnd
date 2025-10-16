import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Odoo from "odoo-await";

interface OdooUser {
  id: number;
  name: string;
  email: string;
}

interface JwtPayload {
  id: number;
  email: string;
}

const odoo = new Odoo({
  baseUrl: process.env.ERP_URL!,
  db: process.env.ERP_DB!,
  username: process.env.ERP_USER!,
  password: process.env.ERP_PASSWORD!,
});

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // 1️⃣ ERP login шалгах
    const connected = await odoo.connect();
    if (!connected) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2️⃣ ERP-с хэрэглэгчийн мэдээлэл авах
    const users: OdooUser[] = await odoo.searchRead(
      "res.users",
      [["login", "=", email]],
      ["id", "name", "email"]
    );

    const user = users?.[0];
    if (!user) {
      return res.status(404).json({ message: "User not found in ERP" });
    }

    // 3️⃣ JWT үүсгэх
    const token = jwt.sign(
      { id: user.id, email: user.email } as JwtPayload,
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // 4️⃣ Хариу буцаах
    return res.status(200).json({
      token,
      user,
    });
  } catch (err: any) {
    console.error("Login error:", err.message);
    return res
      .status(500)
      .json({ message: "Login failed", error: err.message });
  }
};
