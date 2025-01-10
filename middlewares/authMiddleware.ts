import { type NextFunction, type Response, type Request } from "express";
import { verifyJwt, sendErrorResponse } from "../utils";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    sendErrorResponse(res, 401, "Token is required");
    return;
  }

  try {
    const decodedToken = verifyJwt(token);
    req.user = decodedToken.email;
    next();
  } catch (error) {
    sendErrorResponse(res, 401, "Invalid token");
    return;
  }
};
