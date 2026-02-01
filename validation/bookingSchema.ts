import { z } from "zod"

export const bookingSchema = z.object({
  // EXACT match to frontend
  type: z.enum(["NORMAL", "VIP", "HOME"]),

  services: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
      })
    )
    .min(1),

  date: z.string(), // ISO string from frontend
  time: z.string(),

  totalPrice: z.number(),

  fullName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})
