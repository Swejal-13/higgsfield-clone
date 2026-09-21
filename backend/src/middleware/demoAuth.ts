import { NextFunction, Response } from "express";
import User from "../models/User";
import { AuthedRequest } from "./auth";
import { ApiError } from "../utils/ApiError";

const DEMO_EMAIL = "demo@higgsfield.demo";

export async function optionalDemoAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction
) {
  // Keep the real authenticated user when a valid token is supplied.
  const header = req.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    const { verifyToken } = await import("../utils/jwt");

    try {
      req.user = verifyToken(header.split(" ")[1]);
      return next();
    } catch {
      // Invalid/expired tokens fall through to the public demo user.
    }
  }

  try {
    const demoUser = await User.findOne({ email: DEMO_EMAIL }).select(
      "_id role"
    );

    if (!demoUser) {
      return next(
        new ApiError(
          500,
          "Demo account is not configured. Run the database seed first."
        )
      );
    }

    req.user = {
      userId: String(demoUser._id),
      role: demoUser.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}