import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./env";
import { type Response } from "express";

export const signJwt = (email: string) => {
  return jwt.sign({ email }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const verifyJwt = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string
) => {
  return res.status(statusCode).json({ error: message });
};
