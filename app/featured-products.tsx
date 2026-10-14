"use client";

import { useEffect, useRef, useState } from "react";

type FeaturedProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string | null;
  availability: "in_zambia" | "source_to_order";
  price_zmw: number | string | null;
  source_name: string | null;
  product_url: string | null;
};

type SearchDetail = { query: string; products: FeaturedProduct[]; error?: string };

function formatListingPrice(price: number | string | null) {
  if (price === null) return null;
  const amount = typeof price === "number" ? price : Number(price);
  if (!Number.isFinite(amount)) return null;
  return `ZMW ${new Intl.NumberFormat("en-ZM", { maximumFractionDigits: 2 }).format(amount)}`;
}

function requestItem(item: string) {
  window.dispatchEvent(new CustomEvent("nicho-xpress:request-item", { detail: item }));
}

function matchesCategory(product: FeaturedProduct, category: string) {
  if (category === "all") return true;
  if (category === "in_zambia" || category === "source_to_order") return product.availability === category;
  const value = product.category.toLocaleLowerCase();
  const wanted = category.toLocaleLowerCase();
  if (wanted === "electronics") return value.includes("electronic") || value.includes("tech") || value.includes("phone");
  if (wanted === "solar") return value.includes("solar") || value.includes("power");
  if (wanted === "fashion") return value.includes("fashion") || value.includes("footwear");
  return value === wanted;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState<SearchDetail | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<FeaturedProduct | null>(null);
  const productTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/catalog?featured=1", { headers: { Accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error("Featured listings are unavailable.");
        return (await response.json()) as { products?: FeaturedProduct[] };
      })
      .then((result) => {
        if (active) setProducts(result.products ?? []);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;

    const trigger = productTriggerRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProduct(null);
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = document.querySelector<HTMLElement>(".nx-product-detail-modal");
      const focusable = dialog?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.classList.add("nx-modal-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("nx-modal-open");
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [selectedProduct]);

  useEffect(() => {
    function receiveFilter(event: Event) {
      const category = (event as CustomEvent<string>).detail;
      if (typeof category === "string") setActiveFilter(category);
    }
    function receiveSearch(event: Event) {
      const detail = (event as CustomEvent<SearchDetail>).detail;
      if (detail && typeof detail.query === "string") setSearch(detail);
    }
    function clearSearch() {
      setSearch(null);
    }

    window.addEventListener("nicho-xpress:catalog-filter", receiveFilter);
    window.addEventListener("nicho-xpress:catalog-results", receiveSearch);
    window.addEventListener("nicho-xpress:clear-search", clearSearch);
    return () => {
      window.removeEventListener("nicho-xpress:catalog-filter", receiveFilter);
      window.removeEventListener("nicho-xpress:catalog-results", receiveSearch);
      window.removeEventListener("nicho-xpress:clear-search", clearSearch);
    };
  }, []);

  if (!loaded) {
    return <div className="featured-loading nx-product-grid" role="status" aria-label="Loading items"><span /><span /><span /><span /></div>;
  }

  const sourceProducts = search ? search.products : products;
  const visibleProducts = sourceProducts.filter((product) => {
    if (!matchesCategory(product, activeFilter)) return false;
    return true;
  });

  return (
    <>
      {search && (
        <div className="nx-search-summary" role="status" aria-live="polite">
          <div className="nx-summary-mark" aria-hidden="true">⌕</div>
          <div>
            <strong>Results for &ldquo;{search.query}&rdquo;</strong>
            <p>{search.error || (visibleProducts.length > 0 ? `${visibleProducts.length} matching ${visibleProducts.length === 1 ? "item" : "items"} in our catalogue.` : "No direct match found. We can check whether we can source it for you.")}</p>
          </div>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("nicho-xpress:clear-search"))}>Clear search</button>
        </div>
      )}

      {visibleProducts.length > 0 ? (
        <div className="featured-grid nx-product-grid">
          {visibleProducts.map((product) => (
            <article className="featured-card nx-product-card" key={product.id}>
              <button
                type="button"
                className="nx-product-card-trigger"
                aria-label={`View ${product.name} details`}
                onClick={(event) => {
                  productTriggerRef.current = event.currentTarget;
                  setSelectedProduct(product);
                }}
              />
              <div className="featured-image-wrap nx-product-image">
                {product.image_url ? (
                  // Retail images are supplied by the store team and may use different HTTPS hosts.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="featured-image"
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                      const fallback = event.currentTarget.parentElement?.querySelector<HTMLElement>(".featured-image-fallback");
                      if (fallback) fallback.hidden = false;
                    }}
                  />
                ) : <span className="featured-image-fallback" aria-hidden="true">nx</span>}
                {product.image_url && <span className="featured-image-fallback" aria-hidden="true" hidden>nx</span>}
                <span className={`featured-badge nx-stock-badge ${product.availability === "in_zambia" ? "is-local" : "is-import"}`}>
                  {product.availability === "in_zambia" ? "⚡ Local stock" : "✈ Import to order"}
                </span>
              </div>
              <div className="featured-info nx-product-info">
                <span className="featured-category">{product.category}</span>
                <h3>{product.name}</h3>
                <p className="featured-description">{product.description}</p>
                <span className="featured-price">
                  {formatListingPrice(product.price_zmw) ?? "Ask for a price in kwacha"}
                </span>
                <div className="nx-product-trust"><span aria-hidden="true">✓</span> Full delivered price confirmed in your quote</div>
                <div className="featured-card-actions nx-product-actions">
                  <button
                    type="button"
                    className="featured-request"
                    aria-label={`Add ${product.name} to your quote request`}
                    onClick={() => window.dispatchEvent(new CustomEvent("nicho-xpress:add-to-quote", { detail: { id: product.id, name: product.name } }))}
                  >
                    Add to request list <span aria-hidden="true">＋</span>
                  </button>
                  {product.product_url && product.source_name && (
                    <a href={product.product_url} target="_blank" rel="noreferrer">See at {product.source_name} <span aria-hidden="true">↗</span></a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="nx-search-fallback">
          <span className="nx-fallback-kicker">✦ NICHO-XPRESS SOURCING</span>
          <h3>{search?.error ? "Store search is unavailable right now." : search ? <>We couldn&apos;t find <span>&ldquo;{search.query}&rdquo;</span> in the catalogue.</> : "More finds are on the way."}</h3>
          <p>{search?.error ? "You can still send us the product name or a link, and we’ll take a look." : "Tell us what you’re looking for. We’ll check the details and send a quote in kwacha before you decide."}</p>
          {search && <button type="button" onClick={() => requestItem(search.query)}>Request this item <span aria-hidden="true">↗</span></button>}
          {!search && <button type="button" onClick={() => requestItem("")}>Request an item <span aria-hidden="true">↗</span></button>}
        </div>
      )}
      {selectedProduct && (
        <div
          className="nx-overlay-wrap nx-product-detail-wrap"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedProduct(null);
          }}
        >
          <section
            className="nx-overlay-card nx-product-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nx-product-detail-title"
          >
            <button
              className="nx-icon-close nx-overlay-close"
              type="button"
              aria-label="Close product details"
              autoFocus
              onClick={() => setSelectedProduct(null)}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
            <div className="nx-product-detail-layout">
              <div className="nx-product-detail-image">
                {selectedProduct.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                      const fallback = event.currentTarget.parentElement?.querySelector<HTMLElement>(".nx-product-detail-fallback");
                      if (fallback) fallback.hidden = false;
                    }}
                  />
                ) : null}
                <span className="nx-product-detail-fallback" aria-hidden={Boolean(selectedProduct.image_url)} hidden={Boolean(selectedProduct.image_url)}>nx</span>
                <span className={`featured-badge nx-stock-badge ${selectedProduct.availability === "in_zambia" ? "is-local" : "is-import"}`}>
                  {selectedProduct.availability === "in_zambia" ? "Local stock" : "Import to order"}
                </span>
              </div>
              <div className="nx-product-detail-copy">
                <span className="featured-category">{selectedProduct.category}</span>
                <h2 id="nx-product-detail-title">{selectedProduct.name}</h2>
                <p>{selectedProduct.description}</p>
                <strong className="nx-product-detail-price">
                  {formatListingPrice(selectedProduct.price_zmw) ?? "Ask for a price in kwacha"}
                </strong>
                <div className="nx-product-detail-trust"><span aria-hidden="true">&#10003;</span> Full delivered price confirmed in your quote</div>
                <button
                  type="button"
                  className="nx-product-detail-request"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("nicho-xpress:add-to-quote", {
                      detail: { id: selectedProduct.id, name: selectedProduct.name },
                    }));
                    setSelectedProduct(null);
                  }}
                >
                  Add to request list <span aria-hidden="true">+</span>
                </button>
                {selectedProduct.product_url && selectedProduct.source_name && (
                  <a className="nx-product-detail-source" href={selectedProduct.product_url} target="_blank" rel="noreferrer">
                    See at {selectedProduct.source_name} <span aria-hidden="true">&#8599;</span>
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
