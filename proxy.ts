import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/api/(.*)",
  "/(.*)",
])

export default clerkMiddleware(async (auth, request: NextRequest) => {
  /* ─────────────────────────────
     1️⃣ Handle CORS preflight
     ───────────────────────────── */
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  /* ─────────────────────────────
     2️⃣ Protect non-public routes
     ───────────────────────────── */
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  const response = NextResponse.next()

  /* ─────────────────────────────
     3️⃣ CORS headers (REAL REQUESTS)
     ───────────────────────────── */
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  )
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  )

  return response
})

export const config = {
  matcher: [
    "/(api|trpc)(.*)",
    "/((?!_next|.*\\..*).*)",
  ],
}
