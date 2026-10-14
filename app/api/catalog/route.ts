import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function normalizeSearch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const rawQuery = searchParams.get("q")?.trim() ?? "";
  const featuredOnly = searchParams.get("featured") === "1";

  if (!featuredOnly && (rawQuery.length < 2 || rawQuery.length > 2000)) {
    return NextResponse.json(
      { error: "Enter at least two characters to search." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const query = normalizeSearch(rawQuery);
  if (!featuredOnly && query.length < 2) {
    return NextResponse.json(
      { products: [], catalogReady: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !publishableKey) {
    return NextResponse.json(
      { error: "Store search is not connected yet." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const supabase = createClient(supabaseUrl, publishableKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (featuredOnly) {
      const { data, error } = await supabase
        .from("catalog_products")
        .select("id,name,slug,description,category,image_url,availability,price_zmw,source_name,product_url")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true })
        .limit(8);

      if (error) {
        console.error("Featured catalog lookup failed:", error.code ?? "unknown_error");
        return NextResponse.json(
          { error: "Store listings are being set up." },
          { status: 503, headers: { "Cache-Control": "no-store" } },
        );
      }

      return NextResponse.json(
        { products: data ?? [], catalogReady: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const { data, error } = await supabase.rpc("search_catalog_products", {
      search_query: query,
      result_limit: 8,
    });

    if (error) {
      console.error("Catalog search failed:", error.code ?? "unknown_error");
      return NextResponse.json(
        { error: "Store search is being set up. You can still request any item." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { products: data ?? [], catalogReady: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    console.error("Catalog search failed: network_error");
    return NextResponse.json(
      { error: "We couldn't search the store just now. You can still request any item." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
