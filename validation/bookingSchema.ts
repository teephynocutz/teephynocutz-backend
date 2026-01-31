import { z } from "zod"

export const bookingSchema = z.object({
  type: z.enum(["NORMAL", "VIP", "HOME"]),

  date: z.string().datetime(),
  time: z.string().min(3),

  services: z.array(
    z.object({
      name: z.string().min(1),
      price: z.number().int().positive(),
    })
  ).min(1),

  totalPrice: z.number().int().positive(),

  // Guest fields (optional, validated conditionally)
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).optional(),
})
