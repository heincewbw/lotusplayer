import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  if (!isLoggedIn && pathname !== "/login") {
    return Response.redirect(new URL("/login", req.url))
  }

  if (isLoggedIn && pathname === "/login") {
    return Response.redirect(new URL("/sessions", req.url))
  }
})

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
