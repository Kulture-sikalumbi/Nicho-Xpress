import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const genericFailure = "We couldn't send your request right now. Please try again shortly.";

function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (text.length === 0 || text.length > maxLength) return null;
  return text;
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  const form = payload as Record<string, unknown>;

  // Quietly discard likely bot submissions without confirming that the honeypot worked.
  if (typeof form.website === "string" && form.website.trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const customerName = readText(form.name, 80);
  const itemRequest = readText(form.item, 2000);
  const phone = readText(form.phone, 32);
  const notes = form.notes === "" || form.notes == null ? null : readText(form.notes, 1200);
  const hasImagePath = form.imagePath != null && form.imagePath !== "";
  const imagePath = hasImagePath ? readText(form.imagePath, 128) : null;
  const validImagePath = !hasImagePath || Boolean(
    imagePath && /^requests\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/.test(imagePath),
  );

  if (
    !customerName || customerName.length < 2 ||
    !itemRequest || itemRequest.length < 3 ||
    !phone || phone.length < 7 ||
    (form.notes != null && form.notes !== "" && !notes) ||
    !validImagePath
  ) {
    return NextResponse.json(
      { error: "Check the item, name, phone number and notes, then try again." },
      { status: 400 },
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !publishableKey) {
    return NextResponse.json({ error: genericFailure }, { status: 503 });
  }

  try {
    const supabase = createClient(supabaseUrl, publishableKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const newRequest = {
      customer_name: customerName,
      item_request: itemRequest,
      phone,
      notes,
      ...(imagePath ? { image_path: imagePath } : {}),
    };
    const { error } = await supabase.from("custom_sourcing_requests").insert(newRequest);

    if (error) {
      // Keep customer details out of application logs.
      console.error("Supabase request insert failed:", error.code ?? "unknown_error");
      return NextResponse.json({ error: genericFailure }, { status: 503 });
    }
  } catch {
    console.error("Supabase request insert failed: network_error");
    return NextResponse.json({ error: genericFailure }, { status: 503 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
