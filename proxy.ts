import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/jwt";

const publicRoutes = ["/login"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = publicRoutes.includes(pathname);

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);
  const isAuthenticated = !!session?.userId;

  if (!isPublic && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublic && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)"],
};
