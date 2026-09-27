"use server";

import { prisma } from "@/lib/prisma";

export async function loginUser(username: string, passwordText: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, error: "Invalid username or password" };
    }

    if (user.password === passwordText) {
      return { success: true };
    } else {
      return { success: false, error: "Invalid username or password" };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An error occurred during login." };
  }
}
