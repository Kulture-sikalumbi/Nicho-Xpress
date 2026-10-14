"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export default function QuickRequest() {
  const [item, setItem] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanItem = item.trim();
    if (!cleanItem) return;

    window.dispatchEvent(new CustomEvent("nicho-xpress:request-item", { detail: cleanItem }));
    document.getElementById("request")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <aside className="quick-request-card" aria-labelledby="quick-request-title">
      <span className="quick-request-kicker">A PERSONAL SHOPPING SERVICE</span>
      <h2 id="quick-request-title">Want something<br />from anywhere?</h2>
      <p>Drop a link or tell us what you have in mind. We’ll help with the next step.</p>
      <form onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="quick-item">Product name or link</label>
        <input
          id="quick-item"
          type="text"
          value={item}
          onChange={(event) => setItem(event.target.value)}
          placeholder="Paste a link or name an item"
          minLength={3}
          maxLength={2000}
          required
        />
        <button type="submit">Request a quote <span aria-hidden="true">↗</span></button>
      </form>
      <span className="quick-request-note"><span aria-hidden="true">✓</span> No payment to ask. We’ll confirm the price first.</span>
    </aside>
  );
}
