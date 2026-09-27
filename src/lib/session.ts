import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  username: string;
  isLoggedIn: boolean;
}

export const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || "complex_password_at_least_32_characters_long",
  cookieName: "cms_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}
