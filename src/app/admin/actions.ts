"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

export async function loginUser(username: string, passwordText: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, error: "Invalid username or password" };
    }

    const isValid = await bcrypt.compare(passwordText, user.password);

    if (isValid) {
      const session = await getSession();
      session.username = user.username;
      session.isLoggedIn = true;
      await session.save();
      
      return { success: true };
    } else {
      return { success: false, error: "Invalid username or password" };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An error occurred during login." };
  }
}

export async function logoutUser() {
  const session = await getSession();
  session.destroy();
  return { success: true };
}

export async function checkSessionUser() {
  const session = await getSession();
  return { isLoggedIn: session.isLoggedIn === true };
}
