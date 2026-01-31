import PayPalButton from "@/components/PayPalButton"

const cartItems = [
  { id: 1, name: "T-Shirt", price: 20, quantity: 2 },
  { id: 2, name: "Shoes", price: 50, quantity: 1 },
]

export default function CheckoutPage() {
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {cartItems.map((item) => (
        <div key={item.id} className="flex justify-between mb-2">
          <span>
            {item.name} x {item.quantity}
          </span>
          <span>${item.price * item.quantity}</span>
        </div>
      ))}

      <div className="mt-6 bg-red">
        <PayPalButton cartItems={cartItems} />
      </div>
    </div>
  )
}
