import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

function generateSignature(
  data: Record<string, string>,
  passPhrase?: string
) {
  let pfOutput = "";

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      if (value !== "") {
        pfOutput += `${key}=${encodeURIComponent(value.trim()).replace(
          /%20/g,
          "+"
        )}&`;
      }
    }
  }

  let getString = pfOutput.slice(0, -1);

  if (passPhrase) {
    getString += `&passphrase=${encodeURIComponent(
      passPhrase.trim()
    ).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(getString).digest("hex");
}

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const params = new URLSearchParams(bodyText);

  const data: Record<string, string> = {};
  params.forEach((value, key) => {
    data[key] = value;
  });

  const receivedSignature = data.signature;
  delete data.signature;

  // 1️⃣ Validate signature
  const calculatedSignature = generateSignature(
    data,
    process.env.PAYFAST_PASSPHRASE
  );

  if (receivedSignature !== calculatedSignature) {
    console.error("❌ Invalid PayFast signature");
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // 2️⃣ Validate merchant ID
  if (data.merchant_id !== process.env.PAYFAST_MERCHANT_ID) {
    console.error("❌ Invalid merchant ID");
    return new NextResponse("Invalid merchant", { status: 400 });
  }

  // 3️⃣ Validate amount (example)
  const expectedAmount = "100.00"; // replace with DB lookup
  if (data.amount_gross !== expectedAmount) {
    console.error("❌ Amount mismatch");
    return new NextResponse("Invalid amount", { status: 400 });
  }

  // 4️⃣ Payment status
  if (data.payment_status === "COMPLETE") {
    console.log("✅ Payment successful:", {
      orderId: data.m_payment_id,
      pfPaymentId: data.pf_payment_id,
    });

    // TODO: mark order as PAID in DB
  } else {
    console.log("ℹ️ Payment status:", data.payment_status);
  }

  // IMPORTANT: always return 200 OK
  return new NextResponse("OK", { status: 200 });
}
