import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { bookingSchema } from "@/validation/bookingSchema"
import { getAuthUser } from "@/lib/clerk"

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:8080",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}


export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 1️⃣ Validate input
    const parsed = bookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // 2️⃣ Auth (optional)
    const userId = await getAuthUser()

    // 3️⃣ Enforce guest info
    if (!userId) {
      if (!data.fullName || !data.email || !data.phone) {
        return NextResponse.json(
          { error: "Guest bookings require name, email, and phone" },
          { status: 400 }
        )
      }
    }

    // 4️⃣ Calculate total price server-side 🔐
    const totalPrice = data.services.reduce(
      (sum, s) => sum + s.price,
      0
    )

    // 5️⃣ Create booking
    const booking = await prisma.booking.create({
      data: {
        type: data.type,
        date: new Date(data.date),
        time: data.time,
        totalPrice,

        fullName: userId ? null : data.fullName,
        email: userId ? null : data.email,
        phone: userId ? null : data.phone,

        userId: userId ?? null,

        services: {
          create: data.services.map((s) => ({
            name: s.name,
            price: s.price,
          })),
        },
      },
      include: {
        services: true,
      },
    })

    // 6️⃣ Success
    return NextResponse.json(
      {
        success: true,
        bookingId: booking.id,
      },
      {
        status: 201,
        headers: {
          "Access-Control-Allow-Origin": "*", // allow your frontend
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    )
  } catch (err) {
    console.error("BOOKING ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500,
        headers: {
          "Content-Type": "text/html",
          "Access-Control-Allow-Origin": "*", // allow your frontend
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
       }
    )
  }
}
