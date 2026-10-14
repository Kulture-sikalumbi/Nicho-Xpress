"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import RequestForm from "./request-form";

type QuoteItem = { id: string; name: string };

function emit(name: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

async function encodeAssistantImage(file: File) {
  let imageBlob: Blob = file;
  let mimeType = file.type;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
    if (scale < 1 || file.size > 900 * 1024) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      context?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const compressed = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
      if (compressed) {
        imageBlob = compressed;
        mimeType = "image/jpeg";
      }
    }
    bitmap.close();
  } catch {
    // Keep the original supported image if this browser cannot resize it.
  }

  const bytes = new Uint8Array(await imageBlob.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return { mimeType, data: btoa(binary) };
}

function Icon({ name }: { name: "bag" | "close" | "sparkles" | "camera" | "plus" | "trash" }) {
  const paths: Record<typeof name, ReactNode> = {
    bag: <><path d="M5 8h14l1 12H4L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    sparkles: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></>,
    camera: <><path d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z" /><circle cx="12" cy="13" r="3.5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    trash: <><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function MarketplaceHeaderActions() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    function updateCount(event: Event) {
      const value = (event as CustomEvent<number>).detail;
      if (typeof value === "number") setCount(value);
    }
    window.addEventListener("nicho-xpress:quote-count", updateCount);
    return () => window.removeEventListener("nicho-xpress:quote-count", updateCount);
  }, []);

  return (
    <div className="nx-header-actions">
      <button className="nx-custom-order" type="button" onClick={() => emit("nicho-xpress:open-request")}>
        <span aria-hidden="true">?</span> Custom Order
      </button>
      <button className="nx-quote-list-button" type="button" aria-label={`Open request list, ${count} items`} onClick={() => emit("nicho-xpress:open-quote-list")}>
        <Icon name="bag" /><span className="nx-quote-count">{count}</span>
      </button>
    </div>
  );
}

export function MarketplaceRequestButton() {
  return <button type="button" onClick={() => emit("nicho-xpress:open-request")}>Request an item <span aria-hidden="true">?</span></button>;
}

