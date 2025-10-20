// import { Request, Response, NextFunction } from "express";

// export const permit =
//   (...allowedRoles: string[]) =>
//   (req: Request, res: Response, next: NextFunction) => {
//     const user = req.user; // JWT эсвэл session-аас авна
//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     if (!allowedRoles.includes(user.role)) {
//       return res.status(403).json({ message: "Forbidden: Access denied" });
//     }

//     next();
//   };
