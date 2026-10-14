import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requestStatuses } from "@/lib/request-status";

export const runtime = "nodejs";

const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  if (
    typeof body.id !== "string" || !requestIdPattern.test(body.id) ||
    typeof body.status !== "string" || !requestStatuses.includes(body.status as (typeof requestStatuses)[number])
  ) {
    return NextResponse.json({ error: "Choose a valid request status." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { claims } } = await supabase.auth.getClaims();
  if (!claims) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { data: isStaff, error: staffError } = await supabase.rpc("is_nicho_xpress_staff");
  if (staffError || !isStaff) {
    return NextResponse.json({ error: "This account does not have staff access." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("custom_sourcing_requests")
    .update({ status: body.status as (typeof requestStatuses)[number] })
    .eq("id", body.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Staff request update failed:", error.code ?? "unknown_error");
    return NextResponse.json({ error: "Couldn't update this request. Please try again." }, { status: 503 });
  }
  if (!data) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
