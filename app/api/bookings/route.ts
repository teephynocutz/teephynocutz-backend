import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { bookingSchema } from "@/validation/bookingSchema"
import { getAuthUser } from "@/lib/clerk"

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.FRONTEND_ORIGIN!,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const parsed = bookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400, headers: corsHeaders }
      )
    }

    const data = parsed.data
    const userId = await getAuthUser()

    if (!userId && (!data.fullName || !data.email || !data.phone)) {
      return NextResponse.json(
        { error: "Guest bookings require name, email, and phone" },
        { status: 400, headers: corsHeaders }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        type: data.type,
        date: new Date(data.date),
        time: data.time,
        totalPrice: Math.round(data.totalPrice),

        fullName: userId ? null : data.fullName ?? null,
        email: userId ? null : data.email ?? null,
        phone: userId ? null : data.phone ?? null,

        userId: userId ?? null,

        services: {
          create: data.services.map((s) => ({
            name: s.name,
            price: Math.round(s.price),
          })),
        },
      },
    })

    return NextResponse.json(
      { success: true, bookingId: booking.id },
      { status: 201, headers: corsHeaders }
    )
  } catch (error) {
    console.error("BOOKING_ERROR", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    )
  }
}



// import { NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { bookingSchema } from "@/validation/bookingSchema"
// import { getAuthUser } from "@/lib/clerk"

// /* -------------------- CORS -------------------- */
// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// }

// export async function OPTIONS() {
//   return new Response(null, {
//     status: 204,
//     headers: corsHeaders,
//   })
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json()

//     /* 1️⃣ Validate EXACT payload */
//     const parsed = bookingSchema.safeParse(body)
//     if (!parsed.success) {
//       console.error("ZOD ERROR:", parsed.error.flatten())
//       return NextResponse.json(
//         { error: parsed.error.flatten() },
//         { status: 400, headers: corsHeaders }
//       )
//     }

//     const data = parsed.data

//     /* 2️⃣ Auth (optional) */
//     const userId = await getAuthUser()

//     /* 3️⃣ Guest validation */
//     if (!userId) {
//       if (!data.fullName || !data.email || !data.phone) {
//         return NextResponse.json(
//           { error: "Guest bookings require name, email, and phone" },
//           { status: 400, headers: corsHeaders }
//         )
//       }
//     }

//     /* 4️⃣ Prisma insert (minimal transformation only) */
//     const booking = await prisma.booking.create({
//       data: {
//         type: data.type, // already NORMAL | VIP | HOME
//         date: new Date(data.date), // ISO → DateTime
//         time: data.time,
//         totalPrice: Math.round(data.totalPrice),

//         fullName: userId ? null : data.fullName ?? null,
//         email: userId ? null : data.email ?? null,
//         phone: userId ? null : data.phone ?? null,

//         userId: userId ?? null,

//         services: {
//           create: data.services.map((s) => ({
//             name: s.name,
//             price: Math.round(s.price),
//           })),
//         },
//       },
//     })

//     return NextResponse.json(
//       { success: true, bookingId: booking.id },
//       { status: 201, headers: corsHeaders }
//     )
//   } catch (err) {
//     console.error("BOOKING ERROR:", err)
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500, headers: corsHeaders }
//     )
//   }
// }
