"use client"

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

export default function PayPalButton({ cartItems }: { cartItems: any[] }) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: "USD",
      }}
    >
      <PayPalButtons
        createOrder={async () => {
          const res = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartItems }),
          })

          const data = await res.json()
          return data.orderID
        }}
        onApprove={async (data) => {
          await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID }),
          })

          alert("Payment successful 🎉")
        }}
      />
    </PayPalScriptProvider>
  )
}
