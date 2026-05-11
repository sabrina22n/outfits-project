"use server";

import { scryptSync, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";

const SALT = "travoutfits_salt";

function verifyPassword(input: string, storedHex: string): boolean {
  try {
    const inputHash = scryptSync(input, SALT, 32);
    const expected = Buffer.from(storedHex, "hex");
    return timingSafeEqual(inputHash, expected);
  } catch {
    return false;
  }
}

export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error: string }> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const expectedUser = process.env.APP_USERNAME;
  const expectedHash = process.env.APP_PASSWORD_HASH;

  if (!expectedUser || !expectedHash) {
    return { error: "La app no está configurada. Revisá APP_PASSWORD_HASH en .env.local." };
  }

  const userMatch = username === expectedUser;
  const passwordMatch = verifyPassword(password, expectedHash);

  if (!userMatch || !passwordMatch) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  await createSession(username);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
