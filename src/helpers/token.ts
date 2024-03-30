import jwt from "jsonwebtoken";

export const TOKEN_KEY = "suns-auth-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function decodeToken(token: string) {
  return jwt.decode(token);
}

export function getRoleFromDecodedToken(decodedToken: any) {
  if (
    decodedToken &&
    typeof decodedToken === "object" &&
    "role" in decodedToken
  ) {
    return decodedToken.role;
  } else {
    throw new Error("Missing role property in decoded token.");
  }
}
