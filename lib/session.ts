import "server-only";
import { cookies } from "next/headers";
import { encrypt, decrypt } from "@/lib/jwt";

export { encrypt, decrypt };

const COOKIE = "session";
const DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + DURATION_MS);
  const token = await encrypt({ userId, expiresAt });
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  return decrypt(token);
}
