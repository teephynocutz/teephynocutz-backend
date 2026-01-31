"use client";

export default function CartPage() {
  const checkout = async () => {
    const res = await fetch("/api/payfast", {
      method: "POST",
    });

    const html = await res.text();
    document.open();
    document.write(html);
    document.close();
  };

  return (
    <div style={{ padding: 40 }} className="bg-orange-200 text-black">
      <h1>Shopping Cart</h1>
      <p>Test Item — R100.00</p>

      <button
        className="bg-green-500 shadow rounded-full p-4 hover:cusor-pointer"
        onClick={checkout}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 16,
        }}
      >
        Pay with PayFast (Sandbox)
      </button>
    </div>
  );
}
