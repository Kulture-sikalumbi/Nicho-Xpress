"use client";

import { useState } from "react";

const categories = [
  { label: "All Products", value: "all", symbol: "✳" },
  { label: "Local Stock", value: "in_zambia", symbol: "⚡" },
  { label: "Overseas Imports", value: "source_to_order", symbol: "✈" },
  { label: "Electronics", value: "Electronics", symbol: "" },
  { label: "Solar & Power", value: "Solar", symbol: "" },
  { label: "Fashion", value: "Fashion", symbol: "" },
];

export default function CatalogNav() {
  const [active, setActive] = useState("all");

  function selectCategory(value: string) {
    setActive(value);
    window.dispatchEvent(new CustomEvent("nicho-xpress:catalog-filter", { detail: value }));
  }

  return (
    <nav className="catalog-nav nx-category-nav" aria-label="Filter products by category">
      <div className="catalog-nav-inner nx-category-inner">
        <span className="nx-category-label">FILTER:</span>
        {categories.map((category, index) => (
          <button
            type="button"
            key={category.value}
            className={`${active === category.value ? "active" : ""}${index === 0 ? " catalog-nav-all" : ""}`}
            aria-pressed={active === category.value}
            onClick={() => selectCategory(category.value)}
          >
            {category.symbol && <span aria-hidden="true">{category.symbol}</span>}{category.label}
          </button>
        ))}
        <button className="nx-unlisted-link" type="button" onClick={() => window.dispatchEvent(new CustomEvent("nicho-xpress:open-request"))}>
          <span aria-hidden="true">＋</span> Unlisted item? Request it
        </button>
      </div>
    </nav>
  );
}
