import { verifyJWT } from "../utils/jwt";
import { userRole } from "../constants";

export default async function jwtAdminRole(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  const { status, errorMessage, role } = await verifyJWT(token);

  if (!errorMessage && role === userRole.ADMIN) {
    return next();
  }

  let error = errorMessage 
    ? { status, message: errorMessage } 
    : { status: 403, message: "Forbidden" };

  next(error);
}
