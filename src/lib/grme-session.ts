import { UserRole } from "./grme-user";

export interface GrmeSessionUser {
  name: string;
  role: UserRole;
  loginAt: string;
}

export const GRME_SESSION_COOKIE = "grme-session";

export function getSessionSecret(): string {
  const secret = process.env.GRME_SESSION_SECRET;
  if (!secret) throw new Error("GRME_SESSION_SECRET is not set");
  return secret;
}