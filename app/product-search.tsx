"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  image_url: string | null;
  availability: "in_zambia" | "source_to_order";
  price_zmw: number | string | null;
  source_name: string | null;
  product_url: string | null;
};

type SearchResponse = { products?: CatalogProduct[]; error?: string };

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const searchFor = useCallback(async (value: string) => {
    const cleanQuery = value.trim();
    if (cleanQuery.length < 2) return;

    setQuery(cleanQuery);
    setLoading(true);

    try {
      const response = await fetch(`/api/catalog?q=${encodeURIComponent(cleanQuery)}`, {
        headers: { Accept: "application/json" },
      });
      const result = (await response.json()) as SearchResponse;
      window.dispatchEvent(new CustomEvent("nicho-xpress:catalog-results", {
        detail: {
          query: cleanQuery,
          products: response.ok ? result.products ?? [] : [],
          error: response.ok ? "" : result.error || "Store search is unavailable right now.",
        },
      }));
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      window.dispatchEvent(new CustomEvent("nicho-xpress:catalog-results", {
        detail: { query: cleanQuery, products: [], error: "We couldn't search the store just now." },
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void searchFor(query);
  }

  useEffect(() => {
    function receiveSearch(event: Event) {
      const value = (event as CustomEvent<string>).detail;
      if (typeof value === "string") void searchFor(value);
    }
    function clearSearch() {
      setQuery("");
    }
    window.addEventListener("nicho-xpress:search", receiveSearch);
    window.addEventListener("nicho-xpress:clear-search", clearSearch);
    return () => {
      window.removeEventListener("nicho-xpress:search", receiveSearch);
      window.removeEventListener("nicho-xpress:clear-search", clearSearch);
    };
  }, [searchFor]);

  return (
    <div className="product-search nx-search">
      <label className="search-label" htmlFor="store-search">Search the Nicho-Xpress catalogue</label>
      <form className="search-form" onSubmit={handleSearch} role="search">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.4 4.4" />
        </svg>
        <input
          id="store-search"
          type="search"
          value={query}
          disabled={loading}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="What do you want to buy or order today?"
          minLength={2}
          maxLength={2000}
          autoComplete="off"
        />
        <button type="submit" disabled={loading || query.trim().length < 2}>
          {loading ? "Searching…" : "Find It"}<span aria-hidden="true">✦</span>
        </button>
      </form>
    </div>
  );
}
