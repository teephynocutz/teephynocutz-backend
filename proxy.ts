import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/", "/about", "/services","/api/bookings", "/fleet", "/quote", "/contact", "/gallery",
  "/api/(.*)", "/confirmation", "/search", "/search/(.*)", "/views.mp4",
  '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|mp4|webm)).*)'
])

// Next.js 16 convention: Rename exported function to 'proxy' or keep default
export default clerkMiddleware(async (auth, request: NextRequest) => {
  
  // ✅ FIX: Allow preflight OPTIONS requests to bypass auth
  if (request.method === "OPTIONS") {
    return NextResponse.next()
  }

  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  const response = NextResponse.next()

  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  return response
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
