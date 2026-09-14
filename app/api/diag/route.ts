import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const diag: Record<string, any> = {};

  // Step 1: GET /domains
  try {
    const r1 = await fetch("https://api.mail.tm/domains", {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "no-store",
    });
    const text1 = await r1.text();
    diag.domains = {
      status: r1.status,
      ok: r1.ok,
      headers: Object.fromEntries(r1.headers.entries()),
      body: text1,
    };
  } catch (err: any) {
    diag.domains = { error: err.message };
  }

  // Step 2: POST /accounts
  try {
    const randomUser = `diag${Math.random().toString(36).slice(2, 8)}`;
    const address = `${randomUser}@uberip.com`;
    const password = "Pass12345678Test!";

    const r2 = await fetch("https://api.mail.tm/accounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({ address, password }),
      cache: "no-store",
    });
    const text2 = await r2.text();
    diag.createAccount = {
      address,
      status: r2.status,
      ok: r2.ok,
      headers: Object.fromEntries(r2.headers.entries()),
      body: text2,
    };
  } catch (err: any) {
    diag.createAccount = { error: err.message };
  }

  return NextResponse.json(diag);
}
