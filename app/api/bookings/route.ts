import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { bookingSchema } from "@/validation/bookingSchema"
import { getAuthUser } from "@/lib/clerk"
import twilio from "twilio"

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)
const ADMIN_PHONE = process.env.ADMIN_PHONE_NUMBER

// Standardize CORS for production
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.teephynocutz.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
      console.error("ZOD VALIDATION FAILED:", parsed.error.format())
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

    // --- Production SMS Logic ---
    const clientPhone = data.phone
    const msgTemplate = `Booking Confirmed! ${data.type} on ${new Date(data.date).toDateString()} @ ${data.time}.`

    const notifications = []
    if (clientPhone) {
      notifications.push(
        twilioClient.messages.create({
          body: `Hi ${data.fullName || "there"}, ${msgTemplate}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: clientPhone,
        })
      )
    }

    if (ADMIN_PHONE) {
      notifications.push(
        twilioClient.messages.create({
          body: `NEW BOOKING: ${data.fullName} - ${msgTemplate}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: ADMIN_PHONE,
        })
      )
    }

    const results = await Promise.allSettled(notifications)
    results.forEach((res, i) => {
      if (res.status === "rejected") console.error("SMS Failed:", res.reason)
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
