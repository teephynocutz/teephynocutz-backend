// import { NextRequest, NextResponse } from "next/server"
// import { Resend } from "resend"
// import { prisma } from "@/lib/prisma"
// import { contactEmailTemplate } from "@/lib/emails/contact-email"
// import { confirmationEmailTemplate } from "@/lib/emails/confirmation-email"
// import { redirect } from "next/navigation"

// const resend = process.env.RESEND_API_KEY
//   ? new Resend(process.env.RESEND_API_KEY)
//   : null

// export async function POST(req: NextRequest) {

//   try {
//     const body = await req.json()

//     const { name, email, phone, subject, message } = body

//     // ✅ Basic validation
//     if (!name || !email || !message) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields." },
//         { status: 400 }
//       )
//     }

//     // ✅ Persist inquiry (FAST)
//     const inquiry = await prisma.inquiry.create({
//       data: { name, email, phone, subject, message },
//     })

//     // ✅ Fire-and-forget email (non-blocking)
//     if (resend && inquiry) {
//       try {
//         /* ---------- EMAILS (NON-BLOCKING) ---------- */
//         Promise.allSettled([
//           resend.emails.send({
//             from: process.env.RESEND_FROM!,
//             to: ['teephynocutz@gmail.com'],
//             subject: `🔔🔔Teephyno New Booking: ${subject}`,
//             html: contactEmailTemplate({ name, email, phone, subject, message }),
//           }),
//           resend.emails.send({
//             from: process.env.RESEND_FROM!,
//             to: email,
//             subject: 'Thanks for contacting MD Travels',
//             html: confirmationEmailTemplate(name),
//           }),
//         ])
        
//       } catch(err) {
//         console.error("[CONTACT_EMAIL_ERROR]", err)
//       }
      
//     }


    
//   } catch (error) {
//     console.error("[CONTACT_API_ERROR]", error)
//     return NextResponse.json(
//       { success: false, message: "Internal server error." },
//       { status: 500 }
//     )
//   }

//   // 🔥 Redirect immediately
//   redirect("/confirmation")
// }
