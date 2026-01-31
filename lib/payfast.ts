import crypto from "crypto";

export type PayFastData = Record<string, string>;

export function generateSignature(
  data: PayFastData,
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