export default function MarketplaceOverlays() {
  const [requestOpen, setRequestOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [requestItem, setRequestItem] = useState("");
  const [requestImage, setRequestImage] = useState<File | null>(null);
  const [assistantQuery, setAssistantQuery] = useState("");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const assistantAutoTriggered = useRef(false);

  useEffect(() => {
    function openRequest(event?: Event) {
      const detail = event ? (event as CustomEvent<string>).detail : "";
      assistantAutoTriggered.current = true;
      setRequestItem(typeof detail === "string" ? detail : "");
      setRequestImage(null);
      setRequestOpen(true);
      setAssistantOpen(false);
      setQuoteOpen(false);
    }
    function openAssistant(event?: Event) {
      const detail = event ? (event as CustomEvent<string>).detail : "";
      assistantAutoTriggered.current = true;
      setAssistantQuery(typeof detail === "string" ? detail : "");
      setAssistantOpen(true);
      setRequestOpen(false);
      setQuoteOpen(false);
    }
    function openQuoteList() {
      setQuoteOpen(true);
      setRequestOpen(false);
      setAssistantOpen(false);
      setRequestImage(null);
    }
    function addQuoteItem(event: Event) {
      const detail = (event as CustomEvent<QuoteItem>).detail;
      if (!detail || typeof detail.id !== "string" || typeof detail.name !== "string") return;
      setQuoteItems((current) => current.some((item) => item.id === detail.id) ? current : [...current, detail]);
    }

    window.addEventListener("nicho-xpress:open-request", openRequest);
    window.addEventListener("nicho-xpress:request-item", openRequest);
    window.addEventListener("nicho-xpress:open-assistant", openAssistant);
    window.addEventListener("nicho-xpress:open-quote-list", openQuoteList);
    window.addEventListener("nicho-xpress:add-to-quote", addQuoteItem);
    return () => {
      window.removeEventListener("nicho-xpress:open-request", openRequest);
      window.removeEventListener("nicho-xpress:request-item", openRequest);
      window.removeEventListener("nicho-xpress:open-assistant", openAssistant);
      window.removeEventListener("nicho-xpress:open-quote-list", openQuoteList);
      window.removeEventListener("nicho-xpress:add-to-quote", addQuoteItem);
    };
  }, []);

  useEffect(() => {
    let userScrollIntent = false;
    const markUserScrollIntent = () => { userScrollIntent = true; };
    const markKeyboardScrollIntent = (event: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " ", "End"].includes(event.key)) userScrollIntent = true;
    };
    function maybeOpenAssistant() {
      if (assistantAutoTriggered.current || !userScrollIntent) return;
      if (window.scrollY < document.documentElement.scrollHeight * 0.25) return;
      assistantAutoTriggered.current = true;
      if (requestOpen || assistantOpen || quoteOpen) return;
      setAssistantQuery("");
      setAssistantOpen(true);
    }

    window.addEventListener("wheel", markUserScrollIntent, { passive: true });
    window.addEventListener("touchmove", markUserScrollIntent, { passive: true });
    window.addEventListener("keydown", markKeyboardScrollIntent);
    window.addEventListener("scroll", maybeOpenAssistant, { passive: true });
    return () => {
      window.removeEventListener("wheel", markUserScrollIntent);
      window.removeEventListener("touchmove", markUserScrollIntent);
      window.removeEventListener("keydown", markKeyboardScrollIntent);
      window.removeEventListener("scroll", maybeOpenAssistant);
    };
  }, [requestOpen, assistantOpen, quoteOpen]);

  useEffect(() => { emit("nicho-xpress:quote-count", quoteItems.length); }, [quoteItems.length]);

  useEffect(() => {
    const overlayOpen = requestOpen || assistantOpen || quoteOpen;
    if (!overlayOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setRequestOpen(false);
        setRequestImage(null);
        setAssistantOpen(false);
        setQuoteOpen(false);
      }
    };
    document.body.classList.add("nx-modal-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("nx-modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [requestOpen, assistantOpen, quoteOpen]);

  function requestFromAssistant(item: string, image: File | null) {
    setRequestItem(item);
    setRequestImage(image);
    setAssistantOpen(false);
    setRequestOpen(true);
  }
  function closeRequest() {
    setRequestOpen(false);
    setRequestImage(null);
  }
  function requestQuoteForList() {
    setRequestItem(quoteItems.map((item) => item.name).join(", "));
    setQuoteOpen(false);
    setRequestOpen(true);
  }
  function removeQuoteItem(id: string) {
    setQuoteItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <>
      <div className="nx-floating-assistant">
        <button type="button" onClick={() => emit("nicho-xpress:open-assistant")}>
          <Icon name="sparkles" /><span>What are you looking to buy?</span>
        </button>
      </div>
      {assistantOpen && <AssistantModal initialQuery={assistantQuery} onClose={() => setAssistantOpen(false)} onRequest={requestFromAssistant} />}
      {requestOpen && (
        <OverlayFrame label="Custom direct sourcing request" onClose={closeRequest} className="nx-request-modal">
          <div className="nx-request-modal-heading">
            <div>
              <span className="nx-modal-kicker">? CUSTOM SOURCING CONCIERGE</span>
              <h2>What do you want us to find?</h2>
              <p>Share the details and we&apos;ll search for it. We&apos;ll contact you with availability, delivery timing and a quote before you decide.</p>
            </div>
            <button className="nx-icon-close" type="button" aria-label="Close request form" onClick={closeRequest}><Icon name="close" /></button>
          </div>
          <div className="nx-request-form-wrap"><RequestForm initialItem={requestItem} initialImage={requestImage} /></div>
        </OverlayFrame>
      )}
      {quoteOpen && (
        <>
          <button className="nx-overlay-scrim nx-drawer-scrim" type="button" aria-label="Close request list" onClick={() => setQuoteOpen(false)} />
          <aside className="nx-quote-drawer" aria-label="Your request list">
            <div className="nx-drawer-heading">
              <div><Icon name="bag" /><h2>Your request list</h2></div>
              <button className="nx-icon-close" type="button" aria-label="Close request list" onClick={() => setQuoteOpen(false)}><Icon name="close" /></button>
            </div>
            <div className="nx-drawer-items">
              {quoteItems.length > 0 ? quoteItems.map((item) => (
                <div className="nx-quote-item" key={item.id}>
                  <span className="nx-quote-item-mark" aria-hidden="true">nx</span>
                  <strong>{item.name}</strong>
                  <button type="button" aria-label={`Remove ${item.name}`} onClick={() => removeQuoteItem(item.id)}><Icon name="trash" /></button>
                </div>
              )) : (
                <div className="nx-empty-quote"><Icon name="bag" /><strong>Your request list is empty.</strong><p>Add items from the catalogue and ask us to check them together.</p></div>
              )}
            </div>
            <div className="nx-drawer-footer">
              <p>We&apos;ll confirm availability and the full delivered price in your quote.</p>
              <button type="button" onClick={requestQuoteForList} disabled={quoteItems.length === 0}>Request a quote <span aria-hidden="true">?</span></button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

type AssistantProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string | null;
  availability: "in_zambia" | "source_to_order";
  price_zmw: number | string | null;
};

function AssistantModal({
  initialQuery,
  onClose,
  onRequest,
}: {
  initialQuery: string;
  onClose: () => void;
  onRequest: (item: string, image: File | null) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [lookupState, setLookupState] = useState<"input" | "checking" | "results">("input");
  const [products, setProducts] = useState<AssistantProduct[]>([]);
  const [interpretedItem, setInterpretedItem] = useState("");
  const [inputError, setInputError] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(photo);
    setPhotoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setInputError("Choose a JPG, PNG or WebP photo.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setInputError("The photo must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    setPhoto(file);
    setInterpretedItem(query.trim());
    setInputError("");
  }

  function startRequest() {
    const item = query.trim();
    if (item.length < 3 && !photo) {
      setInputError("Describe the item or attach a photo first.");
      return;
    }
    const requestItem = interpretedItem.trim() || item;
    onRequest(requestItem.length >= 3 ? requestItem : "Item shown in attached photo", photo);
  }

  async function checkCatalog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchQuery = query.trim();
    if (searchQuery.length < 2 && !photo) {
      setInputError("Enter at least two characters or attach a photo.");
      return;
    }

    setLookupState("checking");
    setInputError("");
    setInterpretedItem(searchQuery);
    try {
      const image = photo ? await encodeAssistantImage(photo) : undefined;
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: searchQuery, image }),
      });
      const result = (await response.json()) as { products?: AssistantProduct[]; itemName?: string };
      if (!response.ok) throw new Error("Assistant lookup unavailable");
      setProducts(result.products ?? []);
      setInterpretedItem(result.itemName || searchQuery);
      setLookupState("results");
    } catch {
      // Keep the customer moving to a quote if interpretation or search is unavailable.
      try {
        const response = searchQuery.length >= 2
          ? await fetch(`/api/catalog?q=${encodeURIComponent(searchQuery)}`, { headers: { Accept: "application/json" } })
          : null;
        const result = response?.ok ? await response.json() as { products?: AssistantProduct[] } : null;
        setProducts(result?.products ?? []);
      } catch {
        setProducts([]);
      }
      setInterpretedItem(searchQuery);
      setLookupState("results");
    }
  }

  function useProduct(product: AssistantProduct) {
    onRequest(product.name, photo);
  }

  return (
    <OverlayFrame label="Nicho-Xpress Smart Assistant" onClose={onClose} className="nx-assistant-modal">
      <div className="nx-modal-title-row">
        <span className="nx-assistant-icon"><Icon name="sparkles" /></span>
        <div><span className="nx-modal-kicker">NICHO-XPRESS SMART ASSISTANT</span><h2>What are you trying to find?</h2></div>
      </div>
      <p className="nx-modal-intro">Describe an item or attach a product photo. We&apos;ll identify it, check our listings and help source it if needed.</p>

      {lookupState === "input" && (
        <>
          <form className="nx-assistant-form" onSubmit={(event) => void checkCatalog(event)}>
            <label className="nx-assistant-photo-button" htmlFor="assistant-photo"><Icon name="camera" /><span>Attach photo</span></label>
            <input ref={photoInputRef} id="assistant-photo" className="nx-assistant-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} />
            <label className="visually-hidden" htmlFor="assistant-query">Item name or description</label>
            <input id="assistant-query" value={query} onChange={(event) => { setQuery(event.target.value); setInterpretedItem(event.target.value.trim()); }} maxLength={2000} placeholder="e.g. solar generator, headphones, car part" autoFocus />
            <button type="submit" disabled={query.trim().length < 2 && !photo}>Find it for me <span aria-hidden="true">?</span></button>
          </form>
          {photoPreview && (
            <div className="nx-assistant-photo-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="Selected product reference" />
              <span>{photo?.name}</span>
              <button type="button" aria-label="Remove attached photo" onClick={() => { setPhoto(null); if (photoInputRef.current) photoInputRef.current.value = ""; }}><Icon name="trash" /></button>
            </div>
          )}
          {inputError && <p className="nx-assistant-error" role="alert">{inputError}</p>}
          <button className="nx-modal-secondary" type="button" disabled={!query.trim() && !photo} onClick={startRequest}>
            Send a quote request with these details <span aria-hidden="true">?</span>
          </button>
          <p className="nx-assistant-tip"><Icon name="camera" /> We use AI to help identify the product. Your photo is also attached to the request for our sourcing team.</p>
        </>
      )}

      {lookupState === "checking" && (
        <div className="nx-assistant-checking" role="status" aria-live="polite">
          <span className="nx-assistant-spinner" aria-hidden="true" />
          <strong>Let&apos;s find the right item...</strong>
          <p>We&apos;re identifying it and checking Nicho-Xpress listings.</p>
        </div>
      )}

      {lookupState === "results" && (
        <div className="nx-assistant-results" aria-live="polite">
          {products.length > 0 ? (
            <>
              <div className="nx-assistant-result-heading"><span className="nx-assistant-result-tag">OPTIONS FOR {interpretedItem || "YOUR REQUEST"}</span><button type="button" onClick={() => setLookupState("input")}>Search again</button></div>
              {products.slice(0, 4).map((product) => (
                <article className="nx-assistant-product" key={product.id}>
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image_url} alt="" />
                  ) : <span className="nx-assistant-product-placeholder" aria-hidden="true">nx</span>}
                  <div>
                    <span className={`nx-assistant-stock ${product.availability === "in_zambia" ? "is-local" : "is-source"}`}>
                      {product.availability === "in_zambia" ? "Listed as local stock" : "Source-to-order listing"}
                    </span>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    {product.availability === "source_to_order" && <p className="nx-assistant-delivery">Typical overseas delivery is around 3 weeks. We&apos;ll confirm timing and the full ZMW price before you decide.</p>}
                    <button type="button" onClick={() => useProduct(product)}>Ask for a quote <span aria-hidden="true">?</span></button>
                  </div>
                </article>
              ))}
              <button type="button" className="nx-modal-secondary" onClick={startRequest}>Can&apos;t see the right version? Tell us what you need <span aria-hidden="true">?</span></button>
            </>
          ) : (
            <div className="nx-assistant-result-empty">
              <span className="nx-assistant-result-tag">PERSONAL SOURCING</span>
              <h3>{interpretedItem ? `Looking for ${interpretedItem}?` : "We can help source this item"}</h3>
              <p>Tell us what you need and our sourcing team will search for the right option. Typical overseas delivery is around 3 weeks; we&apos;ll confirm supplier availability, timing and the total ZMW price before you decide.</p>
              <button type="button" className="nx-assistant-primary" onClick={startRequest}>Start my sourcing request <span aria-hidden="true">?</span></button>
              <button type="button" className="nx-modal-secondary" onClick={() => setLookupState("input")}>Add or change details</button>
            </div>
          )}
        </div>
      )}
    </OverlayFrame>
  );
}

function OverlayFrame({ label, className, onClose, children }: { label: string; className: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="nx-overlay-wrap" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={`nx-overlay-card ${className}`} role="dialog" aria-modal="true" aria-label={label}>
        <button className="nx-icon-close nx-overlay-close" type="button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button>
        {children}
      </section>
    </div>
  );
}
