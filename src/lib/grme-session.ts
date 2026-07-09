import { UserRole } from "./grme-user";

export interface GrmeSessionUser {
  name: string;
  role: UserRole;
  loginAt: string;
}

export const GRME_SESSION_COOKIE = "grme-session";

export function getSessionSecret(): string {
  return (
    process.env.GRME_SESSION_SECRET ||
    "grme-dev-session-secret"
  );
}